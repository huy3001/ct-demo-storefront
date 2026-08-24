import { NextRequest, NextResponse } from 'next/server';
import { getSessionApiRoot } from '@/lib/ct/session';
import { getCustomerById, updateCustomerProfile } from '@/lib/ct/customer';
import { apiError } from '../_utils';

export async function GET() {
  try {
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    const customer = await getCustomerById(apiRoot, session.customerId);
    return NextResponse.json(customer);
  } catch (err) {
    return apiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const fields = (await req.json()) as { firstName?: string; lastName?: string; email?: string; phone?: string };
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    const customer = await getCustomerById(apiRoot, session.customerId);
    const updated = await updateCustomerProfile(apiRoot, customer, fields);
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}
