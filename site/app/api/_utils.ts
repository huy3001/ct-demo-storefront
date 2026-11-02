import { NextRequest, NextResponse } from 'next/server';

/** Shared error → JSON response helper for commercetools SDK / fetch errors thrown in route handlers. */
export function apiError(err: unknown) {
  const statusCode = (err as { statusCode?: number })?.statusCode ?? 500;
  const message =
    (err as { body?: { message?: string } })?.body?.message ??
    (err instanceof Error ? err.message : 'Unexpected error');
  return NextResponse.json({ message }, { status: statusCode });
}

export function localeFromRequest(req: NextRequest): string {
  return req.nextUrl.searchParams.get('locale') ?? req.headers.get('x-locale') ?? 'en-US';
}
