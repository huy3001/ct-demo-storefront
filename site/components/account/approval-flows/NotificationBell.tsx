'use client';

import { PopoverButton } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import useSWR from 'swr';
import { useTranslations } from 'use-intl';
import Link from '@/components/ui/atoms/link';
import Popover from '@/components/ui/molecules/popover';
import { useAccount } from '@/hooks/useAccount';
import useDisclosure from '@/hooks/useDisclosure';
import type { ApprovalFlowNotification } from '@/types/approval-flow';

export const NOTIFICATIONS_KEY = '/api/account/notifications';

const REFRESH_INTERVAL_MS = 60_000;

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load notifications');
  return response.json() as Promise<ApprovalFlowNotification[]>;
};

export default function NotificationBell() {
  const translate = useTranslations();
  const { isSignedIn } = useAccount();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: notifications = [] } = useSWR(
    isSignedIn ? NOTIFICATIONS_KEY : null,
    fetcher,
    { refreshInterval: REFRESH_INTERVAL_MS, revalidateOnFocus: false },
  );

  if (!isSignedIn) return null;

  const unreadCount = notifications.filter(({ read }) => !read).length;

  return (
    <div className="h-10 w-fit">
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        direction="right"
        buttonElement={() => (
          <PopoverButton
            title={translate('account.notifications-title')}
            aria-label={translate('account.notifications-title')}
            className="relative h-fit cursor-pointer border-gray-600 pb-2 outline-none hover:border-b-2"
            onClick={onOpen}
          >
            <BellIcon className="w-7 text-charcoal" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-terra text-[10px] text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </PopoverButton>
        )}
      >
        <div className="w-72 max-h-96 overflow-y-auto p-4 shadow-lg">
          <p className="mb-3 text-sm font-semibold text-charcoal">
            {translate('account.notifications-title')}
          </p>
          {notifications.length === 0 ? (
            <p className="text-sm text-charcoal-light">
              {translate('account.notifications-empty')}
            </p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li key={notification.flowId}>
                  <Link
                    link={`/account/approval-flows/${notification.flowId}?businessUnitKey=${encodeURIComponent(notification.businessUnitKey)}`}
                    onClick={onClose}
                    className={`block text-sm hover:text-terra ${notification.read ? 'text-charcoal-light' : 'font-semibold text-charcoal'}`}
                  >
                    {translate('account.notifications-new-approval', {
                      orderNumber: notification.orderNumber,
                    })}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Popover>
    </div>
  );
}
