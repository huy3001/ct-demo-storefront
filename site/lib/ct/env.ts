function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const ctEnv = {
  projectKey: () => required('CTP_PROJECT_KEY'),
  clientId: () => required('CTP_CLIENT_ID'),
  clientSecret: () => required('CTP_CLIENT_SECRET'),
  authUrl: () => required('CTP_AUTH_URL').replace(/\/$/, ''),
  apiUrl: () => required('CTP_API_URL').replace(/\/$/, ''),
  scopes: () =>
    (
      process.env.CTP_SCOPES ??
      'view_products view_categories view_project view_business_units view_quote_requests view_quotes view_approval_rules manage_approval_rules view_approval_flows manage_approval_flows manage_orders manage_customers manage_types manage_shopping_lists manage_sessions'
    )
      .split(' ')
      .filter(Boolean),
  checkoutAppKey: () => process.env.CTP_CHECKOUT_APP_KEY ?? 'storefront-checkout',
  sessionSecret: () => required('SESSION_SECRET'),
};

/**
 * Derives the commercetools region host segment from the API URL, e.g.
 * https://api.us-east-2.aws.commercetools.com -> us-east-2.aws
 */
export function ctRegion(): string {
  return ctEnv
    .apiUrl()
    .replace(/^https?:\/\/api\./, '')
    .replace(/\.commercetools\.com\/?$/, '');
}
