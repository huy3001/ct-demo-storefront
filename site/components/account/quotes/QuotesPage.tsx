'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'use-intl';
import { useParams } from 'next/navigation';
import Tabs from '@/components/ui/organisms/tabs';
import { isQuoteList, type Quote } from '@/types/quote';
import QuotesTabContent from './QuotesTabContent';

export default function QuotesPage() {
  const translate = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadQuotes() {
      try {
        const response = await fetch(
          `/api/account/quotes?locale=${encodeURIComponent(locale)}`,
        );
        if (!response.ok) throw new Error(translate('quotes.error.failed-to-load'));
        const data: unknown = await response.json();
        if (!isQuoteList(data)) throw new Error(translate('quotes.error.invalid-response'));
        if (isActive) setQuotes(data);
      } catch {
        if (isActive) setHasLoadError(true);
      }
    }

    void loadQuotes();
    return () => {
      isActive = false;
    };
  }, [locale, translate]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{translate('account.quotes')}</h1>

      {hasLoadError ? (
        <p role="alert" className="text-sm text-red-700">
          {translate('error.wentWrong')}
        </p>
      ) : quotes === null ? (
        <p role="status" className="text-sm text-charcoal-light">
          {translate('common.loading')}
        </p>
      ) : (
        <Tabs>
          <Tabs.TabList>
            <Tabs.Tab>{translate('quotes.all-quotes')}</Tabs.Tab>
            <Tabs.Tab>{translate('quotes.quote-requests')}</Tabs.Tab>
          </Tabs.TabList>
          <Tabs.Panels>
            <Tabs.Panel>
              <QuotesTabContent quotes={quotes} />
            </Tabs.Panel>
            <Tabs.Panel>
              <QuotesTabContent quotes={quotes} />
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      )}
    </div>
  );
}
