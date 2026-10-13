'use client';

import { useCallback, useEffect, useState } from 'react';
import type { BaseAddress, Cart } from '@commercetools/platform-sdk';
import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import { Link, useRouter } from '@/i18n/routing';
import { COUNTRY_CONFIG, formatMoney } from '@/lib/utils';
import Button from '@/components/ui/atoms/button';
import Checkbox from '@/components/ui/atoms/checkbox';
import Dropdown from '@/components/ui/atoms/dropdown';
import Input from '@/components/ui/atoms/input';
import Radio from '@/components/ui/atoms/radio';
import Skeleton from '@/components/ui/atoms/skeleton';
import SummaryAccordion from '@/components/ui/organisms/order-summary/components/summary-accordion';
import useCostsData from '@/components/ui/organisms/order-payment-section/hooks/useCostsData';

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
  const translate = useTranslations();
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

  const addressDropdownItems = addresses.map((address) => ({
    label: addressLabel(address),
    value: address.id ?? '',
  }));

  return (
    <section className="mt-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase">{title}</h3>
        {addresses.length > 0 && (
          <Dropdown
            aria-label={`Select saved ${title.toLowerCase()}`}
            containerClassName="min-w-md max-w-2/3"
            value=""
            onChange={(event) => {
              const selected = addresses.find(
                (address) => address.id === event.target.value,
              );
              if (selected) onChange(addressFields(selected, customer));
            }}
            items={[
              {
                label: translate('checkout.select-an-address'),
                value: '',
              },
              ...addressDropdownItems,
            ]}
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, required }) => (
          <Input
            key={key}
            label={label}
            name={key}
            placeholder={label}
            autoComplete="off"
            required={required}
            maxLength={key === 'country' ? 2 : undefined}
            value={value[key]}
            onChange={(event) =>
              onChange({ ...value, [key]: event.target.value })
            }
          />
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
  const translate = useTranslations();

  return (
    <div className="flex items-center justify-between gap-3">
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
        <Button
          variant="underlined"
          onClick={onEdit}
          className="text-terra! p-0!"
        >
          {translate('common.edit')}
        </Button>
      )}
    </div>
  );
}

