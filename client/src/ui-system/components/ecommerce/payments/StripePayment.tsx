import React, { useState } from 'react';
import { FormField, Input } from '../../form';
import { Button } from '../../button';
import { Icon } from '../../../icons/components';

interface StripePaymentProps {
  onPaymentSubmit: (paymentData: any) => Promise<void>;
  loading?: boolean;
}

export const StripePayment: React.FC<StripePaymentProps> = ({ 
  onPaymentSubmit, 
  loading = false 
}) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cardData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!cardData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date (MM/YY)';
    }

    if (!cardData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cardData.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!cardData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      await onPaymentSubmit({
        type: 'stripe',
        cardData: {
          ...cardData,
          cardNumber: cardData.cardNumber.replace(/\s/g, '')
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment">
      <div className="stripe-payment__header">
        <div className="stripe-payment__title">
          <Icon name="credit-card" size={20} />
          <span>Credit/Debit Card</span>
        </div>
        <div className="stripe-payment__logos">
          <span className="stripe-payment__logo">VISA</span>
          <span className="stripe-payment__logo">MC</span>
          <span className="stripe-payment__logo">AMEX</span>
        </div>
      </div>

      <div className="stripe-payment__fields">
        <FormField label="Cardholder Name" error={errors.cardholderName} required>
          <Input
            value={cardData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            placeholder="John Doe"
            disabled={loading}
          />
        </FormField>

        <FormField label="Card Number" error={errors.cardNumber} required>
          <Input
            value={cardData.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            disabled={loading}
          />
        </FormField>

        <div className="stripe-payment__row">
          <FormField label="Expiry Date" error={errors.expiryDate} required>
            <Input
              value={cardData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              disabled={loading}
            />
          </FormField>

          <FormField label="CVV" error={errors.cvv} required>
            <Input
              type="password"
              value={cardData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
              placeholder="123"
              maxLength={4}
              disabled={loading}
            />
          </FormField>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading}
        className="stripe-payment__submit"
      >
        {loading ? (
          <>
            <Icon name="refresh" size={16} />
            Processing...
          </>
        ) : (
          <>
            <Icon name="check" size={16} />
            Pay Securely
          </>
        )}
      </Button>
    </form>
  );
};
