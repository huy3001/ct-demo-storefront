// Make sure to import the helper functions from the `ssr` entry point.
import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

export const entryPointUriPath = 'stores';

export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);

export const STORE_CHANNEL_ROLE = 'InventorySupply';

export const STORE_METADATA_TYPE_KEY = 'store-metadata-type';

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
