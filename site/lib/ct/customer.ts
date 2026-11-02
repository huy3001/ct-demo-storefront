import { randomUUID } from 'crypto';
import type {
  ByProjectKeyRequestBuilder,
  Customer,
  CustomerSignInResult,
  CustomerUpdateAction,
  Type,
  Order,
} from '@commercetools/platform-sdk';

export interface AccountB2BDetails {
  businessUnit?: string;
  company?: string;
  roles?: string[];
}

export type AccountCustomer = Customer & {
  b2b?: AccountB2BDetails;
};

export interface SignUpInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Creates a customer via the plain (admin-scoped) `/customers` endpoint — `.me().signup()`
 * requires `manage_my_profile`, which this project's API Client doesn't have (see
 * lib/ct/client.ts). Passing `anonymousId` merges the shopper's current anonymous cart into
 * the new customer's cart, same as the `.me()` flow would.
 */
export async function signUpCustomer(
  apiRoot: ByProjectKeyRequestBuilder,
  input: SignUpInput,
  anonymousId?: string
): Promise<CustomerSignInResult> {
  const { body } = await apiRoot
    .customers()
    .post({
      body: {
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        ...(anonymousId ? { anonymousId, anonymousCartSignInMode: 'MergeWithExistingCustomerCart' } : {}),
      },
    })
    .execute();
  return body;
}

/**
 * Signs a customer in via the project-level `/login` endpoint (not `.me().login()`, which
 * needs `manage_my_orders`). Merges the shopper's anonymous cart the same way.
 */
export async function signInCustomer(
  apiRoot: ByProjectKeyRequestBuilder,
  email: string,
  password: string,
  anonymousId?: string
): Promise<CustomerSignInResult> {
  const { body } = await apiRoot
    .login()
    .post({
      body: {
        email,
        password,
        ...(anonymousId ? { anonymousId, anonymousCartSignInMode: 'MergeWithExistingCustomerCart' } : {}),
      },
    })
    .execute();
  return body;
}

export async function getCustomerById(apiRoot: ByProjectKeyRequestBuilder, customerId: string): Promise<Customer> {
  const { body } = await apiRoot.customers().withId({ ID: customerId }).get().execute();
  return body;
}

export async function getCustomerB2BDetails(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
): Promise<AccountB2BDetails | undefined> {
  const businessUnit = await getCustomerBusinessUnit(apiRoot, customerId);
  if (!businessUnit) return undefined;

  const associate = businessUnit.associates.find(
    ({ customer }) => customer.id === customerId,
  );
  const roleKeys = associate?.associateRoleAssignments.map(
    ({ associateRole }) => associateRole.key,
  ) ?? [];
  const roles = roleKeys.length > 0
    ? await getOptionalB2BField(() => getAssociateRoleNames(apiRoot, roleKeys))
    : undefined;
  const company = businessUnit.unitType === 'Company'
    ? businessUnit.name
    : await getOptionalB2BField(
      () => getCompanyName(apiRoot, businessUnit.topLevelUnit.key),
    );

  return {
    businessUnit: businessUnit.name,
    ...(company ? { company } : {}),
    ...(roles?.length ? { roles } : {}),
  };
}

async function getCustomerBusinessUnit(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
) {
  try {
    const { body: businessUnits } = await apiRoot.businessUnits().get({
      queryArgs: {
        where: `associates(customer(id="${customerId}"))`,
        limit: 1,
      },
    }).execute();
    return businessUnits.results[0];
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 403 || statusCode === 404) return undefined;
    throw error;
  }
}

async function getOptionalB2BField<T>(
  getField: () => Promise<T>,
): Promise<T | undefined> {
  try {
    return await getField();
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 403 || statusCode === 404) return undefined;
    throw error;
  }
}

async function getAssociateRoleNames(
  apiRoot: ByProjectKeyRequestBuilder,
  roleKeys: string[],
): Promise<string[]> {
  const quotedKeys = roleKeys.map((key) => `"${key}"`).join(',');
  const { body } = await apiRoot.associateRoles().get({
    queryArgs: { where: `key in (${quotedKeys})`, limit: roleKeys.length },
  }).execute();
  const rolesByKey = new Map(body.results.map((role) => [role.key, role.name ?? role.key]));

  return roleKeys.flatMap((key) => {
    const role = rolesByKey.get(key);
    return role ? [role] : [];
  });
}

async function getCompanyName(
  apiRoot: ByProjectKeyRequestBuilder,
  companyKey: string,
): Promise<string | undefined> {
  const { body } = await apiRoot.businessUnits().withKey({ key: companyKey }).get().execute();
  return body.unitType === 'Company' ? body.name : undefined;
}

export async function verifyCustomerPassword(
  apiRoot: ByProjectKeyRequestBuilder,
  customer: Customer,
  password: string,
): Promise<void> {
  const { body } = await apiRoot.login().post({
    body: { email: customer.email, password },
  }).execute();

  if (body.customer.id !== customer.id) {
    throw new Error('Password does not belong to the signed-in customer');
  }
}

export async function deleteCustomer(
  apiRoot: ByProjectKeyRequestBuilder,
  customer: Customer,
): Promise<void> {
  await apiRoot
    .customers()
    .withId({ ID: customer.id })
    .delete({ queryArgs: { version: customer.version } })
    .execute();
}

