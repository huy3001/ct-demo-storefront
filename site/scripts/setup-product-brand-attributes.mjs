import { ClientBuilder } from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const projectKey = required('CTP_PROJECT_KEY');
const scopes = required('CTP_SCOPES')
  .split(' ')
  .filter(Boolean)
  .map((scope) => `${scope}:${projectKey}`);

const client = new ClientBuilder()
  .withProjectKey(projectKey)
  .withClientCredentialsFlow({
    host: required('CTP_AUTH_URL').replace(/\/$/, ''),
    projectKey,
    credentials: {
      clientId: required('CTP_CLIENT_ID'),
      clientSecret: required('CTP_CLIENT_SECRET'),
    },
    scopes,
  })
  .withHttpMiddleware({ host: required('CTP_API_URL').replace(/\/$/, '') })
  .withUserAgentMiddleware({ libraryName: 'huy-demo-storefront-brand-setup' })
  .build();

const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
const attributes = [
  {
    name: 'productBrand',
    label: { 'en-US': 'Product Brand' },
    type: { name: 'text' },
    inputHint: 'SingleLine',
    isRequired: false,
    attributeConstraint: 'SameForAll',
    isSearchable: true,
  },
  {
    name: 'brandLogo',
    label: { 'en-US': 'Brand Logo' },
    inputTip: {
      'en-US': 'Upload the logo to an asset host, then enter its public image URL.',
    },
    type: { name: 'text' },
    inputHint: 'SingleLine',
    isRequired: false,
    attributeConstraint: 'SameForAll',
    isSearchable: false,
  },
];

async function setupProductBrandAttributes() {
  const response = await apiRoot.productTypes().get({ queryArgs: { limit: 500 } }).execute();

  for (const productType of response.body.results) {
    const actions = attributes
      .filter((attribute) => !productType.attributes?.some(({ name }) => name === attribute.name))
      .map((attribute) => ({ action: 'addAttributeDefinition', attribute }));

    if (actions.length === 0) {
      console.log(`Product type "${productType.name}" already has the brand attributes.`);
      continue;
    }

    await apiRoot.productTypes().withId({ ID: productType.id }).post({
      body: { version: productType.version, actions },
    }).execute();
    console.log(`Added brand attributes to product type "${productType.name}".`);
  }
}

setupProductBrandAttributes().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to set up product brand attributes: ${message}`);
  process.exitCode = 1;
});
