import { NextRequest, NextResponse } from 'next/server';
import type { BaseAddress } from '@commercetools/platform-sdk';
import { getSessionApiRoot } from '@/lib/ct/session';
import { getCustomerById, addCustomerAddress, removeCustomerAddress } from '@/lib/ct/customer';
import { apiError } from '../../_utils';

export async function POST(req: NextRequest) {
  try {
    const address = (await req.json()) as BaseAddress;
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    const customer = await getCustomerById(apiRoot, session.customerId);
    const updated = await addCustomerAddress(apiRoot, customer, address);
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { addressId } = (await req.json()) as { addressId: string };
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    const customer = await getCustomerById(apiRoot, session.customerId);
    const updated = await removeCustomerAddress(apiRoot, customer, addressId);
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}
