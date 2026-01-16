import React from 'react';
import { Checkout } from '../ui-system/components/ecommerce';
import { CheckoutProvider } from '../store/checkout-context';
import { CheckoutAuthGuard } from '../ui-system/components/ecommerce/checkout/CheckoutAuthGuard';

const CheckoutPage: React.FC = () => {
  return (
    <CheckoutAuthGuard>
      <CheckoutProvider>
        <div className="page">
          <div className="container">
            <Checkout />
          </div>
        </div>
      </CheckoutProvider>
    </CheckoutAuthGuard>
  );
};

export default CheckoutPage;
