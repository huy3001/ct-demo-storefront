import { useMemo } from 'react';
import { useFormik } from 'formik';
import { useParams } from 'react-router-dom';
import {
  useShowApiErrorNotification,
  useShowNotification,
  type TApiErrorNotificationOptions,
} from '@commercetools-frontend/actions-global';
import {
  FormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { ApplicationPageTitle } from '@commercetools-frontend/application-shell';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { DOMAINS } from '@commercetools-frontend/constants';
import { useCountries } from '@commercetools-frontend/l10n';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import FieldLabel from '@commercetools-uikit/field-label';
import Grid from '@commercetools-uikit/grid';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import MultilineTextField from '@commercetools-uikit/multiline-text-field';
import { ContentNotification } from '@commercetools-uikit/notifications';
import SelectInput from '@commercetools-uikit/select-input';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import { DEFAULT_OPENING_HOURS, PERMISSIONS } from '../../constants';
import {
  getErrorMessage,
  getStoreName,
  isStoreFormDirty,
  storeToFormValues,
} from '../../helpers';
import {
  useStoreChannelCreator,
  useStoreChannelFetcher,
  useStoreChannelUpdater,
} from '../../hooks/use-store-gql';
import type { TAddressFormField, TStoreFormValues } from '../../types';
import StoreLocationPicker from './store-location-picker';
import validate, { renderError, toFieldErrors } from './validate';

type TStoreFormProps = {
  onClose: () => void;
};

type TApiError = {
  extensions?: { code?: string; field?: string };
};

const isDuplicateKeyError = (error: unknown) =>
  Array.isArray(error) &&
  (error as TApiError[]).some(
    (e) =>
      e.extensions?.code === 'DuplicateField' && e.extensions?.field === 'key'
  );

const StoreForm = (props: TStoreFormProps) => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const { dataLocale, projectLanguages, userLocale } = useApplicationContext(
    (context) => ({
      dataLocale: context.dataLocale ?? '',
      projectLanguages: context.project?.languages ?? [],
      userLocale: context.user?.locale ?? 'en',
    })
  );
  const { data: countryNames } = useCountries(userLocale);
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  const { store, loading, error } = useStoreChannelFetcher(id);
  const creator = useStoreChannelCreator();
  const updater = useStoreChannelUpdater();

  const initialValues = useMemo(
    () =>
      storeToFormValues(
        store ?? undefined,
        projectLanguages,
        DEFAULT_OPENING_HOURS
      ),
    [store, projectLanguages]
  );

  const formik = useFormik<TStoreFormValues>({
    initialValues,
    enableReinitialize: true,
    validate,
    onSubmit: async (values, helpers) => {
      try {
        if (isEditing && store) {
          await updater.execute({
            store,
            values,
            originalValues: initialValues,
          });
        } else {
          await creator.execute(values);
        }
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: isEditing ? 'Store updated' : 'Store created',
        });
        props.onClose();
      } catch (submitError) {
        if (isDuplicateKeyError(submitError)) {
          helpers.setFieldError('key', 'A store with this key already exists');
          return;
        }
        showApiErrorNotification({
          errors: (Array.isArray(submitError)
            ? submitError
            : [submitError]) as TApiErrorNotificationOptions['errors'],
        });
      }
    },
  });

  const isReadOnly = !canManage;
  // l10n country data is keyed by lowercase ISO code; addresses use uppercase codes
  const countryOptions = useMemo(
    () =>
      Object.entries(countryNames as Record<string, string>)
        .map(([code, name]) => ({
          value: code.toUpperCase(),
          label: `${name} (${code.toUpperCase()})`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [countryNames]
  );

  const addressField = (
    field: Exclude<TAddressFormField, 'country'>,
    title: string
  ) => (
    <TextField
      name={`address.${field}`}
      title={title}
      value={formik.values.address[field]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      isReadOnly={isReadOnly}
      horizontalConstraint="scale"
    />
  );

  const storeName =
    getStoreName(formik.values.name, dataLocale, projectLanguages) ||
    (isEditing ? '' : 'New store');
  const isDirty = isStoreFormDirty(formik.values, initialValues);

  return (
    <FormModalPage
      title={isEditing ? storeName || 'Edit store' : 'Add new store'}
      isOpen
      onClose={props.onClose}
      isPrimaryButtonDisabled={
        formik.isSubmitting || !isDirty || !canManage || (isEditing && !store)
      }
      onPrimaryButtonClick={() => formik.submitForm()}
      onSecondaryButtonClick={props.onClose}
      labelPrimaryButton={isEditing ? 'Save store' : 'Create store'}
      labelSecondaryButton="Cancel"
    >
      <ApplicationPageTitle additionalParts={[storeName || 'Stores']} />
      {loading && (
        <Spacings.Stack alignItems="center">
          <LoadingSpinner />
        </Spacings.Stack>
      )}
      {error && (
        <ContentNotification type="error">
          <Text.Body>{getErrorMessage(error)}</Text.Body>
        </ContentNotification>
      )}
      {isEditing && store === null && <PageNotFound />}
      {(!isEditing || store) && (
        <Grid
          gridGap="32px"
          gridTemplateColumns="repeat(auto-fit, minmax(320px, 1fr))"
        >
          <Grid.Item>
            <Spacings.Stack scale="l">
              <LocalizedTextField
                name="name"
                title="Store name"
                value={formik.values.name}
                errors={toFieldErrors(formik.errors.name)}
                renderError={renderError}
                touched={Boolean(formik.touched.name)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                selectedLanguage={dataLocale}
                isReadOnly={isReadOnly}
                isRequired
                horizontalConstraint="scale"
              />
              <TextField
                name="key"
                title="Store key"
                description="Unique identifier of the store"
                value={formik.values.key}
                errors={toFieldErrors(formik.errors.key)}
                renderError={renderError}
                touched={formik.touched.key}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isReadOnly={isReadOnly}
                isRequired
                horizontalConstraint="scale"
              />
              <TextField
                name="phoneNumber"
                title="Phone number"
                value={formik.values.phoneNumber}
                errors={toFieldErrors(formik.errors.phoneNumber)}
                renderError={renderError}
                touched={formik.touched.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isReadOnly={isReadOnly}
                horizontalConstraint="scale"
              />
              <TextField
                name="storeManager"
                title="Store manager"
                value={formik.values.storeManager}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isReadOnly={isReadOnly}
                horizontalConstraint="scale"
              />
              <MultilineTextField
                name="openingHours"
                title="Opening hours"
                description='JSON object keyed by day (mon-sun), e.g. {"mon": "09:00-21:00", "sun": "closed"}'
                value={formik.values.openingHours}
                errors={toFieldErrors(formik.errors.openingHours)}
                renderError={renderError}
                touched={formik.touched.openingHours}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isReadOnly={isReadOnly}
                horizontalConstraint="scale"
              />
            </Spacings.Stack>
          </Grid.Item>
          <Grid.Item>
            <Spacings.Stack scale="l">
              <StoreLocationPicker
                latitude={formik.values.latitude}
                longitude={formik.values.longitude}
                isReadOnly={isReadOnly}
                onChange={(latitude, longitude) => {
                  formik.setFieldValue('latitude', String(latitude));
                  formik.setFieldValue('longitude', String(longitude));
                }}
                onAddressSelect={(address) =>
                  formik.setFieldValue('address', {
                    ...formik.values.address,
                    ...address,
                  })
                }
              />
              <Spacings.Inline scale="m">
                <TextField
                  name="latitude"
                  title="Latitude"
                  value={formik.values.latitude}
                  errors={toFieldErrors(formik.errors.latitude)}
                  renderError={renderError}
                  touched={formik.touched.latitude}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isReadOnly={isReadOnly}
                  horizontalConstraint={6}
                />
                <TextField
                  name="longitude"
                  title="Longitude"
                  value={formik.values.longitude}
                  errors={toFieldErrors(formik.errors.longitude)}
                  renderError={renderError}
                  touched={formik.touched.longitude}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isReadOnly={isReadOnly}
                  horizontalConstraint={6}
                />
              </Spacings.Inline>
              <Text.Subheadline as="h4">Address</Text.Subheadline>
              <Spacings.Stack scale="xs">
                <FieldLabel title="Country" />
                <SelectInput
                  name="address.country"
                  value={formik.values.address.country}
                  options={countryOptions}
                  onChange={(event) =>
                    formik.setFieldValue(
                      'address.country',
                      (event.target.value as string | null) ?? ''
                    )
                  }
                  onBlur={formik.handleBlur}
                  isReadOnly={isReadOnly}
                  isClearable
                  horizontalConstraint="scale"
                />
                {formik.errors.address?.country && (
                  <Text.Detail tone="negative">
                    {formik.errors.address.country}
                  </Text.Detail>
                )}
              </Spacings.Stack>
              {addressField('streetName', 'Street name')}
              {addressField('streetNumber', 'House number')}
              {addressField('additionalStreetInfo', 'Additional street info')}
              {addressField('postalCode', 'Postal code')}
              {addressField('city', 'City')}
              {addressField('state', 'State')}
            </Spacings.Stack>
          </Grid.Item>
        </Grid>
      )}
    </FormModalPage>
  );
};
StoreForm.displayName = 'StoreForm';

export default StoreForm;
