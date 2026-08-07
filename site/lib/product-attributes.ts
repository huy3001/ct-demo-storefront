import { formatMoney, getLocalizedString } from '@/lib/utils';

export function attributeValueKey(value: unknown, locale: string): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map((item) => attributeValueKey(item, locale)).join('|');
  if (typeof value !== 'object') return String(value);

  const record = value as Record<string, unknown>;
  if (typeof record.key === 'string') return record.key;
  return formatAttributeValue(value, locale);
}

export function formatAttributeValue(value: unknown, locale: string): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map((item) => formatAttributeValue(item, locale)).join(', ');

  const record = value as Record<string, unknown>;
  if (typeof record.centAmount === 'number' && typeof record.currencyCode === 'string') {
    return formatMoney(record.centAmount, record.currencyCode, locale);
  }
  if (record.label) return formatAttributeValue(record.label, locale);
  if (typeof record.key === 'string') return record.key;

  const localized = getLocalizedString(
    Object.fromEntries(Object.entries(record).filter((entry): entry is [string, string] => typeof entry[1] === 'string')),
    locale
  );
  if (localized) return localized;

  return Object.values(record)
    .map((item) => formatAttributeValue(item, locale))
    .filter((item) => item !== '—')
    .join(', ') || '—';
}

export function humanizeAttributeName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
