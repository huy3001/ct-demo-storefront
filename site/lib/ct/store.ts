import type { Channel, LocalizedString } from '@commercetools/platform-sdk';
import { getApiRoot } from './client';

const STORE_CHANNEL_ROLE = 'InventorySupply';
const PAGE_SIZE = 500;

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  openingHours: Record<string, string>;
  position?: { lat: number; lng: number };
}

function getLocalizedValue(value: LocalizedString | undefined, locale: string): string {
  if (!value) return '';

  return value[locale] ?? value[locale.split('-')[0]] ?? Object.values(value)[0] ?? '';
}

function formatAddress(channel: Channel): string {
  const address = channel.address;
  if (!address) return 'Address unavailable';

  const street = [address.streetNumber, address.streetName].filter(Boolean).join(' ');
  const locality = [address.city, address.state ?? address.region, address.postalCode]
    .filter(Boolean)
    .join(', ');

  return [street, address.additionalStreetInfo, locality, address.country]
    .filter(Boolean)
    .join(', ') || 'Address unavailable';
}

function parseOpeningHours(value: unknown): Record<string, string> {
  if (typeof value !== 'string' || !value.trim()) return {};

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim() !== '',
      ),
    );
  } catch {
    return {};
  }
}

function getPosition(channel: Channel): StoreLocation['position'] {
  const [lng, lat] = channel.geoLocation?.coordinates ?? [];

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return undefined;
  }

  return { lat, lng };
}

function channelToStore(channel: Channel, locale: string): StoreLocation {
  const position = getPosition(channel);

  return {
    id: channel.id,
    name: getLocalizedValue(channel.name, locale) || channel.key,
    address: formatAddress(channel),
    postalCode: channel.address?.postalCode ?? '',
    openingHours: parseOpeningHours(channel.custom?.fields.openingHours),
    ...(position ? { position } : {}),
  };
}

/** Returns the physical store Channels maintained by the Merchant Center store manager. */
export async function getStores(locale: string): Promise<StoreLocation[]> {
  const apiRoot = getApiRoot();
  const stores: Channel[] = [];
  let offset = 0;

  do {
    const { body } = await apiRoot
      .channels()
      .get({
        queryArgs: {
          where: `roles contains any ("${STORE_CHANNEL_ROLE}")`,
          sort: 'key asc',
          limit: PAGE_SIZE,
          offset,
        },
      })
      .execute();

    stores.push(...body.results);
    offset += body.count;

    if (
      body.count === 0 ||
      body.count < PAGE_SIZE ||
      (body.total !== undefined && offset >= body.total)
    ) break;
  } while (true);

  return stores.map((store) => channelToStore(store, locale));
}
