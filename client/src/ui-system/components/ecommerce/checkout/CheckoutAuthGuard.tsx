import React from 'react';
import { useAuth } from '../../../../store/auth-context';
import { Button } from '../../button';
import { Icon } from '../../../icons/components';

interface CheckoutAuthGuardProps {
  children: React.ReactNode;
}

export const CheckoutAuthGuard: React.FC<CheckoutAuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="checkout-auth-guard checkout-auth-guard--loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="checkout-auth-guard">
        <div className="checkout-auth-prompt">
          <div className="checkout-auth-prompt__header">
            <div className="checkout-auth-prompt__icon">
              <Icon name="lock" size={48} />
            </div>
            <h2 className="checkout-auth-prompt__title">Login Required</h2>
            <p className="checkout-auth-prompt__subtitle">
              Please log in or create an account to complete your purchase
            </p>
          </div>
          
          <div className="checkout-auth-prompt__benefits">
            <h3>Benefits of creating an account:</h3>
            <ul>
              <li><Icon name="check" size={16} /> Faster checkout process</li>
              <li><Icon name="download" size={16} /> Instant digital product delivery</li>
              <li><Icon name="file" size={16} /> Order history and re-downloads</li>
              <li><Icon name="key" size={16} /> Automatic license management</li>
              <li><Icon name="star" size={16} /> Priority customer support</li>
            </ul>
          </div>
          
          <div className="checkout-auth-prompt__actions">
            <Button 
              href="/auth?mode=login&return=/checkout"
              className="checkout-auth-prompt__login"
            >
              Login to Continue
            </Button>
            <Button 
              variant="outline" 
              href="/auth?mode=register&return=/checkout"
              className="checkout-auth-prompt__register"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
