import { randomUUID } from 'crypto';
import type {
  AssociateRoleAssignmentDraft,
  BaseAddress,
  BusinessUnit,
  BusinessUnitUpdateAction,
  ByProjectKeyRequestBuilder,
  Customer,
} from '@commercetools/platform-sdk';
import type {
  CompanyAddress,
  CompanyBusinessUnit,
  CompanyManagement,
} from '@/lib/company';

function associateApi(apiRoot: ByProjectKeyRequestBuilder, customerId: string) {
  return apiRoot.asAssociate().withAssociateIdValue({ associateId: customerId });
}

function toBusinessUnit(unit: BusinessUnit): CompanyBusinessUnit {
  return {
    id: unit.id,
    name: unit.name,
    key: unit.key,
    ...(unit.parentUnit ? { parentUnit: unit.parentUnit.key } : {}),
    ...(unit.contactEmail ? { email: unit.contactEmail } : {}),
  };
}

function roleAssignments(roles: string[]): AssociateRoleAssignmentDraft[] {
  return roles.map((role) => ({
    associateRole: { typeId: 'associate-role', key: role },
  }));
}

function escapePredicate(value: string) {
  return value.replace(/([\\"])/g, '\\$1');
}

async function getCompany(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
): Promise<BusinessUnit | undefined> {
  const { body } = await associateApi(apiRoot, customerId).businessUnits().get({
    queryArgs: { limit: 100 },
  }).execute();
  const associatedUnit = body.results[0];
  if (!associatedUnit) return undefined;

  if (associatedUnit.unitType === 'Company') return associatedUnit;

  return (
    await associateApi(apiRoot, customerId).businessUnits().withKey({
      key: associatedUnit.topLevelUnit.key,
    }).get().execute()
  ).body;
}

async function getCustomers(
  apiRoot: ByProjectKeyRequestBuilder,
  customerIds: string[],
): Promise<Map<string, Customer>> {
  if (customerIds.length === 0) return new Map();
  const predicates = customerIds.map((id) => `"${escapePredicate(id)}"`).join(',');
  const { body } = await apiRoot.customers().get({
    queryArgs: { where: `id in (${predicates})`, limit: customerIds.length },
  }).execute();
  return new Map(body.results.map((customer) => [customer.id, customer]));
}

export async function getCompanyManagement(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
): Promise<CompanyManagement | undefined> {
  const company = await getCompany(apiRoot, customerId);
  if (!company) return undefined;

  const { body } = await associateApi(apiRoot, customerId).businessUnits().get({
    queryArgs: { where: `topLevelUnit(key="${escapePredicate(company.key)}")`, limit: 100 },
  }).execute();
  const businessUnits = body.results.some((unit) => unit.id === company.id)
    ? body.results
    : [company, ...body.results];
  const associatesByCustomerId = new Map(
    businessUnits.flatMap((unit) =>
      unit.associates.map((associate) => [associate.customer.id, associate] as const),
    ),
  );
  const customers = await getCustomers(apiRoot, [...associatesByCustomerId.keys()]);

  const associates = [...associatesByCustomerId].flatMap(([id, associate]) => {
    const customer = customers.get(id);
    if (!customer) return [];
    const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email;
    return [{
      id,
      name,
      email: customer.email,
      roles: associate.associateRoleAssignments.map(
        ({ associateRole }) => associateRole.key,
      ),
    }];
  });
  const addresses: CompanyAddress[] = businessUnits.flatMap((unit) =>
    unit.addresses.flatMap((address) => {
      if (!address.id) return [];
      return [{
        id: address.id,
        businessUnitId: unit.id,
        companyName: unit.name,
        ...(address.company ? { company: address.company } : {}),
        address: [address.streetNumber, address.streetName].filter(Boolean).join(' '),
        ...(address.firstName ? { firstName: address.firstName } : {}),
        ...(address.lastName ? { lastName: address.lastName } : {}),
        ...(address.phone ? { phone: address.phone } : {}),
        isDefaultShipping: unit.defaultShippingAddressId === address.id,
        isDefaultBilling: unit.defaultBillingAddressId === address.id,
        city: address.city ?? '',
        state: address.state ?? '',
        postcode: address.postalCode ?? '',
        country: address.country,
      }];
    }),
  );

  return {
    company: toBusinessUnit(company),
    businessUnits: businessUnits.map(toBusinessUnit),
    associates,
    addresses,
  };
}

async function getManagedUnit(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  unitId: string,
) {
  return (
    await associateApi(apiRoot, customerId).businessUnits().withId({ ID: unitId }).get().execute()
  ).body;
}

async function updateUnit(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  unitId: string,
  actions: BusinessUnitUpdateAction[],
) {
  const unit = await getManagedUnit(apiRoot, customerId, unitId);
  return (
    await associateApi(apiRoot, customerId).businessUnits().withId({ ID: unitId }).post({
      body: { version: unit.version, actions },
    }).execute()
  ).body;
}

export async function updateCompanyDetails(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  input: { name: string; email: string },
) {
  const company = await getCompany(apiRoot, customerId);
  if (!company) throw new Error('No company is linked to this account');
  return updateUnit(apiRoot, customerId, company.id, [
    { action: 'changeName', name: input.name },
    { action: 'setContactEmail', contactEmail: input.email },
  ]);
}

export async function createBusinessUnit(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  input: { name: string; email: string },
) {
  const company = await getCompany(apiRoot, customerId);
  if (!company) throw new Error('No company is linked to this account');
  const keyBase = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'business-unit';
  return (
    await associateApi(apiRoot, customerId).businessUnits().post({
      body: {
        unitType: 'Division',
        key: `${keyBase}-${randomUUID().slice(0, 8)}`,
        name: input.name,
        contactEmail: input.email,
        parentUnit: { typeId: 'business-unit', key: company.key },
      },
    }).execute()
  ).body;
}

export async function updateBusinessUnit(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  unitId: string,
  input: { name: string; email: string },
) {
  return updateUnit(apiRoot, customerId, unitId, [
    { action: 'changeName', name: input.name },
    { action: 'setContactEmail', contactEmail: input.email },
  ]);
}

export async function updateBusinessUnitAddress(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  unitId: string,
  addressId: string,
  address: BaseAddress,
  defaults: { shipping: boolean; billing: boolean },
) {
  const unit = await getManagedUnit(apiRoot, customerId, unitId);
  const actions: BusinessUnitUpdateAction[] = [{
    action: 'changeAddress',
    addressId,
    address,
  }];

  if (defaults.shipping) {
    actions.push({ action: 'setDefaultShippingAddress', addressId });
  } else if (unit.defaultShippingAddressId === addressId) {
    actions.push({ action: 'setDefaultShippingAddress' });
  }

  if (defaults.billing) {
    actions.push({ action: 'setDefaultBillingAddress', addressId });
  } else if (unit.defaultBillingAddressId === addressId) {
    actions.push({ action: 'setDefaultBillingAddress' });
  }

  return updateUnit(apiRoot, customerId, unitId, actions);
}

export async function createBusinessUnitAddress(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  unitId: string,
  address: BaseAddress,
  defaults: { shipping: boolean; billing: boolean },
) {
  const addressKey = randomUUID();
  const actions: BusinessUnitUpdateAction[] = [{
    action: 'addAddress',
    address: { ...address, key: addressKey },
  }];
  if (defaults.shipping) {
    actions.push({ action: 'setDefaultShippingAddress', addressKey });
  }
  if (defaults.billing) {
    actions.push({ action: 'setDefaultBillingAddress', addressKey });
  }

  return updateUnit(apiRoot, customerId, unitId, actions);
}

async function findCustomerByName(
  apiRoot: ByProjectKeyRequestBuilder,
  name: string,
) {
  const parts = name.trim().split(/\s+/);
  const where = parts.length > 1
    ? `firstName="${escapePredicate(parts[0])}" and lastName="${escapePredicate(parts.slice(1).join(' '))}"`
    : `firstName="${escapePredicate(name.trim())}"`;
  const { body } = await apiRoot.customers().get({ queryArgs: { where, limit: 2 } }).execute();
  if (body.results.length !== 1) {
    throw new Error('Enter the exact name of one existing customer');
  }
  return body.results[0];
}

async function updateCustomerName(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  name: string,
) {
  const customer = await getCustomer(apiRoot, customerId);
  const [firstName = '', ...lastName] = name.trim().split(/\s+/);
  if (!firstName) throw new Error('Name is required');
  return apiRoot.customers().withId({ ID: customerId }).post({
    body: {
      version: customer.version,
      actions: [
        { action: 'setFirstName', firstName },
        { action: 'setLastName', lastName: lastName.join(' ') || undefined },
      ],
    },
  }).execute();
}

async function getCustomer(apiRoot: ByProjectKeyRequestBuilder, customerId: string) {
  return (await apiRoot.customers().withId({ ID: customerId }).get().execute()).body;
}

export async function createAssociate(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  input: { name: string; roles: string[] },
) {
  const company = await getCompany(apiRoot, customerId);
  if (!company) throw new Error('No company is linked to this account');
  const customer = await findCustomerByName(apiRoot, input.name);
  return updateUnit(apiRoot, customerId, company.id, [{
    action: 'addAssociate',
    associate: {
      customer: { typeId: 'customer', id: customer.id },
      associateRoleAssignments: roleAssignments(input.roles),
    },
  }]);
}

export async function updateAssociate(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  associateId: string,
  input: { name: string; roles: string[] },
) {
  const company = await getCompany(apiRoot, customerId);
  if (!company) throw new Error('No company is linked to this account');
  await updateCustomerName(apiRoot, associateId, input.name);
  return updateUnit(apiRoot, customerId, company.id, [{
    action: 'changeAssociate',
    associate: {
      customer: { typeId: 'customer', id: associateId },
      associateRoleAssignments: roleAssignments(input.roles),
    },
  }]);
}

export async function removeAssociate(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  associateId: string,
) {
  const company = await getCompany(apiRoot, customerId);
  if (!company) throw new Error('No company is linked to this account');
  return updateUnit(apiRoot, customerId, company.id, [{
    action: 'removeAssociate',
    customer: { typeId: 'customer', id: associateId },
  }]);
}

export async function removeBusinessUnitAddress(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  unitId: string,
  addressId: string,
) {
  return updateUnit(apiRoot, customerId, unitId, [{
    action: 'removeAddress',
    addressId,
  }]);
}
