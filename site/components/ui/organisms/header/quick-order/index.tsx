'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'use-intl';
import { useCart } from '@/hooks/useCart';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Accordion from '@/components/ui/atoms/accordion';
import Button from '@/components/ui/atoms/button';
import Drawer from '@/components/ui/atoms/drawer';
import Image from '@/components/ui/atoms/image';
import Input from '@/components/ui/atoms/input';
import Label from '@/components/ui/atoms/label';
import Link from '@/components/ui/atoms/link';
import QuantitySelector from '@/components/ui/atoms/quantity-selector';
import { uploadImage } from '@/helpers/mocks/mockData';

interface SearchField {
  id: number;
  query: string;
  result?: QuickOrderItem;
  suggestions: QuickOrderItem[];
  searchedQuery?: string;
  error?: string;
}

interface QuickOrderItem {
  productId: string;
  name: string;
  variantId: number;
  sku: string;
  quantity: number;
}

interface SearchProduct {
  productId: string;
  name: string;
  variants: Array<{ id: number; sku: string }>;
}

interface SearchOutcome {
  id: number;
  query: string;
  suggestions: QuickOrderItem[];
  error?: string;
}

interface QuickOrderProps {
  triggerClassName?: string;
  triggerSize?: 's' | 'full';
  onOpen?: () => void;
}

function parseCsv(
  csv: string,
  errors: {
    unfinished: string;
    noProduct: string;
    noSku: string;
    invalidRow: string;
  },
): Array<{ sku: string; quantity: number }> {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && csv[index + 1] === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error(errors.unfinished);
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2) throw new Error(errors.noProduct);

  const headers = rows[0].map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, '') : header).toLowerCase(),
  );
  const skuIndex = headers.indexOf('sku');
  const quantityIndex = headers.indexOf('quantity');
  if (skuIndex === -1) throw new Error(errors.noSku);

  return rows.slice(1).map((values) => {
    const sku = values[skuIndex]?.trim();
    const quantityValue =
      quantityIndex === -1 ? '1' : values[quantityIndex]?.trim();
    const quantity = Number(quantityValue || 1);
    if (!sku || !Number.isSafeInteger(quantity) || quantity < 1) {
      throw new Error(errors.invalidRow);
    }
    return { sku, quantity };
  });
}

async function searchProducts(
  query: string,
  locale: string,
  error: string,
  signal?: AbortSignal,
): Promise<QuickOrderItem[]> {
  const params = new URLSearchParams({ q: query, locale });
  const response = await fetch(`/api/quick-order?${params.toString()}`, {
    signal,
  });
  const body = (await response.json()) as {
    products?: SearchProduct[];
    message?: string;
  };
  if (!response.ok)
    throw new Error(body.message ?? error ?? 'Product search failed.');

  return (body.products ?? []).flatMap((product) =>
    product.variants.map((variant) => ({
      productId: product.productId,
      name: product.name,
      variantId: variant.id,
      sku: variant.sku,
      quantity: 1,
    })),
  );
}

async function findProduct(
  query: string,
  locale: string,
  error: string,
): Promise<QuickOrderItem> {
  const product = (await searchProducts(query, locale, error))[0];
  if (!product) throw new Error(error);
  return product;
}

