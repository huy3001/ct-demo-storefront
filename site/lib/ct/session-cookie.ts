import { EncryptJWT, jwtDecrypt } from 'jose';
import { ctEnv } from './env';

export interface SessionPayload {
  anonymousId: string;
  customerId?: string;
  cartId?: string;
}

const COOKIE_NAME = 'ct_session';
const ALG = 'dir';
const ENC = 'A256GCM';

function encryptionKey(): Uint8Array {
  const secret = ctEnv.sessionSecret();
  // SESSION_SECRET is a 64-char hex string (32 bytes) used directly as the A256GCM key.
  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    return Uint8Array.from(Buffer.from(secret, 'hex'));
  }
  // Fallback: derive 32 bytes from an arbitrary secret so dev setups still work.
  const bytes = new TextEncoder().encode(secret);
  const key = new Uint8Array(32);
  for (let i = 0; i < bytes.length; i++) key[i % 32] ^= bytes[i];
  return key;
}

export async function encodeSession(payload: SessionPayload): Promise<string> {
  return new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: ALG, enc: ENC })
    .setIssuedAt()
    .setExpirationTime('30d')
    .encrypt(encryptionKey());
}

export async function decodeSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtDecrypt(token, encryptionKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};
