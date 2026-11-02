import { NextRequest, NextResponse } from 'next/server';
import { clearSession, getSessionApiRoot } from '@/lib/ct/session';
import {
  deleteCustomer,
  getCustomerB2BDetails,
  getCustomerById,
  updateCustomerProfile,
  verifyCustomerPassword,
} from '@/lib/ct/customer';
import { apiError } from '../_utils';

export async function GET() {
  try {
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    const customer = await getCustomerById(apiRoot, session.customerId);
    const b2b = await getCustomerB2BDetails(apiRoot, customer.id);
    return NextResponse.json({ ...customer, ...(b2b ? { b2b } : {}) });
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { password } = (await req.json()) as { password?: string };
    if (!password) {
      return NextResponse.json(
        { message: 'Password confirmation is required' },
        { status: 400 },
      );
    }

    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }

    const customer = await getCustomerById(apiRoot, session.customerId);
    await verifyCustomerPassword(apiRoot, customer, password);
    await deleteCustomer(apiRoot, customer);
    await clearSession();

    return NextResponse.json({ deleted: true });
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
