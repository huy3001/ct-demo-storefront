import type { ByProjectKeyRequestBuilder, Customer, CustomerSignInResult } from '@commercetools/platform-sdk';

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

export async function updateCustomerProfile(
  apiRoot: ByProjectKeyRequestBuilder,
  customer: Customer,
  fields: { firstName?: string; lastName?: string; email?: string }
): Promise<Customer> {
  const actions = [];
  if (fields.firstName !== undefined) actions.push({ action: 'setFirstName' as const, firstName: fields.firstName });
  if (fields.lastName !== undefined) actions.push({ action: 'setLastName' as const, lastName: fields.lastName });
  if (fields.email !== undefined) actions.push({ action: 'changeEmail' as const, email: fields.email });

  const { body } = await apiRoot
    .customers()
    .withId({ ID: customer.id })
    .post({ body: { version: customer.version, actions } })
    .execute();
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
  address: NonNullable<Customer['addresses']>[number]
): Promise<Customer> {
  const { body } = await apiRoot
    .customers()
    .withId({ ID: customer.id })
    .post({ body: { version: customer.version, actions: [{ action: 'addAddress', address }] } })
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

export async function getCustomerOrders(apiRoot: ByProjectKeyRequestBuilder, customerId: string) {
  const { body } = await apiRoot
    .orders()
    .get({ queryArgs: { where: `customerId="${customerId}"`, sort: 'createdAt desc', limit: 20 } })
    .execute();
  return body;
}
