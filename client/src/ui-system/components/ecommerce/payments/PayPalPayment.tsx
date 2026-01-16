import React, { useState } from 'react';
import { Button } from '../../button';
import { Icon } from '../../../icons/components';

interface PayPalPaymentProps {
  onPaymentSubmit: (paymentData: any) => Promise<void>;
  loading?: boolean;
  amount: number;
}

export const PayPalPayment: React.FC<PayPalPaymentProps> = ({ 
  onPaymentSubmit, 
  loading = false,
  amount 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Simulate PayPal integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await onPaymentSubmit({
        type: 'paypal',
        paypalData: {
          amount,
          currency: 'USD'
        }
      });
    } catch (error) {
      console.error('PayPal payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="paypal-payment">
      <div className="paypal-payment__header">
        <div className="paypal-payment__title">
          <Icon name="credit-card" size={20} />
          <span>PayPal</span>
        </div>
        <div className="paypal-payment__logo">
          PayPal
        </div>
      </div>

      <div className="paypal-payment__content">
        <div className="paypal-payment__info">
          <Icon name="info" size={16} />
          <span>You will be redirected to PayPal to complete your payment</span>
        </div>

        <div className="paypal-payment__amount">
          <span className="paypal-payment__amount-label">Total Amount:</span>
          <span className="paypal-payment__amount-value">${amount.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={handlePayPalPayment}
        variant="primary"
        size="lg"
        disabled={loading || isProcessing}
        className="paypal-payment__submit"
      >
        {isProcessing ? (
          <>
            <Icon name="refresh" size={16} />
            Connecting to PayPal...
          </>
        ) : (
          <>
            <Icon name="arrow-right" size={16} />
            Continue with PayPal
          </>
        )}
      </Button>
    </div>
  );
};
