export const SEARCH_SORTS = [
  'price-asc',
  'price-desc',
  'name-asc',
  'name-desc',
  'relevance',
] as const;

export const PRODUCT_PAGE_SIZES = [12, 24, 48] as const;
export const DEFAULT_PRODUCT_PAGE_SIZE = 24;

type SearchParam = string | string[] | undefined;

export function parseProductListingParams(params: Record<string, SearchParam>) {
  const page = Math.max(1, Number.parseInt(String(params.page ?? '1'), 10) || 1);
  const requestedPageSize = Number.parseInt(
    String(params.pageSize ?? DEFAULT_PRODUCT_PAGE_SIZE),
    10,
  );
  const pageSize = PRODUCT_PAGE_SIZES.some((size) => size === requestedPageSize)
    ? requestedPageSize
    : DEFAULT_PRODUCT_PAGE_SIZE;
  const requestedSort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort = SEARCH_SORTS.find((value) => value === requestedSort);

  return { page, pageSize, sort };
}
