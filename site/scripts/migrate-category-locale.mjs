import { ClientBuilder } from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

const SOURCE_LOCALE = 'en-US';
const TARGET_LOCALE = 'en-AU';
const PAGE_SIZE = 100;
const APPLY = process.argv.includes('--apply');
const OVERWRITE = process.argv.includes('--overwrite');

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
  .withUserAgentMiddleware({ libraryName: 'huy-demo-storefront-category-locale-migration' })
  .build();

const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });

function copyLocalizedValue(localizedValue) {
  if (!localizedValue || typeof localizedValue !== 'object' || Array.isArray(localizedValue)) {
    return null;
  }

  const sourceValue = localizedValue[SOURCE_LOCALE];
  if (typeof sourceValue !== 'string' || sourceValue.length === 0) return null;
  if (!OVERWRITE && typeof localizedValue[TARGET_LOCALE] === 'string') return null;

  return { ...localizedValue, [TARGET_LOCALE]: sourceValue };
}

function localizedFieldActions(category) {
  const fields = [
    ['name', 'changeName'],
    ['slug', 'changeSlug'],
    ['description', 'setDescription'],
    ['metaTitle', 'setMetaTitle'],
    ['metaDescription', 'setMetaDescription'],
    ['metaKeywords', 'setMetaKeywords'],
  ];

  return fields.flatMap(([field, action]) => {
    const value = copyLocalizedValue(category[field]);
    return value ? [{ action, [field]: value }] : [];
  });
}

function localizedCustomFieldActions(category, customTypes) {
  if (!category.custom) return [];

  const customType = customTypes.get(category.custom.type.id);
  if (!customType) throw new Error(`Custom type ${category.custom.type.id} was not found.`);

  return customType.fieldDefinitions.flatMap((definition) => {
    if (definition.type.name !== 'LocalizedString') return [];

    const value = copyLocalizedValue(category.custom.fields[definition.name]);
    return value ? [{ action: 'setCustomField', name: definition.name, value }] : [];
  });
}

async function loadCustomTypes() {
  const customTypes = new Map();
  let offset = 0;

  while (true) {
    const response = await apiRoot.types().get({
      queryArgs: { limit: PAGE_SIZE, offset, where: 'resourceTypeIds contains any ("category")' },
    }).execute();

    for (const customType of response.body.results) {
      customTypes.set(customType.id, customType);
    }

    offset += response.body.results.length;
    if (offset >= response.body.total) return customTypes;
  }
}

async function migrateCategoryLocales() {
  const customTypes = await loadCustomTypes();
  let offset = 0;
  let scanned = 0;
  let changed = 0;
  let actionCount = 0;

  while (true) {
    const response = await apiRoot.categories().get({
      queryArgs: { limit: PAGE_SIZE, offset, sort: 'id asc' },
    }).execute();

    for (const category of response.body.results) {
      scanned += 1;
      const actions = [
        ...localizedFieldActions(category),
        ...localizedCustomFieldActions(category, customTypes),
      ];
      if (actions.length === 0) continue;

      changed += 1;
      actionCount += actions.length;
      const label = category.name[SOURCE_LOCALE] ?? category.key ?? category.id;

      if (APPLY) {
        await apiRoot.categories().withId({ ID: category.id }).post({
          body: { version: category.version, actions },
        }).execute();
        console.log(`Migrated "${label}" (${actions.length} updates).`);
      } else {
        console.log(`Would migrate "${label}" (${actions.length} updates).`);
      }
    }

    offset += response.body.results.length;
    if (offset >= response.body.total) break;
  }

  const mode = APPLY ? 'Migration complete' : 'Dry run complete';
  console.log(`${mode}: scanned ${scanned} categories; ${changed} categories and ${actionCount} localized values need updates.`);
  if (!APPLY && changed > 0) console.log('Run again with --apply to write the changes.');
}

migrateCategoryLocales().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to migrate category locales: ${message}`);
  process.exitCode = 1;
});