const QuickOrder = ({
  triggerClassName = '',
  triggerSize = 's',
  onOpen,
}: QuickOrderProps) => {
  const locale = useLocale();
  const translate = useTranslations();
  const { addItemBySku } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [fields, setFields] = useState<SearchField[]>([
    { id: 0, query: '', suggestions: [] },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRunRef = useRef(0);
  const [nextFieldId, setNextFieldId] = useState(1);
  const [searchingFields, setSearchingFields] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadedItems, setUploadedItems] = useState<QuickOrderItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const hasSearchInput = fields.some((field) => field.query.trim().length > 0);
  const canAddToCart = hasSearchInput || uploadedItems.length > 0;
  const canUpload =
    selectedFile !== null &&
    selectedFile.name.toLowerCase().endsWith('.csv') &&
    !fileError &&
    !isUploading;

  const openDrawer = () => {
    onOpen?.();
    setIsOpen(true);
  };

  const updateFieldQuery = (id: number, query: string) => {
    setFields((current) =>
      current.map((field) =>
        field.id === id
          ? {
              ...field,
              query,
              result: undefined,
              suggestions: [],
              searchedQuery: undefined,
              error: undefined,
            }
          : field,
      ),
    );
    setSearchingFields((current) =>
      current.filter((fieldId) => fieldId !== id),
    );
  };

  const selectSuggestion = (
    id: number,
    query: string,
    result: QuickOrderItem,
  ) => {
    setFields((current) =>
      current.map((field) =>
        field.id === id
          ? { ...field, query, result, suggestions: [], error: undefined }
          : field,
      ),
    );
    setSearchingFields((current) =>
      current.filter((fieldId) => fieldId !== id),
    );
  };

  useEffect(() => {
    const pendingSearches = fields
      .filter((field) => {
        const query = field.query.trim();
        return (
          query.length >= 3 && !field.result && field.searchedQuery !== query
        );
      })
      .map((field) => ({ id: field.id, query: field.query.trim() }));

    if (pendingSearches.length === 0) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setSearchingFields((current) => [
        ...new Set([...current, ...pendingSearches.map(({ id }) => id)]),
      ]);

      void Promise.all(
        pendingSearches.map(async ({ id, query }): Promise<SearchOutcome> => {
          try {
            const suggestions = await searchProducts(
              query,
              locale,
              translate('error.product-search-fail'),
              controller.signal,
            );
            return { id, query, suggestions };
          } catch (error) {
            return {
              id,
              query,
              suggestions: [],
              error:
                error instanceof Error
                  ? error.message
                  : 'Product search failed.',
            };
          }
        }),
      ).then((outcomes) => {
        if (controller.signal.aborted) return;
        setFields((current) =>
          current.map((field) => {
            const outcome = outcomes.find(
              (candidate) =>
                candidate.id === field.id &&
                candidate.query === field.query.trim(),
            );
            return outcome
              ? {
                  ...field,
                  suggestions: outcome.suggestions,
                  searchedQuery: outcome.query,
                  error: outcome.error,
                }
              : field;
          }),
        );
        const completedIds = pendingSearches.map(({ id }) => id);
        setSearchingFields((current) =>
          current.filter((fieldId) => !completedIds.includes(fieldId)),
        );
      });
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [fields, locale, translate]);

  const selectFile = (fileList: FileList | null) => {
    uploadRunRef.current += 1;
    setIsUploading(false);
    const file = fileList?.[0] ?? null;
    setSelectedFile(file);
    setUploadedItems([]);
    setUploadError('');
    setFileError(
      file && !file.name.toLowerCase().endsWith('.csv')
        ? translate('error.csv-only-allowed')
        : '',
    );
  };

  const clearFile = () => {
    uploadRunRef.current += 1;
    setIsUploading(false);
    setSelectedFile(null);
    setFileError('');
    setUploadError('');
    setUploadedItems([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async () => {
    if (!selectedFile || !canUpload) return;
    uploadRunRef.current += 1;
    const uploadRun = uploadRunRef.current;
    setIsUploading(true);
    setUploadError('');
    setUploadedItems([]);
    try {
      const data = await selectedFile.text();
      const rows = parseCsv(data, {
        unfinished: translate('error.csv-unfinished-quoted-value'),
        noProduct: translate('error.csv-no-product'),
        noSku: translate('error.csv-no-sku'),
        invalidRow: translate('error.csv-invalid-row'),
      });
      const items = await Promise.all(
        rows.map(async ({ sku, quantity }) => ({
          ...(await findProduct(
            sku,
            locale,
            translate('error.product-not-found', { query: sku }),
          )),
          quantity,
        })),
      );
      if (uploadRun !== uploadRunRef.current) return;
      setUploadedItems(items);
    } catch (error) {
      if (uploadRun !== uploadRunRef.current) return;
      setUploadError(
        error instanceof Error
          ? error.message
          : translate('error.csv-upload-fail'),
      );
      toast.error(
        error instanceof Error
          ? error.message
          : translate('error.csv-upload-fail'),
      );
    } finally {
      if (uploadRun === uploadRunRef.current) setIsUploading(false);
    }
  };

  const addToCart = async () => {
    if (!canAddToCart || isAdding) return;
    setIsAdding(true);
    setAddError('');
    try {
      const searchedItems = await Promise.all(
        fields
          .filter((field) => field.query.trim())
          .map(
            async (field) =>
              field.result ??
              findProduct(
                field.query.trim(),
                locale,
                translate('error.product-not-found', {
                  query: field.query.trim(),
                }),
              ),
          ),
      );
      for (const item of [...searchedItems, ...uploadedItems]) {
        await addItemBySku(item.sku, item.quantity).then(() => {
          toast.success(translate('orders.product-added-to-cart'));
        });
      }
      setIsOpen(false);
    } catch (error) {
      setAddError(
        error instanceof Error
          ? error.message
          : translate('orders.products-not-added-to-cart'),
      );
      toast.error(
        error instanceof Error
          ? error.message
          : translate('orders.products-not-added-to-cart'),
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={triggerSize}
        className={triggerClassName}
        onClick={openDrawer}
      >
        {translate('orders.quick-order')}
      </Button>

      <Drawer
        isOpen={isOpen}
        direction="right"
        className="w-[90%] max-w-95 bg-white"
        onClose={() => setIsOpen(false)}
      >
        <div className="flex items-center justify-between border-b border-neutral-400 px-5 py-6">
          <h2 className="text-lg font-medium text-charcoal leading-normal md:text-xl">
            {translate('orders.quick-add-cart')}
          </h2>
          <button
            type="button"
            aria-label="Close Quick Order"
            onClick={() => setIsOpen(false)}
            className="cursor-pointer transition hover:opacity-80"
          >
            <XMarkIcon className="size-7" />
          </button>
        </div>

        <div className="h-full overflow-y-auto space-y-5 p-4 md:p-5">
          <section className="rounded-sm border border-border">
            <Accordion
              variant="arrow"
              closedSectionTitle={translate('orders.search-product')}
              openSectionTitle={translate('orders.search-product')}
              buttonClassName="font-medium text-charcoal p-4"
              defaultOpen={true}
            >
              <div className="space-y-5 border-t border-neutral-200 p-4">
                <div className="space-y-3">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative w-full">
                          <Input
                            labelPosition="inline"
                            id={`quick-order-search-${field.id}`}
                            type="search"
                            value={field.query}
                            disabled={Boolean(field.result)}
                            onChange={(event) =>
                              updateFieldQuery(field.id, event.target.value)
                            }
                            placeholder={translate('common.search')}
                            className="pr-10"
                          />

                          {field.result ? (
                            <Button
                              variant="ghost"
                              aria-label={`Remove ${field.result.name}`}
                              onClick={() => updateFieldQuery(field.id, '')}
                              className="absolute! right-0 top-0 px-3!"
                            >
                              <XMarkIcon className="size-4 text-charcoal" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              aria-label={translate('common.click-to-search')}
                              title={translate('common.click-to-search')}
                              className="absolute! right-0 top-0 px-3!"
                              disabled={
                                field.query.trim().length < 3 ||
                                searchingFields.includes(field.id)
                              }
                              onClick={() =>
                                setFields((current) =>
                                  current.map((item) =>
                                    item.id === field.id
                                      ? {
                                          ...item,
                                          suggestions: [],
                                          searchedQuery: undefined,
                                          error: undefined,
                                        }
                                      : item,
                                  ),
                                )
                              }
                            >
                              <MagnifyingGlassIcon className="size-4 text-charcoal" />
                            </Button>
                          )}

                          {field.query.trim().length >= 3 && (
                            <div className="absolute top-full w-full max-h-48 bg-white overflow-y-auto rounded-sm shadow-md z-50">
                              {searchingFields.includes(field.id) && (
                                <p className="text-xs text-charcoal-light p-3">
                                  Searching…
                                </p>
                              )}

                              {field.searchedQuery === field.query.trim() &&
                                field.suggestions.length === 0 &&
                                !field.result &&
                                !field.error &&
                                !searchingFields.includes(field.id) && (
                                  <p className="text-xs text-charcoal-light p-3">
                                    No matching products.
                                  </p>
                                )}

                              {field.suggestions.length > 0 &&
                                !field.result && (
                                  <ul aria-label="Product suggestions">
                                    {field.suggestions.map((suggestion) => (
                                      <li
                                        key={`${suggestion.productId}-${suggestion.variantId}`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() =>
                                            selectSuggestion(
                                              field.id,
                                              suggestion.sku,
                                              suggestion,
                                            )
                                          }
                                          className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-neutral-100"
                                        >
                                          <span className="font-medium">
                                            {suggestion.name}
                                          </span>
                                          <span className="text-xs text-charcoal-light">
                                            SKU: {suggestion.sku}
                                          </span>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </div>
                          )}
                        </div>

                        {field.result && (
                          <QuantitySelector
                            value={field.result.quantity}
                            minValue={1}
                            onChange={(quantity) =>
                              setFields((current) =>
                                current.map((item) =>
                                  item.id === field.id && item.result
                                    ? {
                                        ...item,
                                        result: { ...item.result, quantity },
                                      }
                                    : item,
                                ),
                              )
                            }
                            className="h-10 gap-0"
                          />
                        )}
                      </div>

                      {field.error && (
                        <p className="text-xs text-red-600">{field.error}</p>
                      )}
                    </div>
                  ))}
                </div>

                {!!fields[0].query && (
                  <Button
                    variant="primary"
                    size="full"
                    onClick={() => {
                      setFields((current) => [
                        ...current,
                        { id: nextFieldId, query: '', suggestions: [] },
                      ]);
                      setNextFieldId((current) => current + 1);
                    }}
                  >
                    {translate('orders.add-more-product')}
                  </Button>
                )}
              </div>
            </Accordion>
          </section>

          <section className="rounded-sm border border-border">
            <Accordion
              variant="arrow"
              closedSectionTitle={translate('orders.upload-csv-file')}
              openSectionTitle={translate('orders.upload-csv-file')}
              buttonClassName="font-medium text-charcoal p-4"
            >
              <div className="space-y-5 border-t border-neutral-200 p-4">
                <div className="space-y-3">
                  <div>
                    <Link
                      variant="menu-header"
                      link="/template.csv"
                      download="template.csv"
                      className="underline underline-offset-2"
                    >
                      {translate('orders.download-template')}
                    </Link>
                  </div>
                  <div>
                    <Label
                      htmlFor="quick-order-csv"
                      className="w-full flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-neutral-200 px-4 py-5 text-center hover:bg-neutral-50"
                    >
                      <span className="block relative w-10 h-10 mx-auto">
                        <Image
                          src={uploadImage.media.file}
                          alt={uploadImage.media.name}
                          className="object-contain"
                          fill
                        />
                      </span>
                      <span className="font-medium text-sm text-charcoal">
                        Choose a CSV file
                      </span>
                    </Label>

                    <input
                      id="quick-order-csv"
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={(event) =>
                        selectFile(event.currentTarget.files)
                      }
                    />
                  </div>

                  {selectedFile && (
                    <div className="flex items-center justify-between gap-2 truncate rounded-sm border border-neutral-300 px-3 py-2 text-sm">
                      <span>{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        onClick={clearFile}
                        className="p-0!"
                      >
                        <XMarkIcon className="size-4 text-charcoal" />
                      </Button>
                    </div>
                  )}

                  {fileError && (
                    <p className="text-sm text-red-600">{fileError}</p>
                  )}

                  {uploadError && (
                    <p className="text-sm text-red-600">{uploadError}</p>
                  )}

                  {uploadedItems.length > 0 && (
                    <div className="flex flex-col gap-2 text-sm text-charcoal">
                      <p className="font-medium">
                        {translate('orders.products-selected-to-cart')}:
                      </p>

                      {uploadedItems.map((item) => (
                        <p
                          key={item.sku}
                          className="flex items-center justify-between gap-2"
                        >
                          <span>
                            {`${translate('quotes.sku')}: ${item.sku}`}
                          </span>
                          <span>
                            {`${translate('quotes.qty')}: ${item.quantity}`}
                          </span>
                          <Button
                            variant="ghost"
                            onClick={() =>
                              setUploadedItems((prev) =>
                                prev.filter((i) => i.sku !== item.sku),
                              )
                            }
                            className="p-0!"
                          >
                            <XMarkIcon className="size-4 text-charcoal" />
                          </Button>
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="full"
                      disabled={!selectedFile}
                      onClick={clearFile}
                    >
                      {translate('product.clear')}
                    </Button>

                    <Button
                      variant="primary"
                      size="full"
                      disabled={!canUpload || isUploading}
                      onClick={() => void uploadFile()}
                    >
                      {translate('orders.upload')}
                    </Button>
                  </div>
                </div>
              </div>
            </Accordion>
          </section>

          {addError && <p className="text-sm text-red-600">{addError}</p>}
        </div>

        <div className="p-4 md:p-5">
          <Button
            variant="primary"
            size="full"
            disabled={!canAddToCart || isAdding}
            onClick={() => void addToCart()}
          >
            {isAdding ? translate('orders.adding') : translate('cart.cart-add')}
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default QuickOrder;
