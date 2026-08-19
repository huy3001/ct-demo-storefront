import { NextRequest, NextResponse } from 'next/server';
import { getSearchSuggestions } from '@/lib/ct/search-suggestions';
import { apiError, localeFromRequest } from '../../_utils';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (query.length < 3) return NextResponse.json({ categories: [], brands: [], products: [] });

  try {
    const suggestions = await getSearchSuggestions(query.slice(0, 100), localeFromRequest(req));
    return NextResponse.json(suggestions);
  } catch (error) {
    return apiError(error);
  }
}
