import type { Customer } from '@commercetools/platform-sdk';

export function customerPhone(customer: Customer | null | undefined): string {
  const phone = customer?.custom?.fields?.phone;
  return typeof phone === 'string' ? phone : '';
}
