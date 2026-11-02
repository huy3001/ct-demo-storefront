import { ClientBuilder } from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

const SOURCE = { locale: 'en-US', currency: 'USD', country: 'US' };
const TARGET = { locale: 'en-AU', currency: 'AUD', country: 'AU' };
const PAGE_SIZE = 100;
const APPLY = process.argv.includes('--apply');

function argument(name) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

const conversionRate = Number(argument('rate') ?? process.env.USD_TO_AUD_RATE);
if (!Number.isFinite(conversionRate) || conversionRate <= 0) {
  throw new Error('Provide a positive USD-to-AUD conversion rate with --rate=<number> or USD_TO_AUD_RATE.');
}

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
  .withUserAgentMiddleware({ libraryName: 'huy-demo-storefront-product-price-migration' })
  .build();

const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });

function referenceId(reference) {
  return reference?.id ?? null;
}

function samePriceScope(left, right) {
  return left.value.currencyCode === right.value.currencyCode
    && (left.country ?? null) === (right.country ?? null)
    && referenceId(left.customerGroup) === referenceId(right.customerGroup)
    && referenceId(left.channel) === referenceId(right.channel)
    && (left.validFrom ?? null) === (right.validFrom ?? null)
    && (left.validUntil ?? null) === (right.validUntil ?? null)
    && referenceId(left.recurrencePolicy) === referenceId(right.recurrencePolicy);
}

function convertMoney(money) {
  if (money.type && money.type !== 'centPrecision') {
    throw new Error(`High-precision price conversion is not supported (received ${money.type}).`);
  }

  return {
    currencyCode: TARGET.currency,
    centAmount: Math.round(money.centAmount * conversionRate),
  };
}

function targetPriceDraft(sourcePrice) {
  return {
    value: convertMoney(sourcePrice.value),
    country: TARGET.country,
    ...(sourcePrice.customerGroup ? { customerGroup: { id: sourcePrice.customerGroup.id } } : {}),
    ...(sourcePrice.channel ? { channel: { id: sourcePrice.channel.id } } : {}),
    ...(sourcePrice.validFrom ? { validFrom: sourcePrice.validFrom } : {}),
    ...(sourcePrice.validUntil ? { validUntil: sourcePrice.validUntil } : {}),
    ...(sourcePrice.recurrencePolicy
      ? { recurrencePolicy: { id: sourcePrice.recurrencePolicy.id } }
      : {}),
    ...(sourcePrice.tiers
      ? {
          tiers: sourcePrice.tiers.map((tier) => ({
            minimumQuantity: tier.minimumQuantity,
            value: convertMoney(tier.value),
          })),
        }
      : {}),
  };
}

function priceActions(productData) {
  const variants = [productData.masterVariant, ...productData.variants];

  return variants.flatMap((variant) => {
    const prices = variant.prices ?? [];
    const sourcePrices = prices.filter(
      (price) => price.value.currencyCode === SOURCE.currency && price.country === SOURCE.country,
    );

    return sourcePrices.flatMap((sourcePrice) => {
      const draft = targetPriceDraft(sourcePrice);
      if (prices.some((price) => samePriceScope(price, draft))) return [];

      return [{
        action: 'addPrice',
        variantId: variant.id,
        price: draft,
        staged: false,
      }];
    });
  });
}

async function migrateProductPrices() {
  let offset = 0;
  let scanned = 0;
  let changed = 0;
  let priceCount = 0;

  while (true) {
    const response = await apiRoot.products().get({
      queryArgs: { limit: PAGE_SIZE, offset, sort: 'id asc' },
    }).execute();

    for (const product of response.body.results) {
      scanned += 1;
      if (product.priceMode === 'Standalone') continue;

      const actions = priceActions(product.masterData.staged);
      if (actions.length === 0) continue;

      changed += 1;
      priceCount += actions.length;
      const label = product.masterData.staged.name[SOURCE.locale] ?? product.key ?? product.id;

      if (APPLY) {
        await apiRoot.products().withId({ ID: product.id }).post({
          body: { version: product.version, actions },
        }).execute();
        console.log(`Migrated prices for "${label}" (${actions.length} prices).`);
      } else {
        console.log(`Would migrate prices for "${label}" (${actions.length} prices).`);
      }
    }

    offset += response.body.results.length;
    if (offset >= response.body.total) break;
  }

  const mode = APPLY ? 'Migration complete' : 'Dry run complete';
  console.log(`${mode}: scanned ${scanned} products; ${changed} products and ${priceCount} prices need updates at rate ${conversionRate}.`);
  if (!APPLY && changed > 0) console.log('Run again with the same --rate and --apply to write the changes.');
}

migrateProductPrices().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to migrate product prices: ${message}`);
  process.exitCode = 1;
});
