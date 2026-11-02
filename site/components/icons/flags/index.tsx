import React from 'react';

type Props = {
  flagName: string;
  className?: string;
};

const Icon: React.FC<Props> = ({ className, flagName }: Props) => {
  const iconClassNames = `fi fi-${flagName.toLowerCase()} h-3.5 w-5 ${className}`;
  return <span className={iconClassNames} />;
};

export default Icon;
