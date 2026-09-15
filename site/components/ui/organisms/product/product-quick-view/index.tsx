'use client';

import { FC, useRef, useState, useSyncExternalStore } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'use-intl';
import Modal from '@/components/ui/organisms/modal';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import useScrollBlock from '@/hooks/useScrollBlock';
import { Cart, ShippingMethod } from '@/types/entity/cart';
import ProductDetailsAdapter from '../product-details/helpers/adapter';
import type { Product, Variant } from '@/lib/types';

const subscribeToHydration = () => () => {};

export type QuickViewProps = {
  buttonIsEnabled: boolean;
  product: Product;
  cart?: Cart;
  shippingMethods?: ShippingMethod[];
  onAddToCart?: (variant: Variant, quantity: number) => Promise<void>;
};

const QuickView: FC<QuickViewProps> = ({
  cart,
  shippingMethods,
  product,
  onAddToCart,
  buttonIsEnabled,
}) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const hasHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);

  const { blockScroll } = useScrollBlock();

  const ref = useRef<HTMLDivElement>(null);

  const translate = useTranslations();

  const openModal = () => {
    setIsOpen(true);
    blockScroll(true);
  };

  const closeModal = (shouldRevertScroll: boolean) => {
    setIsOpen(false);
    blockScroll(shouldRevertScroll ? false : true);
  };

  useOnClickOutside(ref, () => closeModal(true));

  if (!buttonIsEnabled || !hasHydrated) {
    return null;
  }

  return (
    <>
      {!modalIsOpen && (
        <button
          role='button'
          className="hidden w-full border border-neutral-400 bg-white py-4 text-center text-xs capitalize leading-1 transition duration-150 ease-out hover:border-primary group-focus-within:block group-hover:block"
          onClick={openModal}
        >
          {translate('product.quick-view')}
        </button>
      )}

      <Modal
        shouldCloseOnOverlayClick
        isOpen={modalIsOpen}
        contentLabel={translate('product.quick-view')}
        onRequestClose={() => closeModal(true)}
        preventScroll={false}
        style={{ content: { backgroundColor: 'white' } }}
      >
        <div ref={ref}>
          <button onClick={() => closeModal(true)}>
            <XMarkIcon
              className="absolute right-4 top-4 size-6 hover:cursor-pointer"
              strokeWidth={1}
              color="#494949"
            />
          </button>

          <ProductDetailsAdapter
            product={product}
            cart={cart}
            shippingMethods={shippingMethods}
            categories={[]}
            inModalVersion={true}
            setIsOpen={setIsOpen}
            onAddToCart={async (variant, quantity) => {
              await onAddToCart?.(variant, quantity);
              closeModal(false);
            }}
          />
        </div>
      </Modal>
    </>
  );
};

export default QuickView;
