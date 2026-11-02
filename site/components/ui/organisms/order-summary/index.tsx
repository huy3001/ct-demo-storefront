import { classnames } from '@/helpers/utils/classnames';
import LoginSuggestion from './components/login-suggestion';
import SummaryAccordion from './components/summary-accordion';
import { OrderSummaryProps } from './types';
import OrderPaymentSection from '../order-payment-section';
import { useAccount } from '@/hooks/useAccount';

const OrderSummary = ({
  title,
  cart,
  className,
  includeLoginSuggestion,
  includeSummaryAccordion,
  paymentMethods,
  discounts,
  onRemoveDiscountCode,
  login,
  requestConfirmationEmail,
  requestPasswordReset,
  ...props
}: OrderSummaryProps) => {
  const { isSignedIn } = useAccount();

  return (
    <div
      className={classnames('rounded-sm bg-white px-5 py-6 md:px-6', className)}
    >
      {(title || includeLoginSuggestion) && (
        <div>
          {title && <p className="text-lg font-semibold">{title}</p>}

          {includeLoginSuggestion && !isSignedIn && (
            <LoginSuggestion
              login={login}
              requestConfirmationEmail={requestConfirmationEmail}
              requestPasswordReset={requestPasswordReset}
            />
          )}
        </div>
      )}

      {includeSummaryAccordion && (
        <SummaryAccordion
          order={props.order}
          cart={cart}
        />
      )}

      <OrderPaymentSection
        discounts={discounts}
        onRemoveDiscountCode={onRemoveDiscountCode}
        classNames={{
          applyDiscountButton: classnames({
            'mt-4': !includeSummaryAccordion,
          }),
          totalAmount: 'text-lg',
          subCostsContainer:
            'pt-3 md:pt-4 mb-5 lg:py-6 lg:mb-4 lg:border-b border-neutral-400',
        }}
        paymentMethods={paymentMethods}
        {...props}
      />
    </div>
  );
};

export default OrderSummary;
