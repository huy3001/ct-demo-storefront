'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BaseAddress, Cart } from '@commercetools/platform-sdk';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { COUNTRY_CONFIG, formatMoney, getLocalizedString } from '@/lib/utils';

type Address = BaseAddress & { id?: string };
type Customer = {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  addresses: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  defaultShippingAddress?: Address;
  defaultBillingAddress?: Address;
};
type ShippingMethod = {
  id: string;
  name: string;
  description?: string;
  centAmount: number;
  currencyCode: string;
};
type QuoteCheckoutData = {
  cart: Cart;
  customer: Customer;
  shippingMethods: ShippingMethod[];
};
type AddressFields = {
  firstName: string;
  lastName: string;
  company: string;
  streetName: string;
  streetNumber: string;
  additionalStreetInfo: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
};

const emptyAddress = (country = 'US'): AddressFields => ({
  firstName: '',
  lastName: '',
  company: '',
  streetName: '',
  streetNumber: '',
  additionalStreetInfo: '',
  city: '',
  state: '',
  postalCode: '',
  country,
  phone: '',
  email: '',
});

function addressFields(
  address?: Address,
  customer?: Customer,
  country = 'US',
): AddressFields {
  return {
    firstName: address?.firstName ?? customer?.firstName ?? '',
    lastName: address?.lastName ?? customer?.lastName ?? '',
    company: address?.company ?? '',
    streetName: address?.streetName ?? '',
    streetNumber: address?.streetNumber ?? '',
    additionalStreetInfo: address?.additionalStreetInfo ?? '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    postalCode: address?.postalCode ?? '',
    country: address?.country ?? country,
    phone: address?.phone ?? customer?.phone ?? '',
    email: address?.email ?? customer?.email ?? '',
  };
}

function toAddress(address: AddressFields): BaseAddress {
  return {
    firstName: address.firstName.trim(),
    lastName: address.lastName.trim(),
    company: address.company.trim() || undefined,
    streetName: address.streetName.trim(),
    streetNumber: address.streetNumber.trim() || undefined,
    additionalStreetInfo: address.additionalStreetInfo.trim() || undefined,
    city: address.city.trim(),
    state: address.state.trim() || undefined,
    postalCode: address.postalCode.trim(),
    country: address.country.trim().toUpperCase(),
    phone: address.phone.trim() || undefined,
    email: address.email.trim() || undefined,
  };
}

function isValidAddress(address: AddressFields): boolean {
  return Boolean(
    address.firstName.trim() &&
      address.lastName.trim() &&
      address.streetName.trim() &&
      address.city.trim() &&
      address.postalCode.trim() &&
      /^[A-Za-z]{2}$/.test(address.country.trim()),
  );
}

