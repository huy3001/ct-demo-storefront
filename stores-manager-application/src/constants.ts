// Make sure to import the helper functions from the `ssr` entry point.
import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

export const entryPointUriPath = 'stores';

export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);

export const STORE_CHANNEL_ROLE = 'InventorySupply';

export const STORE_METADATA_TYPE_KEY = 'store-metadata-type';

export const ADDRESS_FORM_FIELDS = [
  'country',
  'streetName',
  'streetNumber',
  'additionalStreetInfo',
  'postalCode',
  'city',
  'state',
] as const;

// Address fields not editable in the form; they are kept when the address is saved
export const ADDRESS_PRESERVED_FIELDS = [
  'additionalAddressInfo',
  'company',
  'apartment',
  'building',
  'department',
  'pOBox',
  'phone',
  'mobile',
  'fax',
  'email',
  'firstName',
  'lastName',
  'title',
  'salutation',
] as const;

export const STORE_METADATA_TYPE_DRAFT = {
  key: STORE_METADATA_TYPE_KEY,
  name: [{ locale: 'en', value: 'Store metadata' }],
  resourceTypeIds: ['channel'],
  fieldDefinitions: [
    {
      name: 'openingHours',
      label: [{ locale: 'en', value: 'Opening hours (JSON)' }],
      required: false,
      type: { String: { dummy: '' } },
      inputHint: 'MultiLine',
    },
    {
      name: 'phoneNumber',
      label: [{ locale: 'en', value: 'Phone number' }],
      required: false,
      type: { String: { dummy: '' } },
      inputHint: 'SingleLine',
    },
    {
      name: 'storeManager',
      label: [{ locale: 'en', value: 'Store manager' }],
      required: false,
      type: { String: { dummy: '' } },
      inputHint: 'SingleLine',
    },
  ],
};

export const WEEK_DAYS = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;

export const DEFAULT_OPENING_HOURS = JSON.stringify(
  {
    mon: '09:00-21:00',
    tue: '09:00-21:00',
    wed: '09:00-21:00',
    thu: '09:00-21:00',
    fri: '09:00-21:00',
    sat: '10:00-18:00',
    sun: 'closed',
  },
  null,
  2
);