export async function updateCustomerProfile(
  apiRoot: ByProjectKeyRequestBuilder,
  customer: Customer,
  fields: { firstName?: string; lastName?: string; email?: string; phone?: string }
): Promise<Customer> {
  const actions: CustomerUpdateAction[] = [];
  if (fields.firstName !== undefined) actions.push({ action: 'setFirstName' as const, firstName: fields.firstName });
  if (fields.lastName !== undefined) actions.push({ action: 'setLastName' as const, lastName: fields.lastName });
  if (fields.email !== undefined) actions.push({ action: 'changeEmail' as const, email: fields.email });
  if (fields.phone !== undefined) {
    const phoneType = await ensureCustomerPhoneType(apiRoot, customer);
    if (customer.custom) {
      if (fields.phone || typeof customer.custom.fields.phone === 'string') {
        actions.push({ action: 'setCustomField', name: 'phone', value: fields.phone || undefined });
      }
    } else {
      actions.push({
        action: 'setCustomType',
        type: { typeId: 'type', id: phoneType.id },
        fields: fields.phone ? { phone: fields.phone } : {},
      });
    }
  }

  const { body } = await apiRoot
    .customers()
    .withId({ ID: customer.id })
    .post({ body: { version: customer.version, actions } })
    .execute();
  return body;
}

async function ensureCustomerPhoneType(
  apiRoot: ByProjectKeyRequestBuilder,
  customer: Customer,
): Promise<Type> {
  const existingType = customer.custom
    ? (await apiRoot.types().withId({ ID: customer.custom.type.id }).get().execute()).body
    : await getOrCreateCustomerProfileType(apiRoot);

  if (existingType.fieldDefinitions.some((field) => field.name === 'phone')) return existingType;

  const { body } = await apiRoot
    .types()
    .withId({ ID: existingType.id })
    .post({
      body: {
        version: existingType.version,
        actions: [{
          action: 'addFieldDefinition',
          fieldDefinition: {
            name: 'phone',
            label: { en: 'Phone number' },
            required: false,
            type: { name: 'String' },
          },
        }],
      },
    })
    .execute();
  return body;
}

async function getOrCreateCustomerProfileType(apiRoot: ByProjectKeyRequestBuilder): Promise<Type> {
  try {
    return (await apiRoot.types().withKey({ key: 'customer-profile' }).get().execute()).body;
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode !== 404) throw err;
  }

  const { body } = await apiRoot.types().post({
    body: {
      key: 'customer-profile',
      name: { en: 'Customer profile' },
      resourceTypeIds: ['customer'],
      fieldDefinitions: [{
        name: 'phone',
        label: { en: 'Phone number' },
        required: false,
        type: { name: 'String' },
      }],
    },
  }).execute();
  return body;
}

export async function changeCustomerPassword(
  apiRoot: ByProjectKeyRequestBuilder,
  customer: Customer,
  currentPassword: string,
  newPassword: string
): Promise<Customer> {
  const { body } = await apiRoot
    .customers()
    .password()
    .post({ body: { id: customer.id, version: customer.version, currentPassword, newPassword } })
    .execute();
  return body;
}

export async function addCustomerAddress(
  apiRoot: ByProjectKeyRequestBuilder,
  customer: Customer,
  address: NonNullable<Customer['addresses']>[number],
  defaults: { shipping: boolean; billing: boolean },
): Promise<Customer> {
  const addressKey = randomUUID();
  const actions: CustomerUpdateAction[] = [
    { action: 'addAddress', address: { ...address, key: addressKey } },
  ];
  if (defaults.shipping) actions.push({ action: 'setDefaultShippingAddress', addressKey });
  if (defaults.billing) actions.push({ action: 'setDefaultBillingAddress', addressKey });

  const { body } = await apiRoot
    .customers()
    .withId({ ID: customer.id })
    .post({ body: { version: customer.version, actions } })
    .execute();
  return body;
}

export async function removeCustomerAddress(
  apiRoot: ByProjectKeyRequestBuilder,
  customer: Customer,
  addressId: string
): Promise<Customer> {
  const { body } = await apiRoot
    .customers()
    .withId({ ID: customer.id })
    .post({ body: { version: customer.version, actions: [{ action: 'removeAddress', addressId }] } })
    .execute();
  return body;
}

export async function updateCustomerAddress(
  apiRoot: ByProjectKeyRequestBuilder,
  customer: Customer,
  addressId: string,
  address: NonNullable<Customer['addresses']>[number],
  defaults: { shipping: boolean; billing: boolean },
): Promise<Customer> {
  const actions: CustomerUpdateAction[] = [{ action: 'changeAddress', addressId, address }];

  if (defaults.shipping) {
    actions.push({ action: 'setDefaultShippingAddress', addressId });
  } else if (customer.defaultShippingAddressId === addressId) {
    actions.push({ action: 'setDefaultShippingAddress' });
  }

  if (defaults.billing) {
    actions.push({ action: 'setDefaultBillingAddress', addressId });
  } else if (customer.defaultBillingAddressId === addressId) {
    actions.push({ action: 'setDefaultBillingAddress' });
  }

  const { body } = await apiRoot
    .customers()
    .withId({ ID: customer.id })
    .post({ body: { version: customer.version, actions } })
    .execute();
  return body;
}

export async function getCustomerOrders(apiRoot: ByProjectKeyRequestBuilder, customerId: string) {
  const { body } = await apiRoot
    .orders()
    .get({ queryArgs: { where: `customerId="${customerId}"`, sort: 'createdAt desc', limit: 20 } })
    .execute();
  return body;
}

export async function getCustomerOrder(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  orderId: string,
): Promise<Order | null> {
  try {
    const { body } = await apiRoot
      .orders()
      .withId({ ID: orderId })
      .get({ queryArgs: { expand: 'paymentInfo.payments[*]' } })
      .execute();
    return body.customerId === customerId ? body : null;
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode === 404) return null;
    throw err;
  }
}
