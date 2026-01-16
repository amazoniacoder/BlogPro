import React, { useState } from 'react';
import { CheckoutSteps } from './CheckoutSteps';
import { ShippingForm } from './ShippingForm';
import { PaymentForm } from './PaymentForm';
import { OrderSummary } from './OrderSummary';
import { OrderConfirmation } from './OrderConfirmation';
import { useCheckout } from '../../../../store/checkout-context';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export const Checkout: React.FC = () => {
  const { currentStep } = useCheckout();
  const [completedOrder] = useState<Order | null>(null);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ShippingForm />;
      case 2:
        return <PaymentForm />;
      case 3:
        return <OrderSummary />;
      case 4:
        return <OrderConfirmation order={completedOrder || undefined} />;
      default:
        return <ShippingForm />;
    }
  };

  return (
    <div className="checkout">
      <div className="checkout__container">
        <div className="checkout__header">
          <h1 className="checkout__title">Checkout</h1>
          <CheckoutSteps currentStep={currentStep} />
        </div>

        <div className="checkout__content">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};
