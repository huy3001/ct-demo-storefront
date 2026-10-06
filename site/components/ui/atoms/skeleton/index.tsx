'use client';

import { classnames } from '@/helpers/utils/classnames';
import ReactSkeleton from 'react-loading-skeleton';
import { SkeletonProps } from './types';
import 'react-loading-skeleton/dist/skeleton.css';

const Skeleton = ({ className, fillMode = false, ...props }: SkeletonProps) => {
  const classNames = classnames({ 'absolute left-0 top-0 z-10 size-full': fillMode }, className);

  return (
    <div data-testid="skeleton" className={classNames} {...props}>
      <ReactSkeleton className="size-full" />
    </div>
  );
};

export default Skeleton;
