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
  .withUserAgentMiddleware({ libraryName: 'huy-demo-storefront-product-locale-migration' })
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

function localizedFieldActions(productData) {
  const fields = [
    ['name', 'changeName'],
    ['slug', 'changeSlug'],
    ['description', 'setDescription'],
    ['metaTitle', 'setMetaTitle'],
    ['metaDescription', 'setMetaDescription'],
    ['metaKeywords', 'setMetaKeywords'],
  ];

  return fields.flatMap(([field, action]) => {
    const value = copyLocalizedValue(productData[field]);
    return value ? [{ action, [field]: value, staged: false }] : [];
  });
}

function localizedAttributeDefinitions(productType) {
  return new Map(
    (productType.attributes ?? [])
      .filter(({ type }) => type.name === 'ltext')
      .map((definition) => [definition.name, definition]),
  );
}

function localizedAttributeActions(productData, productType) {
  const definitions = localizedAttributeDefinitions(productType);
  if (definitions.size === 0) return [];

  const variants = [productData.masterVariant, ...productData.variants];
  const sameForAllActions = [...definitions.values()].flatMap((definition) => {
    if (definition.attributeConstraint !== 'SameForAll') return [];

    const attribute = variants
      .flatMap((variant) => variant.attributes ?? [])
      .find(({ name }) => name === definition.name);
    const value = copyLocalizedValue(attribute?.value);

    return value
      ? [{
          action: 'setAttributeInAllVariants',
          name: definition.name,
          value,
          staged: false,
        }]
      : [];
  });

  const perVariantActions = variants.flatMap((variant) =>
    (variant.attributes ?? []).flatMap((attribute) => {
      const definition = definitions.get(attribute.name);
      if (!definition || definition.attributeConstraint === 'SameForAll') return [];
      const value = copyLocalizedValue(attribute.value);
      return value
        ? [{
            action: 'setAttribute',
            variantId: variant.id,
            name: attribute.name,
            value,
            staged: false,
          }]
        : [];
    }),
  );

  return [...sameForAllActions, ...perVariantActions];
}

async function loadProductTypes() {
  const productTypes = new Map();
  let offset = 0;

  while (true) {
    const response = await apiRoot.productTypes().get({
      queryArgs: { limit: PAGE_SIZE, offset },
    }).execute();

    for (const productType of response.body.results) {
      productTypes.set(productType.id, productType);
    }

    offset += response.body.results.length;
    if (offset >= response.body.total) return productTypes;
  }
}

async function updateProduct(product, actions) {
  let version = product.version;

  // The Products API accepts at most 500 update actions per request.
  for (let index = 0; index < actions.length; index += 500) {
    const response = await apiRoot.products().withId({ ID: product.id }).post({
      body: { version, actions: actions.slice(index, index + 500) },
    }).execute();
    version = response.body.version;
  }
}

async function migrateProductLocales() {
  const productTypes = await loadProductTypes();
  let offset = 0;
  let scanned = 0;
  let changed = 0;
  let actionCount = 0;

  while (true) {
    const response = await apiRoot.products().get({
      queryArgs: { limit: PAGE_SIZE, offset, sort: 'id asc' },
    }).execute();

    for (const product of response.body.results) {
      scanned += 1;
      const productType = productTypes.get(product.productType.id);
      if (!productType) throw new Error(`Product type ${product.productType.id} was not found.`);

      const actions = [
        ...localizedFieldActions(product.masterData.staged),
        ...localizedAttributeActions(product.masterData.staged, productType),
      ];
      if (actions.length === 0) continue;

      changed += 1;
      actionCount += actions.length;
      const label = product.masterData.staged.name[SOURCE_LOCALE] ?? product.key ?? product.id;

      if (APPLY) {
        await updateProduct(product, actions);
        console.log(`Migrated "${label}" (${actions.length} updates).`);
      } else {
        console.log(`Would migrate "${label}" (${actions.length} updates).`);
      }
    }

    offset += response.body.results.length;
    if (offset >= response.body.total) break;
  }

  const mode = APPLY ? 'Migration complete' : 'Dry run complete';
  console.log(`${mode}: scanned ${scanned} products; ${changed} products and ${actionCount} localized values need updates.`);
  if (!APPLY && changed > 0) console.log('Run again with --apply to write the changes.');
}

migrateProductLocales().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to migrate product locales: ${message}`);
  process.exitCode = 1;
});
