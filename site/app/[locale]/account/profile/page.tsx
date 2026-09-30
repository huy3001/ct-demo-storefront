'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { useTranslations } from 'use-intl';
import { useAccount } from '@/hooks/useAccount';
import {
  customerDefaultAddresses,
  customerPhone,
  formatAddress,
} from '@/lib/customer-profile';
import Button from '@/components/ui/atoms/button';
import Accordion from '@/components/ui/atoms/accordion';
import Card from '@/components/ui/molecules/card';
import Input from '@/components/ui/atoms/input';
import Modal from '@/components/ui/organisms/modal';
import PasswordInput from '@/components/ui/atoms/input-password';
import type { AccountCustomer } from '@/lib/ct/customer';

type ProfileAccordionItemProps = {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function ProfileAccordionItem({
  id,
  title,
  open,
  onToggle,
  children,
}: ProfileAccordionItemProps) {
  return (
    <Accordion
      key={`${id}-${open}`}
      defaultOpen={open}
      closedSectionTitle={title}
      openSectionTitle={title}
      buttonWrapperClassName="py-6"
      buttonClassName="text-left text-lg font-semibold"
      iconClassName="size-6"
      panelClassName="pb-6"
      onToggle={onToggle}
    >
      {children}
    </Accordion>
  );
}

export default function AccountProfilePage() {
  const { customer } = useAccount();
  const translate = useTranslations();

  const profileSummary = useMemo(() => {
    if (!customer) return null;
    const { shipping, billing } = customerDefaultAddresses(customer);

    return (
      <p className="flex flex-col">
        {customer.b2b?.company && (
          <span>{`${translate('account.company')}: ${customer.b2b.company}`}</span>
        )}
        <span>{`${translate('common.email')}: ${customer.email}`}</span>
        {shipping && (
          <span>{`${translate('checkout.shippingAddress')}: ${formatAddress(shipping)}`}</span>
        )}
        {billing && (
          <span>{`${translate('checkout.billingAddress')}: ${formatAddress(billing)}`}</span>
        )}
        {customer.b2b?.roles?.length ? (
          <span>{`${translate('account.role')}: ${customer.b2b.roles.join(', ')}`}</span>
        ) : null}
      </p>
    );
  }, [translate, customer]);

  if (!customer)
    return (
      <p className="text-sm text-charcoal-light">
        {translate('common.loading')}
      </p>
    );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-6 text-xl font-semibold">
          {translate('account.profile')}
        </h1>

        <Card
          title={`${customer.firstName} ${customer.lastName}`}
          summary={profileSummary}
          className="hover:border-border!"
        />
      </div>

      <ProfileForm
        key={`${customer.id}-${customer.version}`}
        customer={customer}
      />
    </div>
  );
}

