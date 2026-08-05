import { NextResponse } from 'next/server';
import { getSessionApiRoot } from '@/lib/ct/session';
import { getCustomerOrders } from '@/lib/ct/customer';
import { apiError } from '../../_utils';

export async function GET() {
  try {
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    const orders = await getCustomerOrders(apiRoot, session.customerId);
    return NextResponse.json(orders);
  } catch (err) {
    return apiError(err);
  }
}
