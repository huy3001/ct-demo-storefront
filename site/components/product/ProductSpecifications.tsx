'use client';

import {
  formatAttributeValue,
  humanizeAttributeName,
} from '@/lib/product-attributes';
import { useProductVariant } from '@/components/product/ProductVariantProvider';
import { isColorCodeFacet } from '@/lib/search-filters';
import Accordion from '@/components/ui/atoms/accordion';

export default function ProductSpecifications({
  locale,
  labels,
}: {
  locale: string;
  labels: Record<string, string>;
}) {
  const { matchingVariant: variant } = useProductVariant();

  if (!variant) return null;
  if (variant.attributes.length === 0 && !variant.sku) return null;

  const filteredAttributes = variant.attributes.filter(
    (attribute) => !isColorCodeFacet(attribute.name),
  );

  if (filteredAttributes.length === 0) return null;

  return (
    <Accordion
      variant="arrow"
      closedSectionTitle="Product specifications"
      openSectionTitle="Product specifications"
      className="border-y border-border"
      buttonClassName="font-medium text-charcoal py-5"
      panelClassName="pb-5 text-sm text-charcoal-light"
    >
      {variant.sku && (
        <div className="grid grid-cols-[minmax(110px,0.8fr)_1.2fr] gap-4 border-t border-border py-3">
          <dt className="text-charcoal-light">SKU</dt>
          <dd className="text-charcoal">{variant.sku}</dd>
        </div>
      )}
      {filteredAttributes.map((attribute) => (
        <div
          key={attribute.name}
          className="grid grid-cols-[minmax(110px,0.8fr)_1.2fr] gap-4 border-t border-border py-3"
        >
          <dt className="text-charcoal-light">
            {labels[attribute.name] ?? humanizeAttributeName(attribute.name)}
          </dt>
          <dd className="wrap-break-word text-charcoal">
            {formatAttributeValue(attribute.value, locale)}
          </dd>
        </div>
      ))}
    </Accordion>
  );
}
