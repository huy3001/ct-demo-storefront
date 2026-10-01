'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
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

const tabs: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'associates', label: 'Associates' },
  { id: 'business-units', label: 'Business Units' },
];

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
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        aria-label="Search and filter"
        placeholder="Search and filter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-sm border border-border px-3 text-sm sm:max-w-sm"
      />
      <Link
        href={href}
        locale={locale}
        className="rounded-sm bg-charcoal px-4 py-2 text-center text-sm text-white hover:bg-charcoal-light"
      >
        {label}
      </Link>
    </div>
  );
}

function EmptyTable({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-charcoal-light">
        No records found.
      </td>
    </tr>
  );
}

export default function CompanyAdmin() {
  const { locale } = useParams<{ locale: string }>();
  const { data, error, mutate } = useSWR('/api/account/company', fetcher, {
    revalidateOnFocus: false,
  });
  const [tab, setTab] = useState<Tab>('general');
  const [businessUnitId, setBusinessUnitId] = useState('');
  const [query, setQuery] = useState('');
  const [actionError, setActionError] = useState('');

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
        throw new Error(body.message ?? 'Unable to remove associate');
      }
      await mutate();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to remove associate');
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
        throw new Error(body.message ?? 'Unable to remove address');
      }
      await mutate();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to remove address');
    }
  }

  if (error) {
    return <p className="text-sm text-red-600">{error.message}</p>;
  }

  if (!data) {
    return <p className="text-sm text-charcoal-light">Loading company information...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Company Admin</h1>

      <label className="mb-2 block text-sm font-medium" htmlFor="business-unit">
        Business unit
      </label>
      <select
        id="business-unit"
        value={selectedBusinessUnitId}
        onChange={(event) => setBusinessUnitId(event.target.value)}
        className="mb-8 h-10 w-full max-w-sm rounded-sm border border-border bg-white px-3 text-sm"
      >
        {data.businessUnits.map((businessUnit) => (
          <option key={businessUnit.id} value={businessUnit.id}>
            {businessUnit.name}
          </option>
        ))}
      </select>

      <div className="border-b border-border" role="tablist" aria-label="Company administration">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => {
              setTab(item.id);
              setQuery('');
              setActionError('');
            }}
            className={`mr-6 border-b-2 px-1 py-3 text-sm ${
              tab === item.id
                ? 'border-charcoal font-semibold text-charcoal'
                : 'border-transparent text-charcoal-light hover:text-charcoal'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {tab === 'general' && (
          <div className="overflow-x-auto rounded-sm border border-border">
            <table className="w-full min-w-135 text-left text-sm">
              <thead className="border-b border-border bg-neutral-100 text-xs uppercase text-charcoal-light">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3">{data.company.name}</td>
                  <td className="px-4 py-3">{data.company.email ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href="/account/company/edit" locale={locale} className="text-terra hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {tab === 'addresses' && (
          <>
            <SearchToolbar
              value={query}
              onChange={setQuery}
              href="/account/addresses/new"
              label="Add new address"
              locale={locale}
            />
            <div className="overflow-x-auto rounded-sm border border-border">
              <table className="w-full min-w-225 text-left text-sm">
                <thead className="border-b border-border bg-neutral-100 text-xs uppercase text-charcoal-light">
                  <tr>
                    {['Company name', 'Address', 'City', 'State', 'Postcode', 'Country', 'Actions'].map((heading) => (
                      <th key={heading} className="px-4 py-3 font-medium">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAddresses.map((address) => (
                    <tr key={address.id} className="border-t border-border">
                      <td className="px-4 py-3">{address.companyName}</td>
                      <td className="px-4 py-3">{address.address}</td>
                      <td className="px-4 py-3">{address.city}</td>
                      <td className="px-4 py-3">{address.state}</td>
                      <td className="px-4 py-3">{address.postcode}</td>
                      <td className="px-4 py-3">{address.country}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/account/addresses/${address.id}/edit`} locale={locale} className="text-terra hover:underline">
                            Edit
                          </Link>
                          <button type="button" onClick={() => removeAddress(address.id, address.businessUnitId)} className="text-charcoal-light hover:text-red-600">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAddresses.length === 0 ? <EmptyTable colSpan={7} /> : null}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'associates' && (
          <>
            <SearchToolbar
              value={query}
              onChange={setQuery}
              href="/account/associate/new"
              label="Add new associate"
              locale={locale}
            />
            <div className="overflow-x-auto rounded-sm border border-border">
              <table className="w-full min-w-180 text-left text-sm">
                <thead className="border-b border-border bg-neutral-100 text-xs uppercase text-charcoal-light">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssociates.map((associate) => (
                    <tr key={associate.id} className="border-t border-border">
                      <td className="px-4 py-3">{associate.name}</td>
                      <td className="px-4 py-3">{associate.email}</td>
                      <td className="px-4 py-3">{associate.roles.join(', ')}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/account/associate/${associate.id}/edit`} locale={locale} className="text-terra hover:underline">
                            Edit
                          </Link>
                          <button type="button" onClick={() => removeAssociate(associate.id)} className="text-charcoal-light hover:text-red-600">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAssociates.length === 0 ? <EmptyTable colSpan={4} /> : null}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'business-units' && (
          <>
            <SearchToolbar
              value={query}
              onChange={setQuery}
              href="/account/business-unit/new"
              label="Add new business unit"
              locale={locale}
            />
            <div className="overflow-x-auto rounded-sm border border-border">
              <table className="w-full min-w-190 text-left text-sm">
                <thead className="border-b border-border bg-neutral-100 text-xs uppercase text-charcoal-light">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Key</th>
                    <th className="px-4 py-3 font-medium">Parent unit</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBusinessUnits.map((businessUnit) => (
                    <tr key={businessUnit.id} className="border-t border-border">
                      <td className="px-4 py-3">{businessUnit.name}</td>
                      <td className="px-4 py-3">{businessUnit.key}</td>
                      <td className="px-4 py-3">{businessUnit.parentUnit ?? '—'}</td>
                      <td className="px-4 py-3">{businessUnit.email ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/account/business-unit/${businessUnit.id}/edit`} locale={locale} className="text-terra hover:underline">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredBusinessUnits.length === 0 ? <EmptyTable colSpan={5} /> : null}
                </tbody>
              </table>
            </div>
          </>
        )}

        {actionError && <p className="mt-4 text-sm text-red-600">{actionError}</p>}
      </div>
    </div>
  );
}
