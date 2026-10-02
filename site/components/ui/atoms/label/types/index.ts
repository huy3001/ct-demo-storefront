import type { ReactNode } from 'react';

export interface LabelProps {
  required?: boolean;
  requiredStyle?: 'asterisk' | 'label';
  showOptionalLabel?: boolean;
  optionalLabel?: ReactNode | string;
  htmlFor?: string;
}
