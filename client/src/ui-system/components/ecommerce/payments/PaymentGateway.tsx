import React, { useState } from 'react';
import { StripePayment } from './StripePayment';
import { PayPalPayment } from './PayPalPayment';
import { YandexPayment } from './YandexPayment';
import { SecurityBadges } from './SecurityBadges';

interface PaymentGatewayProps {
  selectedMethod: string;
  amount: number;
  onPaymentComplete: (paymentData: any) => Promise<void>;
  loading?: boolean;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  selectedMethod,
  amount,
  onPaymentComplete,
  loading = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      setIsProcessing(true);
      await onPaymentComplete(paymentData);
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'stripe_card':
        return (
          <StripePayment
            onPaymentSubmit={handlePaymentSubmit}
            loading={loading || isProcessing}
          />
        );
      case 'paypal':
        return (
          <PayPalPayment
            onPaymentSubmit={handlePaymentSubmit}
            loading={loading || isProcessing}
            amount={amount}
          />
        );
      case 'yandex_money':
        return (
          <YandexPayment
            onPaymentSubmit={handlePaymentSubmit}
            loading={loading || isProcessing}
            amount={amount}
          />
        );
      default:
        return (
          <div className="payment-gateway__no-method">
            <p>Please select a payment method to continue</p>
          </div>
        );
    }
  };

  return (
    <div className="payment-gateway">
      <div className="payment-gateway__form">
        {renderPaymentForm()}
      </div>
      
      <div className="payment-gateway__security">
        <SecurityBadges />
      </div>
    </div>
  );
};
