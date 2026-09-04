'use client';

import React, { createContext } from 'react';
import useAccount from '@/frontastic/hooks/useAccount';
import { UseAccountReturn } from '@/types/account/Account';

const AccountContext = createContext({} as UseAccountReturn);

const AccountProvider = ({ children }: React.PropsWithChildren) => {
  const accountReturn = useAccount();

  return <AccountContext.Provider value={accountReturn}>{children}</AccountContext.Provider>;
};

export { AccountContext, AccountProvider };
