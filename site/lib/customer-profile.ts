import type { BaseAddress, Customer } from '@commercetools/platform-sdk';

export function customerPhone(customer: Customer | null | undefined): string {
  const phone = customer?.custom?.fields?.phone;
  return typeof phone === 'string' ? phone : '';
}

export function customerDefaultAddresses(
  customer: Customer | null | undefined,
): {
  shipping?: BaseAddress;
  billing?: BaseAddress;
} {
  const addresses = customer?.addresses ?? [];
  const firstAddress = addresses[0];
  const findAddress = (addressId: string | undefined) =>
    addresses.find((address) => address.id === addressId) ?? firstAddress;

  return {
    shipping: findAddress(customer?.defaultShippingAddressId),
    billing: findAddress(customer?.defaultBillingAddressId),
  };
}

export function formatAddress(address: BaseAddress): string {
  return [address.streetName, address.city, address.postalCode, address.country]
    .filter(Boolean)
    .join(', ');
}
