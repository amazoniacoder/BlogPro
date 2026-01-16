import React from 'react';
import { Icon } from '../../../icons/components';

interface CheckoutStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: 'Shipping', icon: 'house' as const },
  { number: 2, title: 'Payment', icon: 'credit-card' as const },
  { number: 3, title: 'Review', icon: 'eye' as const },
  { number: 4, title: 'Confirmation', icon: 'check' as const }
];

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  return (
    <div className="checkout-steps">
      {steps.map((step, index) => (
        <div key={step.number} className="checkout-steps__step-container">
          <div 
            className={`checkout-steps__step ${
              currentStep >= step.number ? 'checkout-steps__step--active' : ''
            } ${
              currentStep > step.number ? 'checkout-steps__step--completed' : ''
            }`}
          >
            <div className="checkout-steps__step-icon">
              <Icon name={step.icon} size={16} />
            </div>
            <span className="checkout-steps__step-title">{step.title}</span>
          </div>
          
          {index < steps.length - 1 && (
            <div 
              className={`checkout-steps__connector ${
                currentStep > step.number ? 'checkout-steps__connector--completed' : ''
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};
