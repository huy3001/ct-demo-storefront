import {
  buildCreateDraft,
  buildUpdateActions,
  channelToStore,
  isMissingMetadataTypeError,
  storeToFormValues,
  toStoreMarkers,
  validateOpeningHours,
} from './helpers';
import type { TAddress, TStoreChannel } from './types';

const channel: TStoreChannel = {
  id: 'channel-1',
  version: 3,
  key: 'berlin-mitte',
  roles: ['InventorySupply'],
  nameAllLocales: [{ locale: 'en', value: 'Berlin Mitte' }],
  geoLocation: { coordinates: [13.405, 52.52] },
  address: {
    country: 'DE',
    streetName: 'Torstrasse',
    streetNumber: '1',
    postalCode: '10119',
    city: 'Berlin',
    state: null,
    region: 'BE',
    email: 'berlin@example.com',
  },
  custom: {
    customFieldsRaw: [
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
      address: { ...channel.address, state: 'BE' },
    });
  });

  it('falls back to legacy custom fields when there is no geoLocation', () => {
    const store = channelToStore({
      ...channel,
      geoLocation: null,
      custom: {
        customFieldsRaw: [
          { name: 'latitude', value: 1.5 },
          { name: 'longitude', value: 2.5 },
        ],
      },
    });
    expect([store.latitude, store.longitude]).toEqual([1.5, 2.5]);
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
    expect(draft.geoLocation).toEqual({
      type: 'Point',
      coordinates: [13.405, 52.52],
    });
    expect(draft.address).toMatchObject({
      country: 'DE',
      streetName: 'Torstrasse',
      region: 'BE',
    });
    expect(draft.custom.fields.map((field) => field.name)).not.toContain(
      'latitude'
    );
    expect(draft.custom.fields).toContainEqual({
      name: 'phoneNumber',
      value: '"+49 30 123456"',
    });
  });
});

describe('buildUpdateActions', () => {
  const store = channelToStore({
    ...channel,
    address: { ...channel.address, __typename: 'Address' } as TAddress,
  });
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

  it('updates geoLocation and address natively', () => {
    const actions = buildUpdateActions(
      store,
      {
        ...originalValues,
        latitude: '40.47058',
        longitude: '-122.33212',
        address: { ...originalValues.address, city: 'Anderson' },
      },
      originalValues
    );
    expect(actions).toEqual([
      {
        setGeoLocation: {
          geoLocation: { type: 'Point', coordinates: [-122.33212, 40.47058] },
        },
      },
      {
        setAddress: {
          address: {
            country: 'DE',
            streetName: 'Torstrasse',
            streetNumber: '1',
            postalCode: '10119',
            city: 'Anderson',
            state: 'BE',
            region: 'BE',
            email: 'berlin@example.com',
          },
        },
      },
    ]);
  });

  it('clears geoLocation and address when emptied', () => {
    const emptyAddress = storeToFormValues(undefined, ['en'], '').address;
    expect(
      buildUpdateActions(
        store,
        {
          ...originalValues,
          latitude: '',
          longitude: '',
          address: emptyAddress,
        },
        originalValues
      )
    ).toEqual([
      { setGeoLocation: { geoLocation: null } },
      { setAddress: { address: null } },
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

describe('isMissingMetadataTypeError', () => {
  it('detects the missing custom type API error', () => {
    expect(
      isMissingMetadataTypeError([
        {
          message: "The type with the key 'store-metadata-type' was not found",
        },
      ])
    ).toBe(true);
    expect(isMissingMetadataTypeError([{ message: 'Other' }])).toBe(false);
    expect(isMissingMetadataTypeError(new Error('Other'))).toBe(false);
  });
});