export default function QuoteCheckoutPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const translate = useTranslations();
  const [data, setData] = useState<QuoteCheckoutData | null>(null);
  const [shippingAddress, setShippingAddress] =
    useState<AddressFields>(emptyAddress());
  const [billingAddress, setBillingAddress] =
    useState<AddressFields>(emptyAddress());
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
            'message' in body
              ? body.message
              : translate('quotes.failed-to-load-quote'),
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
              : translate('quotes.failed-to-load-quote'),
          );
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [locale, translate]);

  const { costsToRender, total } = useCostsData({ dataReference: 'cart', order: data?.cart });
  
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
          'message' in body
            ? body.message
            : translate('quotes.failed-to-save-addresses'),
        );
      }
      setData({
        ...data,
        cart: body.cart,
        shippingMethods: body.shippingMethods,
      });
      setShippingMethods(body.shippingMethods);
      setBillingAddress(billing);
      setAddressesComplete(true);
      setDeliveryComplete(false);
      setSelectedMethodId('');
      setStep(2);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : translate('quotes.failed-to-save-addresses'),
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
          billingAddress: toAddress(
            sameBilling ? shippingAddress : billingAddress,
          ),
          shippingMethodId: selectedMethodId,
        }),
      });
      const body = (await response.json()) as
        | { cart: Cart; shippingMethods: ShippingMethod[] }
        | { message?: string };
      if (!response.ok || !('cart' in body)) {
        throw new Error(
          'message' in body
            ? body.message
            : translate('quotes.failed-to-save-delivery-method'),
        );
      }
      setData({
        ...data,
        cart: body.cart,
        shippingMethods: body.shippingMethods,
      });
      setShippingMethods(body.shippingMethods);
      setDeliveryComplete(true);
      setStep(3);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : translate('quotes.failed-to-save-delivery-method'),
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
          'message' in body
            ? body.message
            : translate('quotes.failed-to-submit-quote-request'),
        );
      }
      router.push(
        `/quote-submitted?quoteRequestId=${encodeURIComponent(body.quoteRequestId)}`,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : translate('quotes.failed-to-submit-quote-request'),
      );
      setBusy(false);
    }
  }

  const billing = sameBilling ? shippingAddress : billingAddress;
  const currentMethod = shippingMethods.find(
    ({ id }) => id === selectedMethodId,
  );
  const addressText = (address: AddressFields) =>
    [
      [address.firstName, address.lastName].filter(Boolean).join(' '),
      address.company,
      [address.streetNumber, address.streetName].filter(Boolean).join(' '),
      address.additionalStreetInfo,
      [address.city, address.state, address.postalCode]
        .filter(Boolean)
        .join(', '),
      address.country,
    ]
      .filter(Boolean)
      .join(', ');

  if (!data && !error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <Skeleton className="h-5 w-full" />
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p
          role="alert"
          className="text-sm text-red-700"
        >
          {error}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/cart"
            locale={locale}
          >
            <Button variant="secondary">
              {translate('quotes.return-to-cart')}
            </Button>
          </Link>
          {error.toLowerCase().includes('sign in') && (
            <Link
              href="/login"
              locale={locale}
            >
              <Button>{translate('account.sign-in')}</Button>
            </Link>
          )}
        </div>
      </main>
    );
  }

  if (!data) return null;
  if (data.cart.lineItems.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-center">
        <h1 className="text-xl font-semibold mb-6">
          {translate('cart.cart-empty-ask')}
        </h1>
        <Link
          href="/category/all"
          locale={locale}
        >
          <Button variant="secondary">
            {translate('cart.continue-shopping')}
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-7 border-b border-border pb-4 text-xl font-semibold">
        Update to Submit Quote
      </h1>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-sm bg-white p-6 space-y-6">
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
                  title={translate('checkout.shippingAddress')}
                  value={shippingAddress}
                  addresses={data.customer.addresses}
                  customer={data.customer}
                  onChange={(value) => markAddressChanged(value, 'shipping')}
                />
                <div className="mt-6 border-t border-border pt-5">
                  <Checkbox
                    label={translate('checkout.billingAddressSameAsShipping')}
                    checked={sameBilling}
                    onChange={(event) => {
                      setSameBilling(event.checked);
                      setAddressesComplete(false);
                      setDeliveryComplete(false);
                    }}
                    containerClassName="cursor-pointer"
                  />

                  {!sameBilling && (
                    <AddressFieldsForm
                      title={translate('checkout.billingAddress')}
                      value={billingAddress}
                      addresses={data.customer.addresses}
                      customer={data.customer}
                      onChange={(value) => markAddressChanged(value, 'billing')}
                    />
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    disabled={
                      busy ||
                      !isValidAddress(shippingAddress) ||
                      !isValidAddress(billing)
                    }
                    onClick={() => void saveAddresses()}
                  >
                    {busy
                      ? translate('account.saving')
                      : translate('quotes.continue-to-delivery')}
                  </Button>
                </div>
              </>
            ) : addressesComplete ? (
              <div className="grid gap-5 rounded-sm border border-border p-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase">
                    {translate('checkout.shippingAddress')}
                  </h3>
                  <p className="text-sm">{addressText(shippingAddress)}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase">
                    {translate('checkout.billingAddress')}
                  </h3>
                  <p className="text-sm">{addressText(billing)}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-sm bg-white p-6 space-y-6">
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
                    {translate('quotes.no-delivery-methods')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex cursor-pointer items-center justify-between gap-4 rounded-sm border p-4 ${
                          selectedMethodId === method.id
                            ? 'border-charcoal'
                            : 'border-border'
                        }`}
                      >
                        <Radio
                          checked={selectedMethodId === method.id}
                          onSelected={() => setSelectedMethodId(method.id)}
                          tabIndex={-1}
                          label={
                            <>
                              <span className="block text-sm font-medium">
                                {method.name}
                              </span>
                              {method.description && (
                                <span className="block text-xs text-charcoal-light">
                                  {method.description}
                                </span>
                              )}
                            </>
                          }
                        />

                        <span className="text-sm font-medium">
                          {formatMoney(
                            method.centAmount,
                            method.currencyCode,
                            locale,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    disabled={
                      busy || !selectedMethodId || shippingMethods.length === 0
                    }
                    onClick={() => void saveDeliveryMethod()}
                  >
                    {busy
                      ? translate('account.saving')
                      : translate('checkout.nextPayment')}
                  </Button>
                </div>
              </>
            ) : deliveryComplete ? (
              <div className="rounded-sm border border-border p-4 text-sm">
                <p className="font-medium">
                  {currentMethod?.name ??
                    data.cart.shippingInfo?.shippingMethodName}
                </p>
                {currentMethod && (
                  <p className="mt-1 text-charcoal-light">
                    {formatMoney(
                      currentMethod.centAmount,
                      currentMethod.currencyCode,
                      locale,
                    )}
                  </p>
                )}
              </div>
            ) : null}
          </section>

          <section className="rounded-sm bg-white p-6 space-y-6">
            <StepHeading
              number={3}
              label="Payment"
              active={step === 3}
              complete={purchaseOrderNumber.trim().length > 0}
              onEdit={() => setStep(3)}
            />
            {step === 3 && deliveryComplete && (
              <div className="rounded-sm border border-border p-4">
                <p className="mb-4 text-sm font-medium">
                  {translate('quotes.purchase-order')}
                </p>
                <p className="mb-4 text-sm text-charcoal-light">
                  {translate('quotes.purchase-order-help')}
                </p>
                <Input
                  label={translate('quotes.po-number')}
                  id="po-number"
                  required
                  placeholder={translate('quotes.po-number')}
                  value={purchaseOrderNumber}
                  onChange={(event) =>
                    setPurchaseOrderNumber(event.target.value)
                  }
                />
              </div>
            )}
          </section>
          {error && (
            <p
              role="alert"
              className="rounded-sm bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </div>

        <aside className="rounded-sm bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">{translate('quotes.quote-summary')}</h2>

          <SummaryAccordion cart={data?.cart} />

          <dl className="border-t border-border pt-4 space-y-4 text-sm">
            <div className="grid gap-2">
              {costsToRender.map(
                ({ key, label, value }) =>
                  !!value?.centAmount &&
                  value.centAmount > 0 && (
                    <div
                      key={key}
                      className="flex items-center justify-between capitalize text-gray-600"
                    >
                      <dt>{label}</dt>
                      <dd>
                        {key === 'discount' && '-'}
                        {formatMoney(
                          value.centAmount ?? 0,
                          value.currencyCode ?? 'USD',
                          locale,
                        )}
                      </dd>
                    </div>
                  ),
              )}
              <div className="flex items-center justify-between capitalize text-gray-600">
                <dt>{translate('quotes.delivery')}</dt>
                <dd>
                  {deliveryComplete && data.cart.shippingInfo
                    ? formatMoney(
                        data.cart.shippingInfo.price.centAmount,
                        data.cart.shippingInfo.price.currencyCode,
                        locale,
                      )
                    : translate('quotes.calculated-later')}
                </dd>
              </div>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-base font-semibold">
              <dt>{translate('quotes.total')}</dt>
              <dd>
                {total
                  ? formatMoney(
                      total.value.centAmount ?? 0,
                      total.value.currencyCode ?? 'USD',
                      locale,
                    )
                  : '—'}
              </dd>
            </div>
          </dl>
          <Button
            size="full"
            variant="primary"
            disabled={!canSubmit}
            onClick={() => void submitQuoteRequest()}
            className="mt-5"
          >
            {busy
              ? translate('quotes.submitting')
              : translate('quotes.submit-quote-request')}
          </Button>
          {!canSubmit && (
            <p className="mt-2 text-center text-xs text-charcoal-light">
              {translate('quotes.complete-all-steps')}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
