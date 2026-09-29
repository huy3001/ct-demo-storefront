import React, { useCallback } from 'react';
import { CardProps } from './types';

const Card = ({ icon, title, summary }: CardProps) => {
  const renderIcon = useCallback(() => {
    if (!React.isValidElement(icon)) return icon;

    return React.cloneElement(icon, { ...icon.props, className: `${icon.props.className ?? ''} w-full h-full` });
  }, [icon]);

  return (
    <div className="flex w-full items-center gap-4 rounded-sm border bg-white border-border p-5 hover:border-terra md:gap-5">
      <div className="box-content rounded-full bg-neutral-300 p-5">
        <span className="block size-5 text-charcoal md:size-6 lg:size-7">
          {renderIcon()}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <h5 className="font-medium leading-normal text-charcoal">{title}</h5>
        <p className="text-sm leading-loose text-charcoal-light">{summary}</p>
      </div>
    </div>
  );
};

export default Card;
