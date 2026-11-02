import { NextRequest, NextResponse } from 'next/server';
import { runProductSearch } from '@/lib/ct/search-page';
import { apiError, localeFromRequest } from '../../_utils';

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('categoryId')?.trim();
  if (!categoryId) return NextResponse.json({ products: [] });

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 15, 50);

  try {
    const result = await runProductSearch({
      locale: localeFromRequest(req),
      categoryId,
      facetDefinitions: [],
      page: 1,
      pageSize: limit,
    });
    return NextResponse.json({ products: result.products });
  } catch (error) {
    return apiError(error);
  }
}