function ProfileForm({ customer }: { customer: AccountCustomer }) {
  const translate = useTranslations();
  const { mutate } = useSWRConfig();
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    email: customer.email,
    phone: customerPhone(customer),
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  );
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [passwordError, setPasswordError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<
    'idle' | 'confirming' | 'deleting' | 'deleted' | 'error'
  >('idle');
  const [deleteError, setDeleteError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const updatedCustomer = await res.json();
      await mutate('/api/account', updatedCustomer, { revalidate: false });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordStatus('error');
      setPasswordError(translate('error.password-noMatch'));
      return;
    }

    setPasswordStatus('saving');
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.message ?? translate('error.password-unable-change'),
        );
      }
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStatus('saved');
    } catch (error) {
      setPasswordStatus('error');
      setPasswordError(
        error instanceof Error
          ? error.message
          : translate('error.password-unable-change'),
      );
    }
  }

  function onDeleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError('');
    setDeleteStatus('confirming');
  }

  async function deleteAccount() {
    setDeleteStatus('deleting');
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? translate('account.delete-failed'));
      }

      await mutate('/api/account', null, { revalidate: false });
      setDeleteStatus('deleted');
      window.setTimeout(() => router.replace(`/${locale}`), 750);
    } catch (error) {
      setDeletePassword('');
      setDeleteStatus('error');
      setDeleteError(
        error instanceof Error
          ? error.message
          : translate('account.delete-failed'),
      );
    }
  }

  return (
    <div className="border-t border-border divide-y divide-border">
      <ProfileAccordionItem
        id="update-profile"
        title={translate('account.update-profile')}
        open={openSection === 'update-profile'}
        onToggle={() =>
          setOpenSection((section) =>
            section === 'update-profile' ? null : 'update-profile',
          )
        }
      >
        <form
          onSubmit={onSubmit}
          className="space-y-6"
        >
          <div className="flex gap-3">
            <div className="form-field w-1/2">
              <Input
                label={translate('common.firstName')}
                id="firstName"
                required
                placeholder={translate('common.firstName')}
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
            </div>
            <div className="form-field w-1/2">
              <Input
                label={translate('common.lastName')}
                id="lastName"
                required
                placeholder={translate('common.lastName')}
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="form-field w-1/2">
              <Input
                label={translate('common.email')}
                id="email"
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="form-field w-1/2">
              <Input
                label={translate('common.phone')}
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder={translate('common.phone')}
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={status === 'saving'}
          >
            {status === 'saving'
              ? translate('account.saving')
              : translate('account.save-changes')}
          </Button>
          {status === 'saved' && (
            <p className="text-sm text-sage">{translate('account.saved')}</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-600">
              {translate('error.wentWrong')}
            </p>
          )}
        </form>
      </ProfileAccordionItem>

      <ProfileAccordionItem
        id="change-password"
        title={translate('account.password-change')}
        open={openSection === 'change-password'}
        onToggle={() =>
          setOpenSection((section) =>
            section === 'change-password' ? null : 'change-password',
          )
        }
      >
        <form
          onSubmit={onPasswordSubmit}
          className="space-y-6"
        >
          <div className="form-field w-full">
            <PasswordInput
              label={translate('account.password-current')}
              id="currentPassword"
              required
              autoComplete="current-password"
              placeholder={translate('account.password-current')}
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords((value) => ({
                  ...value,
                  currentPassword: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex gap-3">
            <div className="form-field w-1/2">
              <PasswordInput
                label={translate('account.password-new')}
                id="newPassword"
                required
                autoComplete="new-password"
                placeholder={translate('account.password-new')}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords((value) => ({
                    ...value,
                    newPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-field w-1/2">
              <PasswordInput
                label={translate('account.password-confirm')}
                id="confirmPassword"
                required
                autoComplete="new-password"
                placeholder={translate('account.password-confirm')}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((value) => ({
                    ...value,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={passwordStatus === 'saving'}
          >
            {passwordStatus === 'saving'
              ? translate('account.changing')
              : translate('account.change-password')}
          </Button>
          {passwordStatus === 'saved' && (
            <p className="text-sm text-sage">
              {translate('account.password-changed')}
            </p>
          )}
          {passwordStatus === 'error' && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
        </form>
      </ProfileAccordionItem>

      <ProfileAccordionItem
        id="delete-account"
        title={translate('account.delete-your-account')}
        open={openSection === 'delete-account'}
        onToggle={() =>
          setOpenSection((section) =>
            section === 'delete-account' ? null : 'delete-account',
          )
        }
      >
        <form
          onSubmit={onDeleteSubmit}
          className="space-y-6"
        >
          <p className="text-sm text-charcoal-light">
            {translate('account.delete-disclosure')}
          </p>
          <div className="form-field w-full">
            <PasswordInput
              label={translate('account.password-confirm')}
              id="deletePassword"
              required
              autoComplete="current-password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={!deletePassword || deleteStatus === 'deleting'}
          >
            {translate('account.delete-account')}
          </Button>
          {deleteStatus === 'deleted' && (
            <p className="text-sm text-sage">
              {translate('account.delete-success')}
            </p>
          )}
          {deleteStatus === 'error' && (
            <p className="text-sm text-red-600">{deleteError}</p>
          )}
        </form>
      </ProfileAccordionItem>

      <Modal
        isOpen={deleteStatus === 'confirming'}
        onRequestClose={() => setDeleteStatus('idle')}
        shouldCloseOnOverlayClick={deleteStatus !== 'deleting'}
        closeButton={deleteStatus !== 'deleting'}
        contentLabel={translate('account.delete-your-account')}
        style={{ content: { width: 'fit', maxWidth: 'min(90%, 480px)' } }}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-700">
            {translate('account.delete-your-account')}
          </h2>
          <p className="mt-3 text-sm text-gray-700">
            {translate('account.action-warning')}
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteStatus('idle')}
              disabled={deleteStatus === 'deleting'}
            >
              {translate('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={deleteAccount}
              disabled={deleteStatus === 'deleting'}
            >
              {deleteStatus === 'deleting'
                ? translate('account.deleting')
                : translate('account.delete-account')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
