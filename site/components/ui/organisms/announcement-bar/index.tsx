import React, { useCallback, useEffect, useState } from 'react';
import Link from '@/components/ui/atoms/link';
import ShippingAndLanguageSection from '@/components/ui/organisms/shipping-and-language';
import { Reference } from '@/types/reference';

export interface Props {
  text: string;
  highlightedSubstring: string;
  target?: Reference;
}

const AnnouncementBar: React.FC<Props> = ({ text, highlightedSubstring, target }) => {
  const [previewText, setPreviewText] = useState({ prefix: text, middle: '', suffix: '' });

  const processHighlighting = useCallback(() => {
    const start = text?.indexOf(highlightedSubstring);

    if (!highlightedSubstring || start === -1) {
      setPreviewText({ prefix: text, middle: '', suffix: '' });
      return;
    }

    const end = start + highlightedSubstring.length - 1;

    setPreviewText({
      prefix: text.substring(0, start),
      middle: text.substring(start, end + 1),
      suffix: text.substring(end + 1),
    });
  }, [text, highlightedSubstring]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    processHighlighting();
  }, [processHighlighting]);

  return (
    <div className="relative w-full bg-charcoal">
      <div className="w-full h-8 mx-auto max-w-7xl px-4 md:h-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="whitespace-nowrap text-center text-xs leading-loose text-white uppercase">
            {previewText.prefix}
            <Link
              link={target}
              className="underline underline-offset-2"
            >
              {previewText.middle}
            </Link>
            {previewText.suffix}
          </p>
        </div>

        <div className="flex size-full items-center justify-end">
          <ShippingAndLanguageSection desktopDirection="right" />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
