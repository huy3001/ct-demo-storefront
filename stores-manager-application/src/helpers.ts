import {
  isApolloError,
  type ApolloError,
  type ServerError,
} from '@apollo/client';
import {
  STORE_CHANNEL_ROLE,
  STORE_METADATA_TYPE_KEY,
  WEEK_DAYS,
} from './constants';
import type {
  TChannelDraft,
  TChannelUpdateAction,
  TCustomFieldInput,
  TLocalizedField,
  TOpeningHours,
  TStore,
  TStoreChannel,
  TStoreFormValues,
  TStoreMarker,
} from './types';

export const getErrorMessage = (error: ApolloError) =>
  error.graphQLErrors?.map((e) => e.message).join('\n') || error.message;

const isServerError = (
  error: ApolloError['networkError']
): error is ServerError => Boolean((error as ServerError)?.result);

export const extractErrorFromGraphQlResponse = (graphQlResponse: unknown) => {
  if (graphQlResponse instanceof Error && isApolloError(graphQlResponse)) {
    if (
      isServerError(graphQlResponse.networkError) &&
      typeof graphQlResponse.networkError?.result !== 'string' &&
      graphQlResponse.networkError?.result?.errors.length > 0
    ) {
      return graphQlResponse.networkError.result.errors;
    }

    if (graphQlResponse.graphQLErrors?.length > 0) {
      return graphQlResponse.graphQLErrors;
    }
  }

  return graphQlResponse;
};

export const localizedFieldToRecord = (
  field?: TLocalizedField[] | null
): Record<string, string> =>
  (field ?? []).reduce<Record<string, string>>(
    (acc, { locale, value }) => ({ ...acc, [locale]: value }),
    {}
  );

const recordToLocalizedField = (
  record: Record<string, string>
): TLocalizedField[] =>
  Object.entries(record)
    .filter(([, value]) => value.trim() !== '')
    .map(([locale, value]) => ({ locale, value: value.trim() }));

export const getStoreName = (
  name: Record<string, string>,
  dataLocale: string,
  fallbackOrder: string[] = []
) =>
  [dataLocale, ...fallbackOrder, ...Object.keys(name)]
    .map((locale) => name[locale])
    .find((value) => Boolean(value)) ?? '';

const toNumberOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const channelToStore = (channel: TStoreChannel): TStore => {
  const fields = (channel.custom?.customFieldsRaw ?? []).reduce<
    Record<string, unknown>
  >((acc, { name, value }) => ({ ...acc, [name]: value }), {});

  return {
    id: channel.id,
    version: channel.version,
    key: channel.key ?? '',
    roles: channel.roles,
    name: localizedFieldToRecord(channel.nameAllLocales),
    phoneNumber:
      typeof fields.phoneNumber === 'string' ? fields.phoneNumber : '',
    storeManager:
      typeof fields.storeManager === 'string' ? fields.storeManager : '',
    latitude: toNumberOrNull(fields.latitude),
    longitude: toNumberOrNull(fields.longitude),
    openingHours:
      typeof fields.openingHours === 'string' ? fields.openingHours : '',
  };
};

export const parseOpeningHours = (value: string): TOpeningHours => {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as TOpeningHours)
      : {};
  } catch {
    return {};
  }
};

// Shape consumed by storefronts to render the stores on a Leaflet map
export const toStoreMarkers = (
  stores: TStore[],
  dataLocale: string,
  fallbackOrder: string[] = []
): TStoreMarker[] =>
  stores.flatMap((store) =>
    store.latitude === null || store.longitude === null
      ? []
      : [
          {
            title: getStoreName(store.name, dataLocale, fallbackOrder),
            position: { lat: store.latitude, lng: store.longitude },
            hours: parseOpeningHours(store.openingHours),
          },
        ]
  );

export const storeToFormValues = (
  store: TStore | undefined,
  projectLanguages: string[],
  defaultOpeningHours: string
): TStoreFormValues => ({
  key: store?.key ?? '',
  name: projectLanguages.reduce<Record<string, string>>(
    (acc, locale) => ({ ...acc, [locale]: store?.name[locale] ?? '' }),
    { ...store?.name }
  ),
  phoneNumber: store?.phoneNumber ?? '',
  storeManager: store?.storeManager ?? '',
  openingHours: store ? store.openingHours : defaultOpeningHours,
  latitude: store?.latitude === null || !store ? '' : String(store.latitude),
  longitude: store?.longitude === null || !store ? '' : String(store.longitude),
});

