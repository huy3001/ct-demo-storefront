import { useMemo } from 'react';
import * as yup from 'yup';
import { useTranslations } from 'use-intl';

const useAddressValidationSchema = () => {
  const translate = useTranslations();

  const addressValidationSchema = useMemo(
    () =>
      yup
        .object()
        .shape({
          firstName: yup
            .string()
            .trim()
            .required(translate('common.fieldIsRequired')),
          lastName: yup
            .string()
            .trim()
            .required(translate('common.fieldIsRequired')),
          email: yup.string().when('$loggedIn', {
            is: (loggedIn: boolean) => !loggedIn,
            then: (schema) =>
              schema
                .email(translate('error.email'))
                .required(translate('common.fieldIsRequired')),
            otherwise: (schema) => schema.optional(),
          }),
          phone: yup.string().optional(),
          country: yup
            .string()
            .trim()
            .required(translate('common.fieldIsRequired')),
          streetName: yup
            .string()
            .trim()
            .required(translate('common.fieldIsRequired')),
          streetNumber: yup
            .string()
            .trim()
            .required(translate('common.fieldIsRequired')),
          postalCode: yup
            .string()
            .trim()
            .required(translate('common.fieldIsRequired')),
          state: yup.string().when('country', ([country], schema) => {
            return ['US', 'CA'].includes(country)
              ? schema.trim().required(translate('common.fieldIsRequired'))
              : schema.optional();
          }),
          city: yup
            .string()
            .trim()
            .required(translate('common.fieldIsRequired')),
        })
        .required(),
    [translate],
  );

  return addressValidationSchema;
};

export default useAddressValidationSchema;
