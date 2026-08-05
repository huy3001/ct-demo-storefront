import { ClientBuilder } from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const client = new ClientBuilder()
  .withProjectKey(env.CTP_PROJECT_KEY)
  .withClientCredentialsFlow({
    host: env.CTP_AUTH_URL,
    projectKey: env.CTP_PROJECT_KEY,
    credentials: { clientId: env.CTP_CLIENT_ID, clientSecret: env.CTP_CLIENT_SECRET },
    scopes: env.CTP_SCOPES.split(' ').map((s) => `${s}:${env.CTP_PROJECT_KEY}`),
  })
  .withHttpMiddleware({ host: env.CTP_API_URL, includeResponseHeaders: false })
  .withUserAgentMiddleware({ libraryName: 'test' })
  .build();

const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({ projectKey: env.CTP_PROJECT_KEY });

try {
  const res = await apiRoot.productProjections().get({ queryArgs: { limit: 2 } }).execute();
  console.log('OK', res.body.results.length, res.body.results.map(r=>r.name));
} catch (err) {
  console.error('ERR', err);
}
