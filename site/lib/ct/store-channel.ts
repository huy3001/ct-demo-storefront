import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import { COUNTRY_CONFIG } from '@/lib/utils';

export async function getStorePriceChannel(
  apiRoot: ByProjectKeyRequestBuilder,
  locale: string,
): Promise<string | undefined> {
  const { country } = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];
  const { body } = await apiRoot
    .stores()
    .get({
      queryArgs: {
        sort: 'key asc',
        limit: 500,
      },
    })
    .execute();
  
  const defaultStore = body.results.find(
    (store) => store.key === 'us-medium-customers',
  );

  const selectedStore =
    body.results.find((store) =>
      store.countries?.some((storeCountry) => storeCountry.code === country),
    ) ?? defaultStore;

  return selectedStore?.distributionChannels[0]?.id;
}
