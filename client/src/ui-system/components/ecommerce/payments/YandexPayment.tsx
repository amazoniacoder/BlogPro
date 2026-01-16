import React, { useState } from 'react';
import { Button } from '../../button';
import { Icon } from '../../../icons/components';

interface YandexPaymentProps {
  onPaymentSubmit: (paymentData: any) => Promise<void>;
  loading?: boolean;
  amount: number;
}

export const YandexPayment: React.FC<YandexPaymentProps> = ({ 
  onPaymentSubmit, 
  loading = false,
  amount 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleYandexPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Simulate Yandex.Money integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await onPaymentSubmit({
        type: 'yandex',
        yandexData: {
          amount,
          currency: 'RUB'
        }
      });
    } catch (error) {
      console.error('Yandex payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="yandex-payment">
      <div className="yandex-payment__header">
        <div className="yandex-payment__title">
          <Icon name="credit-card" size={20} />
          <span>YooMoney (Yandex.Money)</span>
        </div>
        <div className="yandex-payment__logo">
          YooMoney
        </div>
      </div>

      <div className="yandex-payment__content">
        <div className="yandex-payment__info">
          <Icon name="info" size={16} />
          <span>Оплата через Яндекс.Деньги - банковские карты, электронные кошельки</span>
        </div>

        <div className="yandex-payment__methods">
          <div className="yandex-payment__method">
            <Icon name="credit-card" size={14} />
            <span>Банковские карты</span>
          </div>
          <div className="yandex-payment__method">
            <Icon name="credit-card" size={14} />
            <span>Яндекс.Деньги</span>
          </div>
          <div className="yandex-payment__method">
            <Icon name="credit-card" size={14} />
            <span>Интернет-банкинг</span>
          </div>
        </div>

        <div className="yandex-payment__amount">
          <span className="yandex-payment__amount-label">Сумма к оплате:</span>
          <span className="yandex-payment__amount-value">₽{amount.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={handleYandexPayment}
        variant="primary"
        size="lg"
        disabled={loading || isProcessing}
        className="yandex-payment__submit"
      >
        {isProcessing ? (
          <>
            <Icon name="refresh" size={16} />
            Подключение к Яндекс.Деньги...
          </>
        ) : (
          <>
            <Icon name="arrow-right" size={16} />
            Оплатить через Яндекс.Деньги
          </>
        )}
      </Button>
    </div>
  );
};
