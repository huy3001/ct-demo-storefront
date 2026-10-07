'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import { Link } from '@/i18n/routing';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/atoms/button';
import Dropdown from '@/components/ui/atoms/dropdown';
import Input from '@/components/ui/atoms/input';
import Skeleton from '@/components/ui/atoms/skeleton';
import Table from '@/components/ui/organisms/table';
import Tabs from '@/components/ui/organisms/tabs';
import type { CompanyManagement } from '@/lib/company';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? 'Unable to load company information');
  }
  return response.json() as Promise<CompanyManagement>;
};

type Tab = 'general' | 'addresses' | 'associates' | 'business-units';

function SearchToolbar({
  value,
  onChange,
  href,
  label,
  locale,
}: {
  value: string;
  onChange: (value: string) => void;
  href: string;
  label: string;
  locale: string;
}) {
  const translate = useTranslations();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <Input
          labelPosition="inline"
          aria-label={`${translate('common.search')}...`}
          placeholder={`${translate('common.search')}...`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-sm border border-border px-3 text-sm sm:max-w-sm"
        />
        {value ? (
          <button
            type="button"
            aria-label={translate('common.clear')}
            className="absolute right-3 bottom-3 flex items-center"
            onClick={() => onChange('')}
          >
            <XMarkIcon className="size-4 text-charcoal" />
          </button>
        ) : (
          <MagnifyingGlassIcon className="pointer-events-none absolute right-3 bottom-3 size-4 text-charcoal" />
        )}
      </div>

      <Link
        href={href}
        locale={locale}
      >
        <Button>{label}</Button>
      </Link>
    </div>
  );
}

function EmptyTable({ colSpan }: { colSpan: number }) {
  const translate = useTranslations();

  return (
    <Table.Row>
      <Table.Cell colSpan={colSpan}>
        {translate('common.no-results-found')}
      </Table.Cell>
    </Table.Row>
  );
}

