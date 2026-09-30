'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/atoms/button';
import Input from '@/components/ui/atoms/input';
import {
  ASSOCIATE_ROLES,
  type CompanyAssociate,
  type CompanyBusinessUnit,
  type CompanyManagement,
} from '@/lib/company';

type FormKind = 'company' | 'associate' | 'business-unit';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load company information');
  return response.json() as Promise<CompanyManagement>;
};

export default function CompanyForm({
  kind,
  id,
}: {
  kind: FormKind;
  id?: string;
}) {
  const { data, error } = useSWR('/api/account/company', fetcher, {
    revalidateOnFocus: false,
  });

  if (error) return <p className="text-sm text-red-600">{error.message}</p>;
  if (!data) return <p className="text-sm text-charcoal-light">Loading company information...</p>;

  const associate = data.associates.find((item) => item.id === id);
  const businessUnit = data.businessUnits.find((item) => item.id === id);
  if (id && ((kind === 'associate' && !associate) || (kind === 'business-unit' && !businessUnit))) {
    return <p className="text-sm text-charcoal-light">The requested record could not be found.</p>;
  }

  return (
    <CompanyFormFields
      key={`${kind}-${id ?? 'new'}-${data.company.id}`}
      kind={kind}
      id={id}
      company={data.company}
      associate={associate}
      businessUnit={businessUnit}
    />
  );
}

function CompanyFormFields({
  kind,
  id,
  company,
  associate,
  businessUnit,
}: {
  kind: FormKind;
  id?: string;
  company: CompanyBusinessUnit;
  associate?: CompanyAssociate;
  businessUnit?: CompanyBusinessUnit;
}) {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const isAssociate = kind === 'associate';
  const isNew = !id;
  const record = kind === 'company' ? company : isAssociate ? associate : businessUnit;
  const [name, setName] = useState(record?.name ?? '');
  const [email, setEmail] = useState(!isAssociate ? record?.email ?? '' : '');
  const [roles, setRoles] = useState<string[]>(associate?.roles ?? []);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState('');
  const title = `${isNew ? 'Add new' : 'Edit'} ${kind === 'company' ? 'company' : kind.replace('-', ' ')}`;

  function onRolesChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setRoles(Array.from(event.target.selectedOptions, (option) => option.value));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setStatus('saving');
    try {
      const response = await fetch('/api/account/company', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: kind,
          ...(id ? { id } : {}),
          name,
          ...(isAssociate ? { roles } : { email }),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'Unable to save changes');
      }
      router.push(`/${locale}/account/company`);
      router.refresh();
    } catch (reason) {
      setStatus('error');
      setError(reason instanceof Error ? reason.message : 'Unable to save changes');
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{title}</h1>
      <form onSubmit={onSubmit} className="max-w-lg space-y-5 rounded-sm border border-border p-5">
        <Input
          label="Name"
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {isAssociate ? (
          <div>
            <label htmlFor="roles" className="mb-2 block text-sm font-medium">Role</label>
            <select
              id="roles"
              multiple
              required
              value={roles}
              onChange={onRolesChange}
              className="min-h-32 w-full rounded-sm border border-border bg-white px-3 py-2 text-sm"
            >
              {ASSOCIATE_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <p className="mt-1 text-xs text-charcoal-light">Hold Command or Control to select multiple roles.</p>
          </div>
        ) : (
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
        <div className="flex gap-3">
          <Link href="/account/company" locale={locale}>
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" loading={status === 'saving'}>Save</Button>
        </div>
        {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
