import { validateOpeningHours } from '../../helpers';
import { ADDRESS_FORM_FIELDS } from '../../constants';
import type { TAddressFormValues, TStoreFormValues } from '../../types';

export type TStoreFormErrors = Partial<
  Record<Exclude<keyof TStoreFormValues, 'address'>, string>
> & { address?: Partial<Record<keyof TAddressFormValues, string>> };

const KEY_PATTERN = /^[A-Za-z0-9_-]{2,256}$/;
const PHONE_PATTERN = /^[0-9+()\-./\s]{3,30}$/;

// UIKit fields render errors keyed by an error code; here the code is the message itself
export const toFieldErrors = (message?: unknown) =>
  typeof message === 'string' && message ? { [message]: true } : undefined;

export const renderError = (message: string) => message;

const validate = (values: TStoreFormValues): TStoreFormErrors => {
  const errors: TStoreFormErrors = {};

  if (!values.key.trim()) {
    errors.key = 'Store key is required';
  } else if (!KEY_PATTERN.test(values.key.trim())) {
    errors.key =
      'Use 2-256 letters, numbers, underscores or hyphens (no spaces)';
  }

  if (!Object.values(values.name).some((value) => value.trim() !== '')) {
    errors.name = 'Enter a store name in at least one language';
  }

  if (
    values.phoneNumber.trim() &&
    !PHONE_PATTERN.test(values.phoneNumber.trim())
  ) {
    errors.phoneNumber = 'Enter a valid phone number';
  }

  const openingHoursError = validateOpeningHours(values.openingHours);
  if (openingHoursError) errors.openingHours = openingHoursError;

  const latitude = values.latitude.trim();
  const longitude = values.longitude.trim();
  if (latitude === '' && longitude !== '') {
    errors.latitude = 'Latitude is required when longitude is set';
  }
  if (longitude === '' && latitude !== '') {
    errors.longitude = 'Longitude is required when latitude is set';
  }
  if (latitude !== '' && !(Math.abs(Number(latitude)) <= 90)) {
    errors.latitude = 'Latitude must be a number between -90 and 90';
  }
  if (longitude !== '' && !(Math.abs(Number(longitude)) <= 180)) {
    errors.longitude = 'Longitude must be a number between -180 and 180';
  }

  const address = values.address;
  const addressErrors: NonNullable<TStoreFormErrors['address']> = {};
  const hasAddress = ADDRESS_FORM_FIELDS.some(
    (field) => address[field].trim() !== ''
  );
  if (hasAddress && !address.country.trim()) {
    addressErrors.country = 'Country is required when an address is set';
  }
  if (Object.keys(addressErrors).length > 0) errors.address = addressErrors;

  return errors;
};

export default validate;