export default function CompanyAdmin() {
  const translate = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const { data, error, mutate } = useSWR('/api/account/company', fetcher, {
    revalidateOnFocus: false,
  });
  const [businessUnitId, setBusinessUnitId] = useState('');
  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState('');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: translate('account.company') },
    { id: 'addresses', label: translate('account.addresses') },
    { id: 'associates', label: translate('account.associates') },
    { id: 'business-units', label: translate('account.business-units') },
  ];

  const selectedBusinessUnitId = businessUnitId || data?.company.id || '';
  const filteredAddresses = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return (data?.addresses ?? []).filter((address) =>
      address.businessUnitId === selectedBusinessUnitId &&
      [address.companyName, address.address, address.city, address.state, address.postcode, address.country]
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [data?.addresses, query, selectedBusinessUnitId]);

  const filteredAssociates = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return (data?.associates ?? []).filter((associate) =>
      [associate.name, associate.email, associate.roles.join(' ')]
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [data?.associates, query]);

  const filteredBusinessUnits = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return (data?.businessUnits ?? []).filter((businessUnit) =>
      [businessUnit.name, businessUnit.key, businessUnit.parentUnit ?? '', businessUnit.email ?? '']
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [data?.businessUnits, query]);

  async function removeAssociate(id: string) {
    setActionError('');
    try {
      const response = await fetch('/api/account/company', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'associate', id }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body.message ?? translate('account.unable-to-remove-associate'),
        );
      }
      await mutate();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : translate('account.unable-to-remove-associate'),
      );
    }
  }

  async function removeAddress(id: string, businessUnitId: string) {
    setActionError('');
    try {
      const response = await fetch('/api/account/company', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'address', id, businessUnitId }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body.message ?? translate('account.unable-to-remove-address'),
        );
      }
      await mutate();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : translate('account.unable-to-remove-address'),
      );
    }
  }

  if (error) {
    return <p className="text-sm text-red-600">{error.message}</p>;
  }

  if (!data) {
    return <Skeleton className="h-5 w-full" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{translate('account.company')}</h1>

      <div className="w-full lg:max-w-sm">
        <Dropdown
          label={translate('account.business-unit')}
          id="business-unit"
          value={selectedBusinessUnitId}
          onChange={(event) => setBusinessUnitId(event.target.value)}
          items={data.businessUnits.map((businessUnit) => ({
            label: businessUnit.name,
            value: businessUnit.id,
          }))}
        />
      </div>

      <div>
        <Tabs>
          <Tabs.TabList>
            {tabs.map((item) => (
              <Tabs.Tab key={item.id}>{item.label}</Tabs.Tab>
            ))}
          </Tabs.TabList>

          <Tabs.Panels>
            <Tabs.Panel>
              <Table>
                <Table.Container>
                  <Table.Head>
                    <Table.Row>
                      <Table.HeaderCell>
                        {translate('common.name')}
                      </Table.HeaderCell>
                      <Table.HeaderCell>
                        {translate('common.email')}
                      </Table.HeaderCell>
                      <Table.HeaderCell />
                    </Table.Row>
                  </Table.Head>

                  <Table.Body>
                    <Table.Row>
                      <Table.Cell cellHeading={translate('common.name')}>
                        <span>{data.company.name}</span>
                      </Table.Cell>
                      <Table.Cell cellHeading={translate('common.email')}>
                        <span>{data.company.email ?? '—'}</span>
                      </Table.Cell>
                      <Table.Cell
                        cellHeading={translate('orders.action')}
                        className="lg:text-right"
                      >
                        <Link
                          href={`/account/company/${data.company.id}/edit`}
                          locale={locale}
                          className="text-terra hover:underline"
                        >
                          {translate('common.edit')}
                        </Link>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Container>
              </Table>
            </Tabs.Panel>

            <Tabs.Panel>
              <div>
                <SearchToolbar
                  value={query}
                  onChange={setQuery}
                  href="/account/company/addresses/new"
                  label="Add new address"
                  locale={locale}
                />

                <Table>
                  <Table.Container>
                    <Table.Head>
                      <Table.Row>
                        <Table.HeaderCell>
                          {translate('address.company-name')}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {translate('common.address')}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {translate('common.city')}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {translate('common.state')}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {translate('common.zipCode')}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {translate('common.country')}
                        </Table.HeaderCell>
                        <Table.HeaderCell />
                      </Table.Row>
                    </Table.Head>

                    <Table.Body>
                      {filteredAddresses.map((address) => (
                        <Table.Row key={address.id}>
                          <Table.Cell
                            cellHeading={translate('address.company-name')}
                          >
                            <span>{address.companyName}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('common.address')}>
                            <span>{address.address}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('common.city')}>
                            <span>{address.city}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('common.state')}>
                            <span>{address.state}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('common.zipCode')}>
                            <span>{address.postcode}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('common.country')}>
                            <span>{address.country}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('common.actions')}>
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/account/company/addresses/${address.id}/edit`}
                                locale={locale}
                                className="text-terra hover:underline"
                              >
                                {translate('common.edit')}
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  removeAddress(
                                    address.id,
                                    address.businessUnitId,
                                  )
                                }
                                className="text-red-600 hover:underline"
                              >
                                {translate('common.remove')}
                              </button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {filteredAddresses.length === 0 ? (
                        <EmptyTable colSpan={7} />
                      ) : null}
                    </Table.Body>
                  </Table.Container>
                </Table>
              </div>
            </Tabs.Panel>

            <Tabs.Panel>
              <div>
                <SearchToolbar
                  value={query}
                  onChange={setQuery}
                  href="/account/associate/new"
                  label="Add new associate"
                  locale={locale}
                />

                <Table>
                  <Table.Container>
                    <Table.Head>
                      <Table.Row>
                        <Table.HeaderCell>
                          {translate('common.name')}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {translate('common.email')}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {translate('account.role')}
                        </Table.HeaderCell>
                        <Table.HeaderCell />
                      </Table.Row>
                    </Table.Head>

                    <Table.Body>
                      {filteredAssociates.map((associate) => (
                        <Table.Row key={associate.id}>
                          <Table.Cell cellHeading={translate('common.name')}>
                            <span>{associate.name}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('common.email')}>
                            <span>{associate.email}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('account.role')}>
                            <span>{associate.roles.join(', ')}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('common.actions')}>
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/account/associate/${associate.id}/edit`}
                                locale={locale}
                                className="text-terra hover:underline"
                              >
                                {translate('common.edit')}
                              </Link>

                              <button
                                type="button"
                                onClick={() => removeAssociate(associate.id)}
                                className="text-red-600 hover:underline"
                              >
                                {translate('common.remove')}
                              </button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {filteredAssociates.length === 0 ? (
                        <EmptyTable colSpan={4} />
                      ) : null}
                    </Table.Body>
                  </Table.Container>
                </Table>
              </div>
            </Tabs.Panel>

            <Tabs.Panel>
              <div>
                <SearchToolbar
                  value={query}
                  onChange={setQuery}
                  href="/account/business-unit/new"
                  label="Add new business unit"
                  locale={locale}
                />

                <Table>
                  <Table.Container>
                    <Table.Head>
                      <Table.Row>
                        <Table.HeaderCell>
                          {translate('common.name')}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {translate('common.key')}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {translate('common.parent-unit')}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {translate('common.email')}
                        </Table.HeaderCell>
                        <Table.HeaderCell />
                      </Table.Row>
                    </Table.Head>

                    <Table.Body>
                      {filteredBusinessUnits.map((businessUnit) => (
                        <Table.Row key={businessUnit.id}>
                          <Table.Cell cellHeading={translate('common.name')}>
                            <span>{businessUnit.name}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('common.key')}>
                            <span>{businessUnit.key}</span>
                          </Table.Cell>
                          <Table.Cell
                            cellHeading={translate('common.parent-unit')}
                          >
                            <span>{businessUnit.parentUnit ?? '—'}</span>
                          </Table.Cell>
                          <Table.Cell cellHeading={translate('common.email')}>
                            <span>{businessUnit.email ?? '—'}</span>
                          </Table.Cell>
                          <Table.Cell
                            cellHeading={translate('orders.action')}
                            className="lg:text-right"
                          >
                            <Link
                              href={`/account/business-unit/${businessUnit.id}/edit`}
                              locale={locale}
                              className="text-terra hover:underline"
                            >
                              {translate('common.edit')}
                            </Link>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {filteredBusinessUnits.length === 0 ? (
                        <EmptyTable colSpan={5} />
                      ) : null}
                    </Table.Body>
                  </Table.Container>
                </Table>
              </div>
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </div>

      {actionError && (
        <p className="mt-4 text-sm text-red-600">{actionError}</p>
      )}
    </div>
  );
}