function addressLabel(address: Address): string {
  return [
    address.company,
    address.streetName,
    address.streetNumber,
    address.city,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

function AddressFieldsForm({
  title,
  value,
  addresses,
  customer,
  onChange,
}: {
  title: string;
  value: AddressFields;
  addresses: Address[];
  customer: Customer;
  onChange: (value: AddressFields) => void;
}) {
  const fields: Array<{
    key: keyof AddressFields;
    label: string;
    required?: boolean;
    wide?: boolean;
  }> = [
    { key: 'firstName', label: 'First name', required: true },
    { key: 'lastName', label: 'Last name', required: true },
    { key: 'company', label: 'Company' },
    { key: 'streetName', label: 'Street address', required: true, wide: true },
    { key: 'streetNumber', label: 'Street number' },
    { key: 'additionalStreetInfo', label: 'Address line 2' },
    { key: 'city', label: 'City', required: true },
    { key: 'state', label: 'State / province' },
    { key: 'postalCode', label: 'Postal code', required: true },
    { key: 'country', label: 'Country code', required: true },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase">{title}</h3>
        {addresses.length > 0 && (
          <select
            aria-label={`Select saved ${title.toLowerCase()}`}
            className="max-w-[65%] rounded-sm border border-border bg-white px-3 py-2 text-sm"
            value=""
            onChange={(event) => {
              const selected = addresses.find(
                (address) => address.id === event.target.value,
              );
              if (selected) onChange(addressFields(selected, customer));
            }}
          >
            <option value="">Select a saved address</option>
            {addresses.map((address, index) => (
              <option key={address.id ?? index} value={address.id ?? ''}>
                {addressLabel(address)}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, required, wide }) => (
          <label
            key={key}
            className={`block text-sm ${wide ? 'sm:col-span-2' : ''}`}
          >
            <span>
              {label}
              {required ? ' *' : ''}
            </span>
            <input
              autoComplete="off"
              required={required}
              maxLength={key === 'country' ? 2 : undefined}
              value={value[key]}
              onChange={(event) =>
                onChange({ ...value, [key]: event.target.value })
              }
              className="mt-1 w-full rounded-sm border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function StepHeading({
  number,
  label,
  active,
  complete,
  onEdit,
}: {
  number: number;
  label: string;
  active: boolean;
  complete: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-7 items-center justify-center rounded-full text-sm font-semibold ${
            complete
              ? 'bg-emerald-100 text-emerald-800'
              : active
                ? 'bg-charcoal text-white'
                : 'border border-charcoal-light text-charcoal'
          }`}
        >
          {complete ? '✓' : number}
        </span>
        <h2 className="font-semibold">{label}</h2>
      </div>
      {complete && !active && (
        <button
          type="button"
          onClick={onEdit}
          className="text-sm underline"
        >
          Edit
        </button>
      )}
    </div>
  );
}

export default function QuoteCheckoutPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [data, setData] = useState<QuoteCheckoutData | null>(null);
  const [shippingAddress, setShippingAddress] = useState<AddressFields>(
    emptyAddress(),
  );
  const [billingAddress, setBillingAddress] = useState<AddressFields>(
    emptyAddress(),
  );
  const [sameBilling, setSameBilling] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
  const [step, setStep] = useState(1);
  const [addressesComplete, setAddressesComplete] = useState(false);
  const [deliveryComplete, setDeliveryComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(
          `/api/quote-checkout?locale=${encodeURIComponent(locale)}`,
          { signal: controller.signal },
        );
        const body = (await response.json()) as
          | QuoteCheckoutData
          | { message?: string };
        if (!response.ok || !('cart' in body)) {
          throw new Error(
            'message' in body ? body.message : 'Unable to load quote checkout.',
          );
        }
        const cart = body.cart;
        const country = COUNTRY_CONFIG[locale]?.country ?? 'US';
        const defaultShipping =
          cart.shippingAddress ?? body.customer.defaultShippingAddress;
        const defaultBilling =
          cart.billingAddress ?? body.customer.defaultBillingAddress;
        const shipping = addressFields(defaultShipping, body.customer, country);
        const billing = addressFields(
          defaultBilling ?? defaultShipping,
          body.customer,
          country,
        );
        const hasAddresses =
          isValidAddress(shipping) && isValidAddress(billing);
        const hasMethod = Boolean(cart.shippingInfo?.shippingMethod?.id);
        setData(body);
        setShippingAddress(shipping);
        setBillingAddress(billing);
        setSameBilling(!defaultBilling);
        setShippingMethods(body.shippingMethods);
        setSelectedMethodId(cart.shippingInfo?.shippingMethod?.id ?? '');
        setAddressesComplete(hasAddresses);
        setDeliveryComplete(hasMethod);
        setStep(hasAddresses ? (hasMethod ? 3 : 2) : 1);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load quote checkout.',
          );
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [locale]);

  const total = data?.cart.totalPrice;
  const canSubmit =
    addressesComplete &&
    deliveryComplete &&
    purchaseOrderNumber.trim().length > 0 &&
    !busy;

  const markAddressChanged = useCallback(
    (value: AddressFields, type: 'shipping' | 'billing') => {
      if (type === 'shipping') setShippingAddress(value);
      else setBillingAddress(value);
      setAddressesComplete(false);
      setDeliveryComplete(false);
    },
    [],
  );

  async function saveAddresses() {
    if (!data || !isValidAddress(shippingAddress)) return;
    const billing = sameBilling ? shippingAddress : billingAddress;
    if (!isValidAddress(billing)) return;

    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/quote-checkout', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          shippingAddress: toAddress(shippingAddress),
          billingAddress: toAddress(billing),
        }),
      });
      const body = (await response.json()) as
        | { cart: Cart; shippingMethods: ShippingMethod[] }
        | { message?: string };
      if (!response.ok || !('cart' in body)) {
        throw new Error(
          'message' in body ? body.message : 'Unable to save addresses.',
        );
      }
      setData({ ...data, cart: body.cart, shippingMethods: body.shippingMethods });
      setShippingMethods(body.shippingMethods);
      setBillingAddress(billing);
      setAddressesComplete(true);
      setDeliveryComplete(false);
      setSelectedMethodId('');
      setStep(2);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Unable to save addresses.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveDeliveryMethod() {
    if (!data || !selectedMethodId) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/quote-checkout', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          shippingAddress: toAddress(shippingAddress),
          billingAddress: toAddress(sameBilling ? shippingAddress : billingAddress),
          shippingMethodId: selectedMethodId,
        }),
      });
      const body = (await response.json()) as
        | { cart: Cart; shippingMethods: ShippingMethod[] }
        | { message?: string };
      if (!response.ok || !('cart' in body)) {
        throw new Error(
          'message' in body ? body.message : 'Unable to save delivery method.',
        );
      }
      setData({ ...data, cart: body.cart, shippingMethods: body.shippingMethods });
      setShippingMethods(body.shippingMethods);
      setDeliveryComplete(true);
      setStep(3);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save delivery method.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitQuoteRequest() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/quote-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, purchaseOrderNumber }),
      });
      const body = (await response.json()) as
        | { quoteRequestId: string }
        | { message?: string };
      if (!response.ok || !('quoteRequestId' in body)) {
        throw new Error(
          'message' in body ? body.message : 'Unable to submit quote request.',
        );
      }
      router.push(`/quote-submitted?quoteRequestId=${encodeURIComponent(body.quoteRequestId)}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to submit quote request.',
      );
      setBusy(false);
    }
  }

  const billing = sameBilling ? shippingAddress : billingAddress;
  const currentMethod = shippingMethods.find(({ id }) => id === selectedMethodId);
  const addressText = (address: AddressFields) =>
    [
      [address.firstName, address.lastName].filter(Boolean).join(' '),
      address.company,
      [address.streetNumber, address.streetName].filter(Boolean).join(' '),
      address.additionalStreetInfo,
      [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
      address.country,
    ]
      .filter(Boolean)
      .join(', ');

  const lineItems = useMemo(() => data?.cart.lineItems ?? [], [data?.cart.lineItems]);

  if (!data && !error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center text-charcoal-light">
        Loading quote checkout…
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p role="alert" className="text-sm text-red-700">{error}</p>
        {error.toLowerCase().includes('sign in') && (
          <Link
            href="/login"
            locale={locale}
            className="mt-5 inline-block rounded-sm bg-charcoal px-6 py-3 text-sm text-white"
          >
            Sign in
          </Link>
        )}
        <Link href="/cart" locale={locale} className="mt-5 inline-block underline">
          Return to cart
        </Link>
      </main>
    );
  }

  if (!data) return null;
  if (data.cart.lineItems.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <Link href="/cart" locale={locale} className="mt-5 inline-block underline">
          Return to cart
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-7 border-b border-border pb-4 text-xl font-semibold">
        Update to Submit Quote
      </h1>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-sm bg-white p-6">
            <StepHeading
              number={1}
              label="Addresses"
              active={step === 1}
              complete={addressesComplete}
              onEdit={() => setStep(1)}
            />
            {step === 1 ? (
              <>
                <AddressFieldsForm
                  title="Shipping address"
                  value={shippingAddress}
                  addresses={data.customer.addresses}
                  customer={data.customer}
                  onChange={(value) => markAddressChanged(value, 'shipping')}
                />
                <div className="mt-6 border-t border-border pt-5">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sameBilling}
                      onChange={(event) => {
                        setSameBilling(event.target.checked);
                        setAddressesComplete(false);
                        setDeliveryComplete(false);
                      }}
                    />
                    Billing address is the same as shipping
                  </label>
                  {!sameBilling && (
                    <AddressFieldsForm
                      title="Billing address"
                      value={billingAddress}
                      addresses={data.customer.addresses}
                      customer={data.customer}
                      onChange={(value) => markAddressChanged(value, 'billing')}
                    />
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={
                      busy ||
                      !isValidAddress(shippingAddress) ||
                      !isValidAddress(billing)
                    }
                    onClick={() => void saveAddresses()}
                    className="rounded-sm bg-charcoal px-7 py-3 text-sm text-white hover:bg-charcoal-light disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? 'Saving…' : 'Continue to delivery'}
                  </button>
                </div>
              </>
            ) : addressesComplete ? (
              <div className="grid gap-5 rounded-sm border border-border p-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase">Shipping address</h3>
                  <p className="text-sm">{addressText(shippingAddress)}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase">Billing address</h3>
                  <p className="text-sm">{addressText(billing)}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-sm bg-white p-6">
            <StepHeading
              number={2}
              label="Delivery"
              active={step === 2}
              complete={deliveryComplete}
              onEdit={() => setStep(2)}
            />
            {step === 2 && addressesComplete ? (
              <>
                {shippingMethods.length === 0 ? (
                  <p className="text-sm text-charcoal-light">
                    No delivery methods are available for this address.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-center justify-between gap-4 rounded-sm border p-4 ${
                          selectedMethodId === method.id
                            ? 'border-charcoal'
                            : 'border-border'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="quote-delivery-method"
                            checked={selectedMethodId === method.id}
                            onChange={() => setSelectedMethodId(method.id)}
                          />
                          <span>
                            <span className="block text-sm font-medium">{method.name}</span>
                            {method.description && (
                              <span className="block text-xs text-charcoal-light">
                                {method.description}
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="text-sm font-medium">
                          {formatMoney(method.centAmount, method.currencyCode, locale)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={busy || !selectedMethodId || shippingMethods.length === 0}
                    onClick={() => void saveDeliveryMethod()}
                    className="rounded-sm bg-charcoal px-7 py-3 text-sm text-white hover:bg-charcoal-light disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? 'Saving…' : 'Continue to payment'}
                  </button>
                </div>
              </>
            ) : deliveryComplete ? (
              <div className="rounded-sm border border-border p-4 text-sm">
                <p className="font-medium">{currentMethod?.name ?? data.cart.shippingInfo?.shippingMethodName}</p>
                {currentMethod && (
                  <p className="mt-1 text-charcoal-light">
                    {formatMoney(currentMethod.centAmount, currentMethod.currencyCode, locale)}
                  </p>
                )}
              </div>
            ) : null}
          </section>

          <section className="rounded-sm bg-white p-6">
            <StepHeading
              number={3}
              label="Payment"
              active={step === 3}
              complete={purchaseOrderNumber.trim().length > 0}
              onEdit={() => setStep(3)}
            />
            {step === 3 && deliveryComplete && (
              <div className="rounded-sm border border-border p-4">
                <p className="mb-4 text-sm font-medium">Purchase Order (PO)</p>
                <p className="mb-4 text-sm text-charcoal-light">
                  Enter a purchase order number generated by your organization.
                </p>
                <label className="block max-w-sm text-sm font-medium">
                  PO Number <span aria-hidden="true">*</span>
                  <input
                    required
                    maxLength={100}
                    value={purchaseOrderNumber}
                    onChange={(event) => setPurchaseOrderNumber(event.target.value)}
                    className="mt-2 w-full rounded-sm border border-border px-3 py-2 font-normal"
                  />
                </label>
              </div>
            )}
          </section>
          {error && (
            <p role="alert" className="rounded-sm bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <aside className="rounded-sm bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Quote summary</h2>
          <div className="mt-4 space-y-4 border-b border-border pb-4">
            {lineItems.map((item) => {
              const name = getLocalizedString(item.name, locale);
              const image = item.variant.images?.[0]?.url;
              return (
                <div key={item.id} className="flex gap-3">
                  {image && (
                    <Image
                      src={image}
                      alt={name}
                      width={64}
                      height={64}
                      unoptimized
                      className="size-16 rounded-sm object-contain"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="mt-1 text-xs text-charcoal-light">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm">
                    {formatMoney(
                      item.totalPrice.centAmount,
                      item.totalPrice.currencyCode,
                      locale,
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt>Subtotal</dt>
              <dd>
                {formatMoney(
                  lineItems.reduce((sum, item) => sum + item.totalPrice.centAmount, 0),
                  total?.currencyCode ?? 'USD',
                  locale,
                )}
              </dd>
            </div>
            {data.cart.taxedPrice?.totalTax && (
              <div className="flex justify-between gap-3">
                <dt>Tax</dt>
                <dd>
                  {formatMoney(
                    data.cart.taxedPrice.totalTax.centAmount,
                    data.cart.taxedPrice.totalTax.currencyCode,
                    locale,
                  )}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <dt>Delivery</dt>
              <dd>
                {deliveryComplete && data.cart.shippingInfo
                  ? formatMoney(
                      data.cart.shippingInfo.price.centAmount,
                      data.cart.shippingInfo.price.currencyCode,
                      locale,
                    )
                  : 'Calculated later'}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-base font-semibold">
              <dt>Total</dt>
              <dd>
                {total
                  ? formatMoney(total.centAmount, total.currencyCode, locale)
                  : '—'}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submitQuoteRequest()}
            className="mt-5 w-full rounded-sm bg-charcoal px-4 py-3 text-sm font-medium text-white hover:bg-charcoal-light disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-charcoal-light"
          >
            {busy ? 'Submitting…' : 'Submit quote request'}
          </button>
          {!canSubmit && (
            <p className="mt-2 text-center text-xs text-charcoal-light">
              Complete all steps and enter a PO Number to submit.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
