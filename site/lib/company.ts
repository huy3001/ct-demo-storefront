export const ASSOCIATE_ROLES = ['admin', 'buyer', 'approver', 'reviewer'] as const;

export type AssociateRole = (typeof ASSOCIATE_ROLES)[number];

export type CompanyBusinessUnit = {
  id: string;
  name: string;
  key: string;
  parentUnit?: string;
  email?: string;
};

export type CompanyAssociate = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

export type CompanyAddress = {
  id: string;
  businessUnitId: string;
  companyName: string;
  company?: string;
  address: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

export type CompanyManagement = {
  company: CompanyBusinessUnit;
  businessUnits: CompanyBusinessUnit[];
  associates: CompanyAssociate[];
  addresses: CompanyAddress[];
};
