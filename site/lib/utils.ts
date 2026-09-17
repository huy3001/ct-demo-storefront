import type { Attribute } from '@commercetools/platform-sdk';
import { textToColor } from '@/helpers/textToColor/textToColor';

export const COUNTRY_CONFIG: Record<
  string,
  { currency: string; locale: string; country: string; label: string }
> = {
  'en-AU': {
    locale: 'en-AU',
    currency: 'AUD',
    country: 'AU',
    label: 'Australia',
  },
  'en-NZ': {
    locale: 'en-NZ',
    currency: 'NZD',
    country: 'NZ',
    label: 'New Zealand',
  },
  'en-US': {
    locale: 'en-US',
    currency: 'USD',
    country: 'US',
    label: 'United States',
  },
  'en-GB': {
    locale: 'en-GB',
    currency: 'GBP',
    country: 'GB',
    label: 'United Kingdom',
  },
  'de-DE': {
    locale: 'de-DE',
    currency: 'EUR',
    country: 'DE',
    label: 'Germany',
  },
};

export const DEFAULT_LOCALE = COUNTRY_CONFIG['en-US'];

export function formatMoney(
  centAmount: number,
  currencyCode: string,
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(centAmount / 100);
}

export function getLocalizedString(
  obj: Record<string, string> | undefined,
  locale: string,
): string {
  if (!obj) return '';
  return (
    obj[locale] ?? obj[locale.split('-')[0]] ?? Object.values(obj)[0] ?? ''
  );
}

export function slugify(
  obj: Record<string, string> | undefined,
  locale: string,
): string {
  return getLocalizedString(obj, locale);
}

export function getVariantColorCode(attributes: Attribute[] | undefined) {
  if (!attributes) return undefined;

  const attributeValues = Array.isArray(attributes)
    ? Object.fromEntries(attributes.map(({ name, value }) => [name, value]))
    : attributes;

  const directCode =
    attributeValues['color-code'] || attributeValues['finish-code'];
  if (typeof directCode === 'string' && directCode) return directCode;

  const getLabel = (value: unknown) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null && 'label' in value) {
      const label = value.label;
      return typeof label === 'string' ? label : undefined;
    }
    return undefined;
  };

  const labelOrText =
    getLabel(attributeValues['color-label']) ||
    getLabel(attributeValues['finish-label']) ||
    getLabel(attributeValues.color) ||
    getLabel(attributeValues.finish) ||
    getLabel(attributeValues['search-color']) ||
    getLabel(attributeValues['search-finish']);

  return labelOrText ? textToColor(labelOrText).code : undefined;
}
