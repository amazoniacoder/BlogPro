import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useCart } from './cart-context';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  comments: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customerInfo: CustomerInfo;
  paymentMethod: string;
  createdAt: string;
}

interface CheckoutContextType {
  currentStep: number;
  customerInfo: CustomerInfo;
  paymentMethod: string;
  nextStep: () => void;
  prevStep: () => void;
  updateCustomerInfo: (info: CustomerInfo) => void;
  updatePayment: (method: string) => void;
  submitOrder: () => Promise<Order>;
  loading: boolean;
  error: string | null;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    comments: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { clearCart } = useCart();

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfo(info);
  };

  const updatePayment = (method: string) => {
    setPaymentMethod(method);
  };

  const submitOrder = async (): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Create order
      const orderData = {
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        notes: customerInfo.comments,
        paymentMethod
      };

      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const { order } = await orderResponse.json();
      
      // Step 2: Process dummy payment
      const paymentResponse = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod,
          // Dummy payment data
          paymentData: {
            cardNumber: '****-****-****-1234',
            amount: order.total_amount
          }
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment processing failed');
      }

      await paymentResponse.json();
      
      // Clear cart after successful payment
      await clearCart();
      
      // Move to confirmation step
      setCurrentStep(3);
      
      return {
        ...order,
        status: 'confirmed',
        paymentStatus: 'completed',
        customerInfo
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process order';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckoutContext.Provider value={{
      currentStep,
      customerInfo,
      paymentMethod,
      nextStep,
      prevStep,
      updateCustomerInfo,
      updatePayment,
      submitOrder,
      loading,
      error
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
