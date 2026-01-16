// E-commerce Payment Types

export type PaymentGateway = 'stripe' | 'paypal' | 'yandex' | 'sberbank' | 'qiwi';
export type PaymentMethodType = 'card' | 'wallet' | 'bank_transfer' | 'cash_on_delivery';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  gateway: PaymentGateway;
  name: string;
  description: string;
  enabled: boolean;
  supportedCurrencies: string[];
  icon?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  transactionId: string;
  paymentMethod: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gatewayResponse: Record<string, any>;
  createdAt: Date;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface PaymentConfirmation {
  success: boolean;
  transactionId: string;
  orderId: string;
  message?: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';