const normalizeOpeningHours = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' ? '{}' : JSON.stringify(JSON.parse(trimmed));
};

// Custom field values are sent as JSON-encoded strings through the GraphQL API
const buildCustomFields = (values: TStoreFormValues): TCustomFieldInput[] => {
  const fields: TCustomFieldInput[] = [
    {
      name: 'openingHours',
      value: JSON.stringify(normalizeOpeningHours(values.openingHours)),
    },
  ];
  if (values.latitude.trim() !== '') {
    fields.push({ name: 'latitude', value: String(Number(values.latitude)) });
  }
  if (values.longitude.trim() !== '') {
    fields.push({ name: 'longitude', value: String(Number(values.longitude)) });
  }
  if (values.phoneNumber.trim() !== '') {
    fields.push({
      name: 'phoneNumber',
      value: JSON.stringify(values.phoneNumber.trim()),
    });
  }
  if (values.storeManager.trim() !== '') {
    fields.push({
      name: 'storeManager',
      value: JSON.stringify(values.storeManager.trim()),
    });
  }
  return fields;
};

export const buildCreateDraft = (values: TStoreFormValues): TChannelDraft => ({
  key: values.key.trim(),
  roles: [STORE_CHANNEL_ROLE],
  name: recordToLocalizedField(values.name),
  custom: {
    typeKey: STORE_METADATA_TYPE_KEY,
    fields: buildCustomFields(values),
  },
});

const normalizedFormValues = (values: TStoreFormValues) =>
  JSON.stringify({
    key: values.key.trim(),
    name: recordToLocalizedField(values.name),
    custom: buildCustomFields(values),
  });

export const buildUpdateActions = (
  original: TStore,
  values: TStoreFormValues,
  originalValues: TStoreFormValues
): TChannelUpdateAction[] => {
  const actions: TChannelUpdateAction[] = [];

  if (values.key.trim() !== original.key) {
    actions.push({ changeKey: { key: values.key.trim() } });
  }
  if (
    JSON.stringify(recordToLocalizedField(values.name)) !==
    JSON.stringify(recordToLocalizedField(originalValues.name))
  ) {
    actions.push({
      changeName: { name: recordToLocalizedField(values.name) },
    });
  }
  if (!original.roles.includes(STORE_CHANNEL_ROLE)) {
    actions.push({ addRoles: { roles: [STORE_CHANNEL_ROLE] } });
  }
  if (
    JSON.stringify(buildCustomFields(values)) !==
    JSON.stringify(buildCustomFields(originalValues))
  ) {
    actions.push({
      setCustomType: {
        typeKey: STORE_METADATA_TYPE_KEY,
        fields: buildCustomFields(values),
      },
    });
  }

  return actions;
};

// Invalid JSON must not break the dirty check while the user is still typing
const normalizedFormSafe = (values: TStoreFormValues) => {
  try {
    return normalizedFormValues(values);
  } catch {
    return JSON.stringify(values);
  }
};

export const isStoreFormDirty = (
  values: TStoreFormValues,
  initialValues: TStoreFormValues
) => normalizedFormSafe(values) !== normalizedFormSafe(initialValues);

const TIME_RANGE = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

export const validateOpeningHours = (value: string): string | undefined => {
  if (value.trim() === '') return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return 'Opening hours must be valid JSON';
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return 'Opening hours must be a JSON object, e.g. {"mon": "09:00-21:00"}';
  }
  for (const [day, hours] of Object.entries(parsed)) {
    if (!(WEEK_DAYS as readonly string[]).includes(day)) {
      return `Unknown day "${day}". Use: ${WEEK_DAYS.join(', ')}`;
    }
    if (
      typeof hours !== 'string' ||
      (hours !== 'closed' && !TIME_RANGE.test(hours))
    ) {
      return `Hours for "${day}" must be "HH:MM-HH:MM" or "closed"`;
    }
  }
  return undefined;
};
