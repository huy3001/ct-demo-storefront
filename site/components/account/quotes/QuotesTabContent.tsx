'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'use-intl';
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Input from '@/components/ui/atoms/input';
import MultiDropdown from '@/components/ui/atoms/multi-dropdown';
import Label from '@/components/ui/atoms/label';
import Link from '@/components/ui/atoms/link';
import Table from '@/components/ui/organisms/table';
import { formatMoney } from '@/lib/utils';
import { QUOTE_STATUSES, type Quote } from '@/types/quote';
import QuoteStatusBadge from './QuoteStatusBadge';
import QuoteStatusHelpModal from './QuoteStatusHelpModal';

const PAGE_SIZE_VALUES = ['12', '24', '48', 'all'] as const;

const DEFAULT_PAGE_SIZE = 12;

function filterQuotes(
  quotes: Quote[],
  search: string,
  statuses: string[],
): Quote[] {
  const normalizedSearch = search.trim().toLowerCase();

  return quotes.filter((quote) => {
    const matchesSearch =
      !normalizedSearch || quote.id.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      statuses.length === 0 || statuses.includes(quote.status);
    return matchesSearch && matchesStatus;
  });
}

export default function QuotesTabContent({ quotes }: { quotes: Quote[] }) {
  const translate = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(DEFAULT_PAGE_SIZE);
  const [isStatusHelpOpen, setIsStatusHelpOpen] = useState(false);

  const pageSizeOptions = useMemo(
    () =>
      PAGE_SIZE_VALUES.map((value) => ({
        name: value === 'all' ? translate('common.all') : value,
        value,
      })),
    [translate],
  );

  const filteredQuotes = useMemo(
    () => filterQuotes(quotes, search, statuses),
    [quotes, search, statuses],
  );

  const effectiveLimit =
    pageSize === 'all' ? Math.max(filteredQuotes.length, 1) : pageSize;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuotes.length / effectiveLimit),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, statuses]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedQuotes = useMemo(() => {
    if (pageSize === 'all') return filteredQuotes;
    const start = (page - 1) * pageSize;
    return filteredQuotes.slice(start, start + pageSize);
  }, [filteredQuotes, page, pageSize]);

  const statusButtonLabel =
    statuses.length === 0
      ? translate('quotes.status')
      : statuses.length === 1
        ? statuses[0]
        : translate('quotes.status-selected', { count: statuses.length });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <div className="relative">
            <Input
              label={translate('quotes.search-label')}
              id="search-for-quote"
              name="search-for-quote"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={translate('quotes.search-placeholder')}
              aria-label={translate('quotes.search-label')}
              className="pr-10"
            />
            {search ? (
              <button
                type="button"
                aria-label={translate('common.clear')}
                className="absolute right-3 bottom-3 flex items-center"
                onClick={() => setSearch('')}
              >
                <XMarkIcon className="size-4 text-charcoal" />
              </button>
            ) : (
              <MagnifyingGlassIcon className="pointer-events-none absolute right-3 bottom-3 size-4 text-charcoal" />
            )}
          </div>
        </div>

        <div className="w-full lg:max-w-xs">
          <Label
            showOptionalLabel
            optionalLabel={
              <button
                type="button"
                aria-label={translate('quotes.status-help')}
                className="text-charcoal hover:text-terra"
                onClick={() => setIsStatusHelpOpen(true)}
              >
                <QuestionMarkCircleIcon className="size-5" />
              </button>
            }
          >
            {translate('quotes.status')}
          </Label>
          <MultiDropdown
            value={statuses}
            onChange={setStatuses}
            className="w-full"
          >
            <MultiDropdown.Button className="w-full">
              {statusButtonLabel}
            </MultiDropdown.Button>
            <MultiDropdown.Options>
              {QUOTE_STATUSES.map((status) => (
                <MultiDropdown.Option
                  key={status}
                  value={status}
                >
                  {status}
                </MultiDropdown.Option>
              ))}
            </MultiDropdown.Options>
          </MultiDropdown>
        </div>
      </div>

      <Table>
        <Table.Container>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>
                {translate('quotes.column-status')}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {translate('quotes.column-id')}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {translate('quotes.column-date')}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {translate('quotes.column-business-unit')}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {translate('quotes.column-total')}
              </Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {pagedQuotes.length === 0 ? (
              <Table.Row>
                <Table.Cell
                  className="text-center"
                  colSpan={6}
                >
                  {translate('common.no-results-found')}
                </Table.Cell>
              </Table.Row>
            ) : (
              pagedQuotes.map((quote) => (
                <Table.Row key={quote.id}>
                  <Table.Cell cellHeading={translate('quotes.column-status')}>
                    <QuoteStatusBadge status={quote.status} />
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.column-id')}>
                    <span>{quote.id}</span>
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.column-date')}>
                    <span>
                      {new Date(quote.createdAt).toLocaleDateString(locale)}
                    </span>
                  </Table.Cell>
                  <Table.Cell
                    cellHeading={translate('quotes.column-business-unit')}
                  >
                    <span>{quote.businessUnit}</span>
                  </Table.Cell>
                  <Table.Cell cellHeading={translate('quotes.column-total')}>
                    <span>
                      {formatMoney(
                        quote.totalCentAmount,
                        quote.currencyCode,
                        locale,
                      )}
                    </span>
                  </Table.Cell>
                  <Table.Cell
                    cellHeading={translate('orders.action')}
                    className="lg:text-right"
                    isButtonsCell
                  >
                    <Link
                      variant="primary"
                      link={`/account/quote/${quote.id}`}
                      className="text-terra hover:underline whitespace-nowrap"
                    >
                      {translate('quotes.view')}
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Container>

        <Table.Pagination
          page={page}
          limit={effectiveLimit}
          totalItems={filteredQuotes.length}
          rowsPerPageOptions={pageSizeOptions}
          rowsPerPageValue={pageSize === 'all' ? 'all' : String(pageSize)}
          onRowsPerPageChange={(value) => {
            setPage(1);
            setPageSize(value === 'all' ? 'all' : Number(value));
          }}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
        />
      </Table>

      <QuoteStatusHelpModal
        isOpen={isStatusHelpOpen}
        onClose={() => setIsStatusHelpOpen(false)}
        title={translate('quotes.status-help-title')}
      />
    </div>
  );
}
