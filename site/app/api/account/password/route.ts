import { NextRequest, NextResponse } from 'next/server';
import { changeCustomerPassword, getCustomerById } from '@/lib/ct/customer';
import { getSessionApiRoot } from '@/lib/ct/session';
import { apiError } from '../../_utils';

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = (await req.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Current and new passwords are required' }, { status: 400 });
    }

    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }

    const customer = await getCustomerById(apiRoot, session.customerId);
    const updated = await changeCustomerPassword(apiRoot, customer, currentPassword, newPassword);
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}
