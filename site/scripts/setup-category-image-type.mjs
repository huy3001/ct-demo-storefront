import { ClientBuilder } from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

const TYPE_KEY = 'category-image';
const FIELD_NAME = 'imageUrl';

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
  .withUserAgentMiddleware({ libraryName: 'huy-demo-storefront-type-setup' })
  .build();

const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
const imageField = {
  name: FIELD_NAME,
  label: { 'en-US': 'Category image URL' },
  required: false,
  type: { name: 'String' },
  inputHint: 'SingleLine',
};

async function getType() {
  const response = await apiRoot
    .types()
    .get({ queryArgs: { where: `key="${TYPE_KEY}"`, limit: 1 } })
    .execute();
  return response.body.results[0];
}

async function setupCategoryImageType() {
  const existingType = await getType();

  if (!existingType) {
    await apiRoot.types().post({
      body: {
        key: TYPE_KEY,
        name: { 'en-US': 'Category image' },
        description: { 'en-US': 'Image metadata for storefront categories.' },
        resourceTypeIds: ['category'],
        fieldDefinitions: [imageField],
      },
    }).execute();
    console.log(`Created custom type "${TYPE_KEY}" with field "${FIELD_NAME}".`);
    return;
  }

  if (!existingType.resourceTypeIds.includes('category')) {
    throw new Error(`Custom type "${TYPE_KEY}" exists but is not assigned to categories.`);
  }

  const existingField = existingType.fieldDefinitions.find((field) => field.name === FIELD_NAME);
  if (existingField) {
    if (existingField.type.name !== 'String') {
      throw new Error(`Field "${FIELD_NAME}" already exists with type "${existingField.type.name}", expected "String".`);
    }
    console.log(`Custom type "${TYPE_KEY}" and field "${FIELD_NAME}" already exist.`);
    return;
  }

  await apiRoot.types().withId({ ID: existingType.id }).post({
    body: {
      version: existingType.version,
      actions: [{ action: 'addFieldDefinition', fieldDefinition: imageField }],
    },
  }).execute();
  console.log(`Added field "${FIELD_NAME}" to custom type "${TYPE_KEY}".`);
}

setupCategoryImageType().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to set up the category image custom type: ${message}`);
  process.exitCode = 1;
});
