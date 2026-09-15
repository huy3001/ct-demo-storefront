import React from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

type Props = {
  className?: string;
  totalCartItems?: number;
  counterClassName?: string;
};

const Icon: React.FC<Props> = ({ className, totalCartItems = 0, counterClassName }) => (
  <div className="relative">
    {totalCartItems > 0 && (
      <>
        <span className="absolute -right-1.5 -top-1 size-2.5 rounded-full bg-green-500" />
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-gray-600 ${counterClassName}`}
        >
          {totalCartItems}
        </span>
      </>
    )}
    <ShoppingBagIcon className={className} />
  </div>
);

export default Icon;
