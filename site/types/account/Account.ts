import { Address } from './Address';
import { AccountToken } from './AccountToken';
import { ResponseError } from '@/frontastic/utils/error';
import useAccount from '@/frontastic/hooks/useAccount';

export interface Account {
  accountId?: string;
  accountVersion?: number;
  email: string;
  salutation?: string;
  firstName?: string;
  lastName?: string;
  birthday?: Date;
  password?: string; // TODO: should we use hash the password or use plain password?
  confirmationToken?: AccountToken;
  confirmed?: boolean;
  addresses?: Address[];
  apiToken?: string;
  accountGroupIds?: string[];
}

export interface AccountGroup {
  accountGroupId?: string;
  key?: string;
  name?: string;
}

export interface GetAccountResult {
  loggedIn: boolean;
  accountLoading: boolean;
  account?: Account;
  error?: ResponseError;
}

export interface UpdateAccount {
  firstName?: string;
  lastName?: string;
  email?: string;
  salutation?: string;
  birthdayYear?: number;
  birthdayMonth?: number;
  birthdayDay?: number;
}

export interface RegisterAccount extends UpdateAccount {
  email: string;
  password: string;
  billingAddress?: Address;
  shippingAddress?: Address;
}

export type UseAccountReturn = ReturnType<typeof useAccount>;
