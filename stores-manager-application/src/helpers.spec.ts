import {
  buildCreateDraft,
  buildUpdateActions,
  channelToStore,
  storeToFormValues,
  toStoreMarkers,
  validateOpeningHours,
} from './helpers';
import type { TStoreChannel } from './types';

const channel: TStoreChannel = {
  id: 'channel-1',
  version: 3,
  key: 'berlin-mitte',
  roles: ['InventorySupply'],
  nameAllLocales: [{ locale: 'en', value: 'Berlin Mitte' }],
  custom: {
    customFieldsRaw: [
      { name: 'latitude', value: 52.52 },
      { name: 'longitude', value: 13.405 },
      { name: 'phoneNumber', value: '+49 30 123456' },
      { name: 'storeManager', value: 'Jane Doe' },
      { name: 'openingHours', value: '{"mon":"09:00-21:00"}' },
    ],
  },
};

describe('channelToStore', () => {
  it('maps channel custom fields to a store', () => {
    expect(channelToStore(channel)).toEqual({
      id: 'channel-1',
      version: 3,
      key: 'berlin-mitte',
      roles: ['InventorySupply'],
      name: { en: 'Berlin Mitte' },
      phoneNumber: '+49 30 123456',
      storeManager: 'Jane Doe',
      latitude: 52.52,
      longitude: 13.405,
      openingHours: '{"mon":"09:00-21:00"}',
    });
  });
});

describe('toStoreMarkers', () => {
  it('builds storefront marker data and skips stores without coordinates', () => {
    const store = channelToStore(channel);
    const markers = toStoreMarkers([store, { ...store, latitude: null }], 'en');
    expect(markers).toEqual([
      {
        title: 'Berlin Mitte',
        position: { lat: 52.52, lng: 13.405 },
        hours: { mon: '09:00-21:00' },
      },
    ]);
  });
});

describe('buildCreateDraft', () => {
  it('creates an InventorySupply channel with JSON encoded custom fields', () => {
    const values = storeToFormValues(channelToStore(channel), ['en', 'de'], '');
    const draft = buildCreateDraft(values);
    expect(draft.roles).toEqual(['InventorySupply']);
    expect(draft.name).toEqual([{ locale: 'en', value: 'Berlin Mitte' }]);
    expect(draft.custom.typeKey).toBe('store-metadata-type');
    expect(draft.custom.fields).toContainEqual({
      name: 'latitude',
      value: '52.52',
    });
    expect(draft.custom.fields).toContainEqual({
      name: 'phoneNumber',
      value: '"+49 30 123456"',
    });
  });
});

describe('buildUpdateActions', () => {
  const store = channelToStore(channel);
  const originalValues = storeToFormValues(store, ['en'], '');

  it('returns no actions when nothing changed', () => {
    expect(buildUpdateActions(store, originalValues, originalValues)).toEqual(
      []
    );
  });

  it('returns only the actions for changed data', () => {
    const actions = buildUpdateActions(
      store,
      { ...originalValues, key: 'berlin', phoneNumber: '123' },
      originalValues
    );
    expect(actions.map((action) => Object.keys(action)[0])).toEqual([
      'changeKey',
      'setCustomType',
    ]);
  });

  it('adds the InventorySupply role when missing', () => {
    const actions = buildUpdateActions(
      { ...store, roles: ['Primary'] },
      originalValues,
      originalValues
    );
    expect(actions).toEqual([{ addRoles: { roles: ['InventorySupply'] } }]);
  });
});

describe('validateOpeningHours', () => {
  it('accepts valid hours and empty values', () => {
    expect(validateOpeningHours('')).toBeUndefined();
    expect(
      validateOpeningHours('{"mon":"09:00-21:00","sun":"closed"}')
    ).toBeUndefined();
  });

  it('rejects invalid JSON, days and ranges', () => {
    expect(validateOpeningHours('{')).toBeDefined();
    expect(validateOpeningHours('{"funday":"09:00-21:00"}')).toBeDefined();
    expect(validateOpeningHours('{"mon":"9-5"}')).toBeDefined();
  });
});
