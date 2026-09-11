import { FC, useCallback, useMemo } from 'react';
import { Variant as VariantType } from '@/lib/types';
import { useTranslations } from 'use-intl';
import useClassNames from '@/hooks/useClassNames';
import { textToColor } from '@/helpers/textToColor/textToColor';
import { discardRepeatedValues } from '../helpers/discardRepeatedValues';
import { filterAttributeBasedVariants } from '../helpers/filterAttributeBasedVariants';

type ProductVariantProps = {
  className?: string;
  currentVariant: VariantType;
  variants: VariantType[];
  attribute: string;
  inModalVersion?: boolean;
  onClick?: (sku: string) => void;
};

type UnknownAttributes = Record<string, string>;

const ProductVariant: FC<ProductVariantProps> = ({
  className,
  currentVariant,
  variants,
  attribute,
  inModalVersion,
  onClick,
}) => {
  const translate = useTranslations();

  const attributeString = attribute.toString();

  const attributeToFilterTo = attribute == 'size' ? 'color' : 'size';

  const sortVariantsCmp = useCallback(
    (a: VariantType, b: VariantType) => {
      const first = (a.attributes as unknown as UnknownAttributes)?.[attribute];
      const second = (b.attributes as unknown as UnknownAttributes)?.[attribute];

      if (!first || !second) return 0;

      if (first > second) return 1;
      if (first < second) return -1;
      return 0;
    },
    [attribute],
  );
  const variantsToUse: VariantType[] = useMemo(() => {
    const result = (currentVariant.attributes as unknown as UnknownAttributes)?.['size']
      ? filterAttributeBasedVariants(variants, currentVariant, attributeToFilterTo)
      : discardRepeatedValues(variants, attribute.toString());

    result.sort(sortVariantsCmp);

    return result;
  }, [attribute, attributeToFilterTo, currentVariant, variants, sortVariantsCmp]);

  const hoverEffectClassName = useMemo(
    () => (variantsToUse && variantsToUse.length > 1 ? 'cursor-pointer' : 'cursor-default'),
    [variantsToUse],
  );

  const getVariantClassName = (id: VariantType['id']) =>
    `${id == currentVariant.id ? 'border-2 border-neutral-500' : 'border-2 border-neutral-300'} ${
      attribute === 'size' ? sizeVariantClassname : defaultVariantClassName
    } `;

  const labelClassName = useClassNames([
    'capitalize leading-loose font-medium',
    inModalVersion ? 'text-xs' : 'text-sm',
  ]);
  const defaultVariantClassName = useClassNames(['h-5 w-5 rounded-full', hoverEffectClassName]);
  const sizeVariantClassname = useClassNames(['text-sm p-3', hoverEffectClassName]);
  const variantContainerClassName = useClassNames(['mt-4 flex', attribute == 'size' ? 'gap-3' : 'gap-6']);

  const getButtonDescriptiveTitle = useCallback(
    (attributes: Record<string, string>) => {
      switch (attribute) {
        case 'color':
          return translate('product.switch-to-color', { color: attributes[attribute].split(':')[0] });
        case 'finish':
          return translate('product.switch-to-finish', { color: attributes[attribute].split(':')[0] });
        case 'size':
          return translate('product.switch-to-size', { size: attributes[attribute] });
        default:
          return translate('product.switch-to', {
            term: (attributes[attribute] as unknown as { label: string }).label ?? attributes[attribute],
          });
      }
    },
    [attribute, translate],
  );

  return (
    <div className={className}>
      <div className={attribute == 'color' ? 'mt-1 grid gap-1' : ''}>
        <h3 className={labelClassName}>
          {
            translate(`product.${attributeString}`)
          }
        </h3>
        <p className="text-sm leading-loose">
          {(currentVariant?.attributes as unknown as UnknownAttributes)?.[`${attribute}label`] ??
            textToColor((currentVariant?.attributes as unknown as UnknownAttributes)?.[attribute]).label}
        </p>
      </div>

      <div className={variantContainerClassName}>
        {(variantsToUse ?? []).map(({ attributes, id, sku }) => {
          const attributeCodeLabel = attribute.split('-').length === 2 ? `${attribute.split('-')[0]}-code` : '';

          const backgroundColor = attributeCodeLabel
            ? (attributes as unknown as UnknownAttributes)?.[attributeCodeLabel]
            : textToColor((attributes as unknown as UnknownAttributes)?.[attribute]).code;

          return (
            <button
              key={id}
              title={getButtonDescriptiveTitle(
                attributes as unknown as UnknownAttributes,
              )}
              onClick={() => onClick?.(sku)}
              className={getVariantClassName(id)}
              style={attribute !== 'size' ? { backgroundColor } : {}}
            >
              {attribute == 'size' && (attributes as unknown as UnknownAttributes)?.[attribute]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVariant;
