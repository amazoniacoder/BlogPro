import React from 'react';
import { Icon } from '../../../icons/components';

export const SecurityBadges: React.FC = () => {
  return (
    <div className="security-badges">
      <div className="security-badges__title">
        <Icon name="check" size={16} />
        <span>Secure Payment</span>
      </div>
      
      <div className="security-badges__list">
        <div className="security-badges__badge">
          <Icon name="gear" size={14} />
          <span>SSL Encrypted</span>
        </div>
        
        <div className="security-badges__badge">
          <Icon name="check" size={14} />
          <span>PCI Compliant</span>
        </div>
        
        <div className="security-badges__badge">
          <Icon name="gear" size={14} />
          <span>256-bit Security</span>
        </div>
      </div>
      
      <div className="security-badges__note">
        Your payment information is encrypted and secure
      </div>
    </div>
  );
};
