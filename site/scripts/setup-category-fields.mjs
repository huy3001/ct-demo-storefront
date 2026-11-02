import { ClientBuilder } from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

const TYPE_KEY = 'category-storefront-fields';
const LEGACY_TYPE_KEY = 'category-image';

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
const fieldDefinitions = [
  {
    name: 'imageUrl',
    label: { 'en-US': 'Category image URL' },
    required: false,
    type: { name: 'String' },
    inputHint: 'SingleLine',
  },
  {
    name: 'showInNavigation',
    label: { 'en-US': 'Show in navigation' },
    required: false,
    type: { name: 'Boolean' },
  },
];

async function getTypeByKey(key) {
  const response = await apiRoot
    .types()
    .get({ queryArgs: { where: `key="${key}"`, limit: 1 } })
    .execute();
  return response.body.results[0];
}

async function setupCategoryFields() {
  const [currentType, legacyType] = await Promise.all([
    getTypeByKey(TYPE_KEY),
    getTypeByKey(LEGACY_TYPE_KEY),
  ]);

  if (currentType && legacyType && currentType.id !== legacyType.id) {
    throw new Error(
      `Both "${TYPE_KEY}" and legacy "${LEGACY_TYPE_KEY}" custom types exist. Resolve the duplicate types before running this setup.`,
    );
  }

  const existingType = currentType ?? legacyType;

  if (!existingType) {
    await apiRoot.types().post({
      body: {
        key: TYPE_KEY,
        name: { 'en-US': 'Category storefront fields' },
        description: { 'en-US': 'Storefront display settings for categories.' },
        resourceTypeIds: ['category'],
        fieldDefinitions,
      },
    }).execute();
    console.log(`Created custom type "${TYPE_KEY}" with storefront category fields.`);
    return;
  }

  if (!existingType.resourceTypeIds.includes('category')) {
    throw new Error(`Custom type "${TYPE_KEY}" exists but is not assigned to categories.`);
  }

  const fieldsToAdd = fieldDefinitions.filter((fieldDefinition) => {
    const existingField = existingType.fieldDefinitions.find(
      (field) => field.name === fieldDefinition.name,
    );
    if (!existingField) return true;
    if (existingField.type.name !== fieldDefinition.type.name) {
      throw new Error(
        `Field "${fieldDefinition.name}" already exists with type "${existingField.type.name}", expected "${fieldDefinition.type.name}".`,
      );
    }
    return false;
  });

  const isLegacyType = existingType.key === LEGACY_TYPE_KEY;
  const actions = [
    ...(isLegacyType ? [{ action: 'changeKey', key: TYPE_KEY }] : []),
    ...fieldsToAdd.map((fieldDefinition) => ({
      action: 'addFieldDefinition',
      fieldDefinition,
    })),
  ];

  if (actions.length === 0) {
    console.log(`Custom type "${TYPE_KEY}" and storefront category fields already exist.`);
    return;
  }

  await apiRoot.types().withId({ ID: existingType.id }).post({
    body: {
      version: existingType.version,
      actions,
    },
  }).execute();
  if (isLegacyType) {
    console.log(
      `Renamed custom type key from "${LEGACY_TYPE_KEY}" to "${TYPE_KEY}" without changing its ID.`,
    );
  }
  if (fieldsToAdd.length > 0) {
    console.log(
      `Added ${fieldsToAdd.map((field) => `"${field.name}"`).join(', ')} to custom type "${TYPE_KEY}".`,
    );
  }
}

setupCategoryFields().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to set up the category storefront fields: ${message}`);
  process.exitCode = 1;
});
