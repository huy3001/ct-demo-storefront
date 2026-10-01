'use client';

import { useTranslations } from 'use-intl';
import Tabs from '@/components/ui/organisms/tabs';
import QuotesTabContent from './QuotesTabContent';

export default function QuotesPage() {
  const translate = useTranslations();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{translate('account.quotes')}</h1>

      <Tabs>
        <Tabs.TabList>
          <Tabs.Tab>{translate('quotes.all-quotes')}</Tabs.Tab>
          <Tabs.Tab>{translate('quotes.quote-requests')}</Tabs.Tab>
        </Tabs.TabList>
        <Tabs.Panels>
          <Tabs.Panel>
            <QuotesTabContent />
          </Tabs.Panel>
          <Tabs.Panel>
            <QuotesTabContent />
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
    </div>
  );
}
