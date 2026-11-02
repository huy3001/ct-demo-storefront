import { ctEnv } from './env';

export interface TokenResult {
  accessToken: string;
  expiresAt: number; // epoch ms
}

function basicAuthHeader(): string {
  const raw = `${ctEnv.clientId()}:${ctEnv.clientSecret()}`;
  return `Basic ${Buffer.from(raw).toString('base64')}`;
}

/**
 * Project-wide client-credentials token. Used only for the commercetools Sessions API
 * (lib/ct/checkout.ts), which lives on a separate host and isn't reachable through the
 * ts-client-managed ApiRoot in lib/ct/client.ts.
 */
export async function fetchClientCredentialsToken(): Promise<TokenResult> {
  const projectKey = ctEnv.projectKey();
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: ctEnv
      .scopes()
      .map((s) => `${s}:${projectKey}`)
      .join(' '),
  });

  const res = await fetch(`${ctEnv.authUrl()}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`commercetools auth request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  return { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
}
