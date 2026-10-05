import { NextRequest, NextResponse } from 'next/server';
import { apiError, localeFromRequest } from '@/app/api/_utils';
import { getCustomerQuotes } from '@/lib/ct/quotes';
import { getSessionApiRoot } from '@/lib/ct/session';

export async function GET(req: NextRequest) {
  try {
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId && !session.email) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    const quotes = await getCustomerQuotes(apiRoot, session, localeFromRequest(req));
    return NextResponse.json(quotes);
  } catch (error) {
    return apiError(error);
  }
}
