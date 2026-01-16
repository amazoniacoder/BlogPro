import React, { useState, useEffect } from 'react';
import { Icon } from '../../../icons/components';

interface PaymentMethod {
  id: string;
  type: string;
  gateway: string;
  name: string;
  description: string;
  enabled: boolean;
  supportedCurrencies: string[];
  icon: 'credit-card' | 'paypal' | 'wallet';
}

interface PaymentMethodsProps {
  selectedMethod: string;
  onMethodSelect: (methodId: string) => void;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedMethod,
  onMethodSelect
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payments/methods');
      if (response.ok) {
        const data = await response.json();
        setMethods(data);
      } else {
        // Fallback to default methods if API fails
        setMethods([
          {
            id: 'stripe_card',
            type: 'card',
            gateway: 'stripe',
            name: 'Credit/Debit Card',
            description: 'Visa, MasterCard, American Express',
            enabled: true,
            supportedCurrencies: ['USD', 'EUR', 'RUB'],
            icon: 'credit-card'
          },
          {
            id: 'paypal',
            type: 'wallet',
            gateway: 'paypal',
            name: 'PayPal',
            description: 'Pay with your PayPal account',
            enabled: true,
            supportedCurrencies: ['USD', 'EUR'],
            icon: 'credit-card'
          },
          {
            id: 'yandex_money',
            type: 'wallet',
            gateway: 'yandex',
            name: 'YooMoney',
            description: 'Yandex.Money wallet and bank cards',
            enabled: true,
            supportedCurrencies: ['RUB'],
            icon: 'credit-card'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      // Set default methods on error
      setMethods([
        {
          id: 'stripe_card',
          type: 'card',
          gateway: 'stripe',
          name: 'Credit/Debit Card',
          description: 'Visa, MasterCard, American Express',
          enabled: true,
          supportedCurrencies: ['USD', 'EUR', 'RUB'],
          icon: 'credit-card'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-methods payment-methods--loading">
        <Icon name="refresh" size={24} />
        <span>Loading payment methods...</span>
      </div>
    );
  }

  return (
    <div className="payment-methods">
      <h3 className="payment-methods__title">Select Payment Method</h3>
      
      <div className="payment-methods__list">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`payment-methods__option ${
              selectedMethod === method.id ? 'payment-methods__option--selected' : ''
            } ${
              !method.enabled ? 'payment-methods__option--disabled' : ''
            }`}
            onClick={() => method.enabled && onMethodSelect(method.id)}
          >
            <div className="payment-methods__option-icon">
              <Icon name={method.icon as 'credit-card'} size={24} />
            </div>
            
            <div className="payment-methods__option-content">
              <div className="payment-methods__option-name">{method.name}</div>
              <div className="payment-methods__option-description">{method.description}</div>
            </div>

            <div className="payment-methods__option-radio">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => onMethodSelect(method.id)}
                disabled={!method.enabled}
              />
            </div>
          </div>
        ))}
      </div>

      {methods.length === 0 && (
        <div className="payment-methods__empty">
          <Icon name="credit-card" size={48} />
          <p>No payment methods available</p>
        </div>
      )}
    </div>
  );
};
