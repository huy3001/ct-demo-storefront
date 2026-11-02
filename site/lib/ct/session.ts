import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import {
  decodeSession,
  encodeSession,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  type SessionPayload,
} from './session-cookie';
import { getApiRoot } from './client';

/**
 * Reads the current session (read-only). Returns null if no session cookie is present or
 * it fails to decrypt. Use `ensureSession` in Route Handlers/Server Actions when you need to
 * guarantee a session exists (creating one and persisting the cookie).
 */
export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

/**
 * Ensures a session cookie exists, generating a fresh anonymousId if needed, and persists
 * it. Must be called from a Route Handler or Server Action — Next.js disallows setting
 * cookies during RSC render. There is no external token to acquire/refresh here: the shared
 * admin-scoped ApiRoot (see lib/ct/client.ts) is used for every request, and this
 * anonymousId is only used to tag/find the shopper's own cart and (post-login) customer.
 */
export async function ensureSession(): Promise<SessionPayload> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  let session = raw ? await decodeSession(raw) : null;

  if (!session) {
    session = { anonymousId: randomUUID() };
  }

  await persistSession(session);
  return session;
}

export async function persistSession(session: SessionPayload): Promise<void> {
  const jar = await cookies();
  const encoded = await encodeSession(session);
  jar.set(SESSION_COOKIE_NAME, encoded, SESSION_COOKIE_OPTIONS);
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
}

/** Convenience: ensures a session and returns the shared ApiRoot alongside it. */
export async function getSessionApiRoot() {
  const session = await ensureSession();
  return { apiRoot: getApiRoot(), session };
}
