import React from 'react';
import { Button } from '../../button';
import { PaymentMethods } from './PaymentMethods';
import { PaymentGateway } from '../payments';
import { useCheckout } from '../../../../store/checkout-context';
import { useCart } from '../../../../store/cart-context';

export const PaymentForm: React.FC = () => {
  const { paymentMethod, updatePayment, nextStep, prevStep } = useCheckout();
  const { totalAmount } = useCart();

  const handleMethodSelect = (methodId: string) => {
    updatePayment(methodId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod) {
      nextStep();
    }
  };

  const handlePaymentComplete = async (paymentData: any) => {
    console.log('Payment completed:', paymentData);
    // Payment will be processed in OrderSummary step
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-form__header">
        <h2 className="payment-form__title">Payment Method</h2>
      </div>

      <div className="payment-form__content">
        <PaymentMethods
          selectedMethod={paymentMethod}
          onMethodSelect={handleMethodSelect}
        />
        
        {paymentMethod && (
          <div className="payment-form__gateway">
            <PaymentGateway
              selectedMethod={paymentMethod}
              amount={totalAmount}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        )}
      </div>

      <div className="payment-form__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={prevStep}
        >
          Back to Shipping
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          disabled={!paymentMethod}
        >
          Review Order
        </Button>
      </div>
    </form>
  );
};
