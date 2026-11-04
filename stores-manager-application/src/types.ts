import type { WEEK_DAYS } from './constants';

export type TWeekDay = (typeof WEEK_DAYS)[number];

export type TOpeningHours = Partial<Record<TWeekDay, string>>;

export type TLocalizedField = { locale: string; value: string };

export type TCustomFieldRaw = { name: string; value: unknown };

export type TStoreChannel = {
  id: string;
  version: number;
  key?: string | null;
  roles: string[];
  nameAllLocales?: TLocalizedField[] | null;
  custom?: { customFieldsRaw?: TCustomFieldRaw[] | null } | null;
};

export type TFetchStoreChannelsQuery = {
  channels: { total: number; results: TStoreChannel[] };
};
export type TFetchStoreChannelsQueryVariables = {
  limit: number;
  offset: number;
  sort?: string[];
};

export type TFetchStoreChannelQuery = { channel?: TStoreChannel | null };
export type TFetchStoreChannelQueryVariables = { id: string };

export type TCustomFieldInput = { name: string; value: string };

export type TChannelDraft = {
  key: string;
  roles: string[];
  name: TLocalizedField[];
  custom: { typeKey: string; fields: TCustomFieldInput[] };
};

export type TCreateStoreChannelMutation = {
  createChannel?: { id: string; version: number; key?: string | null } | null;
};
export type TCreateStoreChannelMutationVariables = { draft: TChannelDraft };

export type TChannelUpdateAction = Record<string, unknown>;

export type TUpdateStoreChannelMutation = {
  updateChannel?: { id: string; version: number; key?: string | null } | null;
};
export type TUpdateStoreChannelMutationVariables = {
  id: string;
  version: number;
  actions: TChannelUpdateAction[];
};

export type TDeleteStoreChannelMutation = {
  deleteChannel?: { id: string } | null;
};
export type TDeleteStoreChannelMutationVariables = {
  id: string;
  version: number;
};

export type TStore = {
  id: string;
  version: number;
  key: string;
  roles: string[];
  name: Record<string, string>;
  phoneNumber: string;
  storeManager: string;
  latitude: number | null;
  longitude: number | null;
  openingHours: string;
};

export type TStoreFormValues = {
  key: string;
  name: Record<string, string>;
  phoneNumber: string;
  storeManager: string;
  openingHours: string;
  latitude: string;
  longitude: string;
};

export type TStoreMarker = {
  title: string;
  position: { lat: number; lng: number };
  hours: TOpeningHours;
};
