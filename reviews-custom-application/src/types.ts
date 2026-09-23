import type { TChannelRole } from './types/generated/ctp';

export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReviewRecord = {
  id: string;
  productId: string;
  rating: number;
  title: string;
  text: string;
  reviewDate: string;
  reviewerName: string;
  status: ReviewStatus;
};

export type ReviewDraft = Omit<ReviewRecord, 'id'>;

export type TFormValues = {
  key: string;
  name: Record<string, string>;
  roles: TChannelRole[];
};

export type TSyncAction = { action: string; [x: string]: unknown };

export type TGraphqlUpdateAction = Record<string, Record<string, unknown>>;

export type TChangeNameActionPayload = {
  name: Record<string, string>;
};
