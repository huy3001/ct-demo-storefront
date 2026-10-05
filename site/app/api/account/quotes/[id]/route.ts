import { NextRequest, NextResponse } from 'next/server';
import { apiError, localeFromRequest } from '@/app/api/_utils';
import { getCustomerQuote } from '@/lib/ct/quotes';
import { getSessionApiRoot } from '@/lib/ct/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId && !session.email) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    const quote = await getCustomerQuote(
      apiRoot,
      session,
      id,
      localeFromRequest(req),
    );
    if (!quote) return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    return NextResponse.json(quote);
  } catch (error) {
    return apiError(error);
  }
}
