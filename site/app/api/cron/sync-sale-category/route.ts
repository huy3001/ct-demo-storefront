import { NextRequest, NextResponse } from 'next/server';
import { syncSaleCategory } from '@/lib/ct/sale-category';
import { apiError } from '@/app/api/_utils';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json(await syncSaleCategory());
  } catch (error) {
    return apiError(error);
  }
}
