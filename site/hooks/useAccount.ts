'use client';

import useSWR from 'swr';
import type { Customer } from '@commercetools/platform-sdk';
import type { AccountCustomer } from '@/lib/ct/customer';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to load account');
  return res.json();
};

export function useAccount() {
  const { data, error, isLoading, mutate } = useSWR<AccountCustomer | null>('/api/account', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? 'Login failed');
    }
    const { customer } = await res.json();
    await mutate(customer, { revalidate: false });
    return customer as Customer;
  }

  async function register(input: { email: string; password: string; firstName?: string; lastName?: string }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? 'Registration failed');
    }
    const { customer } = await res.json();
    await mutate(customer, { revalidate: false });
    return customer as Customer;
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    await mutate(null, { revalidate: false });
  }

  return {
    customer: data ?? null,
    isSignedIn: Boolean(data),
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
