import React from 'react';
import DOMPurify from 'dompurify';
import { Log } from '@/helpers/errorLogger';
// @ts-expect-error - package has no bundled type declarations
import { markdown as MD } from 'markdown';

export interface Props {
  markdown: string;
  className?: string;
}

const Markdown: React.FC<Props> = ({ markdown }) => {
  const safeMarkdown = typeof markdown === 'string' ? DOMPurify.sanitize(MD.toHTML(markdown)) : '';

  if (typeof markdown !== 'string') {
    Log.error(new Error(`Markdown: Invalid markdown property. Expected string but received ${typeof markdown}`));

    return <></>;
  }

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: safeMarkdown }}></div>
    </>
  );
};

export default Markdown;
