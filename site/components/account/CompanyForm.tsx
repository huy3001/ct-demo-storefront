'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'use-intl';
import useSWR from 'swr';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/atoms/button';
import Input from '@/components/ui/atoms/input';
import Label from '@/components/ui/atoms/label';
import MultiDropdown from '@/components/ui/atoms/multi-dropdown';
import Skeleton from '@/components/ui/atoms/skeleton';
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
  const translate = useTranslations();
  const { data, error } = useSWR('/api/account/company', fetcher, {
    revalidateOnFocus: false,
  });

  if (error) return <p className="text-sm text-red-600">{error.message}</p>;
  if (!data) return <Skeleton className="h-5 w-full" />;

  const associate = data.associates.find((item) => item.id === id);
  const businessUnit = data.businessUnits.find((item) => item.id === id);

  if (
    id &&
    ((kind === 'associate' && !associate) ||
      (kind === 'business-unit' && !businessUnit))
  ) {
    return (
      <p className="text-sm text-charcoal-light">
        {translate('account.record-not-found')}
      </p>
    );
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
  const translate = useTranslations();
  const isAssociate = kind === 'associate';
  const isNew = !id;
  const record = kind === 'company' ? company : isAssociate ? associate : businessUnit;
  const [name, setName] = useState(record?.name ?? '');
  const [email, setEmail] = useState(record?.email ?? '');
  const [roles, setRoles] = useState<string[]>(associate?.roles ?? []);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState('');
  const title = `${isNew ? 'Add new' : 'Edit'} ${kind === 'company' ? 'company' : kind.replace('-', ' ')}`;

  const roleButtonLabel =
    roles.length === 0
      ? translate('account.role')
      : roles.length === 1
        ? roles[0]
        : translate('account.role-selected', { count: roles.length });

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
          email,
          ...(isAssociate ? { roles } : {}),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body.message ?? translate('account.unable-to-save-changes'),
        );
      }
      router.push(`/${locale}/account/company`);
      router.refresh();
    } catch (reason) {
      setStatus('error');
      setError(
        reason instanceof Error
          ? reason.message
          : translate('account.unable-to-save-changes'),
      );
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{title}</h1>
      <form
        onSubmit={onSubmit}
        className="max-w-lg space-y-6"
      >
        <Input
          label={translate('common.name')}
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <Input
          label={translate('common.email')}
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {isAssociate && (
          <div>
            <Label
              htmlFor="roles"
              required
            >
              {translate('account.role')}
            </Label>
            <MultiDropdown
              value={roles}
              onChange={setRoles}
              className="w-full"
            >
              <MultiDropdown.Button className="w-full">
                {roleButtonLabel}
              </MultiDropdown.Button>
              <MultiDropdown.Options>
                {ASSOCIATE_ROLES.map((role) => (
                  <MultiDropdown.Option
                    key={role}
                    value={role}
                  >
                    {role}
                  </MultiDropdown.Option>
                ))}
              </MultiDropdown.Options>
            </MultiDropdown>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/account/company"
            locale={locale}
          >
            <Button
              type="button"
              variant="secondary"
            >
              {translate('common.cancel')}
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={status === 'saving'}
          >
            {status === 'saving'
              ? translate('account.saving')
              : translate('common.save')}
          </Button>
        </div>

        {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
