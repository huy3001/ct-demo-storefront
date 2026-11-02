import { ClientBuilder } from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient, type ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import { ctEnv } from './env';

let apiRoot: ByProjectKeyRequestBuilder | undefined;

/**
 * Shared client-credentials ApiRoot used for every server-side commercetools call
 * (catalog reads, cart/customer/order mutations). The API Client configured for this
 * project only has admin-level scopes (manage_orders, manage_customers, ...) — it does
 * NOT have any `manage_my_*` scopes, so `.me()` endpoints are unavailable. Instead, cart
 * and customer operations use the plain (non-`me`) endpoints with an explicit
 * `anonymousId`/`customerId` on the resource, with that id tracked in our own session
 * cookie (see lib/ct/session.ts). This is safe because everything runs server-side.
 */
export function getApiRoot(): ByProjectKeyRequestBuilder {
  if (apiRoot) return apiRoot;

  const client = new ClientBuilder()
    .withProjectKey(ctEnv.projectKey())
    .withClientCredentialsFlow({
      host: ctEnv.authUrl(),
      projectKey: ctEnv.projectKey(),
      credentials: {
        clientId: ctEnv.clientId(),
        clientSecret: ctEnv.clientSecret(),
      },
      scopes: ctEnv.scopes().map((s) => `${s}:${ctEnv.projectKey()}`),
    })
    .withHttpMiddleware({ host: ctEnv.apiUrl(), includeResponseHeaders: false })
    .withUserAgentMiddleware({ libraryName: 'huy-demo-storefront' })
    .build();

  apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({
    projectKey: ctEnv.projectKey(),
  });
  return apiRoot;
}

/** Alias kept for catalog-only call sites (products/categories/search) — same shared client. */
export const getCatalogApiRoot = getApiRoot;
