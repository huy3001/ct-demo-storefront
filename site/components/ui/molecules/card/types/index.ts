import { ReactElement, ReactNode } from 'react';

export interface CardProps {
  icon?: ReactElement<Record<string, unknown>>;
  title?: ReactNode | string;
  summary?: ReactNode | string;
  className?: string;
}
