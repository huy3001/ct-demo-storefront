'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useTranslations } from 'use-intl';
import { Link } from '@/i18n/routing';
import Skeleton from '@/components/ui/atoms/skeleton';
import Table from '@/components/ui/organisms/table';
import { formatMoney, getLocalizedString } from '@/lib/utils';
import type { Order } from '@commercetools/platform-sdk';
import type { CompanyManagement } from '@/lib/company';
import type { ApprovalFlow } from '@/types/approval-flow';
import ApprovalFlowStatusBadge from './ApprovalFlowStatusBadge';

const flowsFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load approval flows');
  return response.json() as Promise<ApprovalFlow[]>;
};

const companyFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load company information');
  return response.json() as Promise<CompanyManagement>;
};

const orderFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load order');
  return response.json() as Promise<Order>;
};

interface MoneyValue {
  centAmount: number;
  currencyCode: string;
}

// Missing values stay empty instead of failing the page.
function money(value: MoneyValue | undefined, locale: string): string {
  return value ? formatMoney(value.centAmount, value.currencyCode, locale) : '';
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-charcoal">{label}</dt>
      <dd className="mt-1 text-sm text-charcoal-light">{children}</dd>
    </div>
  );
}

export default function ApprovalFlowDetailPage() {
  const translate = useTranslations();
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const searchParams = useSearchParams();
  const businessUnitKeyParam = searchParams.get('businessUnitKey');

  // Direct visits without the query param fall back to the default business unit.
  const { data: company } = useSWR(
    businessUnitKeyParam ? null : '/api/account/company',
    companyFetcher,
    { revalidateOnFocus: false },
  );
  const businessUnitKey = businessUnitKeyParam || company?.company.key || '';

  const { data: flows, error: flowsError } = useSWR(
    businessUnitKey
      ? `/api/account/approval-flows?businessUnitKey=${encodeURIComponent(businessUnitKey)}`
      : null,
    flowsFetcher,
    { revalidateOnFocus: false },
  );
  const flow = flows?.find((candidate) => candidate.id === id);

  const { data: order } = useSWR(
    flow ? `/api/account/orders/${encodeURIComponent(flow.orderId)}` : null,
    orderFetcher,
    { revalidateOnFocus: false },
  );

  const backLink = (
    <Link
      href="/account/approval-flows"
      locale={locale}
      className="text-sm text-terra hover:underline"
    >
      {translate('account.approval-flows-back')}
    </Link>
  );

  if (!flow && !flowsError && (flows === undefined || !businessUnitKey)) {
    return <Skeleton className="h-5 w-full" />;
  }

  if (!flow) {
    return (
      <div>
        <h1 className="text-xl font-semibold">
          {translate('account.approval-flows-not-found')}
        </h1>
        <div className="mt-4">{backLink}</div>
      </div>
    );
  }

  const items = (order?.lineItems ?? []).filter(
    (item) => item.variant?.sku && flow.skus.includes(item.variant.sku),
  );
  console.log({ order, items });

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-xl font-semibold">
          {translate('account.approval-flows-details-title')}
        </h1>
        {backLink}
      </div>

      <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4">
          <Field label={translate('account.approval-flows-detail-id')}>
            {flow.id}
          </Field>
          <Field
            label={translate('account.approval-flows-detail-order-number')}
          >
            {flow.orderNumber}
          </Field>
        </div>

        <div className="space-y-4">
          <Field
            label={translate('account.approval-flows-detail-creation-date')}
          >
            {new Date(flow.createdAt).toLocaleDateString(locale)}
          </Field>
          <Field label={translate('account.approval-flows-status')}>
            <ApprovalFlowStatusBadge status={flow.status} />
          </Field>
        </div>

        <div className="space-y-4">
          <Field label={translate('account.business-unit')}>
            {flow.businessUnit}
          </Field>
        </div>
      </dl>

      {items.length > 0 && (
        <>
          <section className="mt-8 pt-8 border-t border-border">
            <h2 className="mb-4 text-lg font-semibold">
              {translate('account.approval-flows-detail-items', {
                count: items.length,
              })}
            </h2>

            <Table>
              <Table.Container>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>
                      {translate('account.approval-flows-detail-product')}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {translate('account.approval-flows-detail-sku')}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {translate('account.approval-flows-detail-qty')}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {translate('account.approval-flows-detail-price')}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {translate('account.approval-flows-detail-total')}
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {items.map((item) => {
                    const name = getLocalizedString(item.name, locale);
                    const imageUrl = item.variant.images?.[0]?.url;
                    return (
                      <Table.Row key={item.id}>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={name}
                                width={48}
                                height={48}
                                className="size-12 rounded-sm object-cover"
                              />
                            ) : null}
                            <span>{name}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell
                          cellHeading={translate(
                            'account.approval-flows-detail-sku',
                          )}
                        >
                          <span>{item.variant.sku}</span>
                        </Table.Cell>
                        <Table.Cell
                          cellHeading={translate(
                            'account.approval-flows-detail-qty',
                          )}
                        >
                          <span>{item.quantity}</span>
                        </Table.Cell>
                        <Table.Cell
                          cellHeading={translate(
                            'account.approval-flows-detail-price',
                          )}
                        >
                          <span>{money(item.price?.value, locale)}</span>
                        </Table.Cell>
                        <Table.Cell
                          cellHeading={translate(
                            'account.approval-flows-detail-total',
                          )}
                        >
                          <span>
                            {money(
                              item.taxedPrice?.totalNet ?? item.totalPrice,
                              locale,
                            )}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Container>
            </Table>
          </section>

          <dl className="border-t border-border w-full pt-4 grid grid-cols-2 gap-y-3 text-sm lg:border-t-0 lg:max-w-sm lg:ml-auto lg:mt-6 lg:pt-0">
            <dt className="text-charcoal-light">
              {translate('account.approval-flows-detail-subtotal')}
            </dt>
            <dd className="text-right">
              {money(order?.taxedPrice?.totalNet ?? order?.totalPrice, locale)}
            </dd>
            {/* <dt className="text-charcoal-light">{translate('account.approval-flows-detail-discount')}</dt>
            <dd className="text-right">
              {money(order?.discountedPrice, locale)}
            </dd> */}
            <dt className="text-charcoal-light">
              {translate('account.approval-flows-detail-tax')}
            </dt>
            <dd className="text-right">
              {money(order?.taxedPrice?.totalTax, locale)}
            </dd>
            <dt className="border-t border-border pt-3 font-semibold text-base">
              {translate('account.approval-flows-detail-total')}
            </dt>
            <dd className="border-t border-border pt-3 text-right font-semibold text-base">
              {money(
                order?.taxedPrice?.totalGross ?? order?.totalPrice,
                locale,
              )}
            </dd>
          </dl>
        </>
      )}
    </div>
  );
}
