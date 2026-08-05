import { ctEnv, ctRegion } from './env';
import { fetchClientCredentialsToken } from './auth';

export interface CheckoutSessionResult {
  sessionId: string;
  projectKey: string;
  region: string;
}

/**
 * Creates a commercetools Checkout Session for the given cart via the Sessions API.
 * Uses a project-wide client-credentials token scoped with `manage_sessions`.
 */
export async function createCheckoutSession(cartId: string): Promise<CheckoutSessionResult> {
  const projectKey = ctEnv.projectKey();
  const region = ctRegion();
  const { accessToken } = await fetchClientCredentialsToken();
  const authHeader = ['Bearer', accessToken].join(' ');

  const res = await fetch(`https://session.${region}.commercetools.com/${projectKey}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      cart: { cartRef: { id: cartId } },
      metadata: { applicationKey: ctEnv.checkoutAppKey() },
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to create Checkout session (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { id: string };
  return { sessionId: data.id, projectKey, region };
}
