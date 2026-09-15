import { FC, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Variant as VariantType } from '@/lib/types';
import { useTranslations } from 'use-intl';
import useClassNames from '@/hooks/useClassNames';
import { textToColor } from '@/helpers/textToColor/textToColor';
import { discardRepeatedValues } from '../helpers/discardRepeatedValues';
import { filterAttributeBasedVariants } from '../helpers/filterAttributeBasedVariants';
import { getLocalizedString } from '@/lib/utils';
import type { Attribute } from '@commercetools/platform-sdk';

type ProductVariantProps = {
  className?: string;
  currentVariant: VariantType;
  variants: VariantType[];
  attribute: string;
  inModalVersion?: boolean;
  onClick?: (sku: string) => void;
};

const ProductVariant: FC<ProductVariantProps> = ({
  className,
  currentVariant,
  variants,
  attribute,
  inModalVersion,
  onClick,
}) => {
  const translate = useTranslations();

  const { locale } = useParams();

  const attributeString = attribute.toString();

  const attributeToFilterTo = attribute == 'size' ? 'color' : 'size';

  const getCurrentAttribute = useCallback(
    (attributes: Attribute[], attributeName?: string) => {
      return attributes.find(
        ({ name }) => name === (attributeName ?? attribute),
      );
    },
    [attribute],
  );

  const sortVariantsCmp = useCallback(
    (a: VariantType, b: VariantType) => {
      const first = getCurrentAttribute(a.attributes)?.name;
      const second = getCurrentAttribute(b.attributes)?.name;

      if (!first || !second) return 0;

      if (first > second) return 1;
      if (first < second) return -1;
      return 0;
    },
    [getCurrentAttribute],
  );
  const variantsToUse: VariantType[] = useMemo(() => {
    const result = currentVariant.attributes.find(({ name }) => name === 'size')
      ? filterAttributeBasedVariants(
          variants,
          currentVariant,
          attributeToFilterTo,
        )
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
    (attributes: Attribute[]) => {
      switch (attribute) {
        case 'color':
          return translate('product.switch-to-color', {
            color: getCurrentAttribute(attributes)?.value,
          });
        case 'finish':
          return translate('product.switch-to-finish', {
            color: getCurrentAttribute(attributes)?.value,
          });
        case 'size':
          return translate('product.switch-to-size', {
            size: getCurrentAttribute(attributes)?.value,
          });
        default:
          return translate('product.switch-to', {
            term:
              getCurrentAttribute(attributes)?.name ??
              getCurrentAttribute(attributes)?.value,
          });
      }
    },
    [attribute, getCurrentAttribute, translate],
  );

  return (
    <div className={className}>
      <div className={attribute == 'color' ? 'mt-1 grid gap-1' : ''}>
        <h3 className={labelClassName}>
          {translate(`product.${attributeString}`)}
        </h3>
        <p className="text-sm leading-loose">
          {getLocalizedString(
            getCurrentAttribute(currentVariant.attributes)?.value,
            locale,
          ) ??
            textToColor(
              getLocalizedString(
                getCurrentAttribute(currentVariant.attributes)?.value,
                locale ?? '',
              ),
            )}
        </p>
      </div>

      <div className={variantContainerClassName}>
        {(variantsToUse ?? []).map(({ attributes, id, sku }) => {
          const attributeCodeLabel =
            attribute.split('-').length === 2
              ? `${attribute.split('-')[0]}-code`
              : '';

          const attributeToUse = getCurrentAttribute(
            attributes,
            attributeCodeLabel,
          );

          const backgroundColor = attributeToUse?.value;

          return (
            <button
              key={id}
              title={getButtonDescriptiveTitle(attributes as Attribute[])}
              onClick={() => onClick?.(sku)}
              className={getVariantClassName(id)}
              style={attribute !== 'size' ? { backgroundColor } : {}}
            >
              {attribute == 'size' && getCurrentAttribute(attributes)?.value}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVariant;
