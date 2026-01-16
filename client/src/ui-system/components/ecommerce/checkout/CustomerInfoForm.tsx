/**
 * BlogPro Customer Info Form Component
 * Customer information form for checkout process
 */

import React, { useEffect } from 'react';
import { Input, Textarea, FormField } from '../../form';
import { useAuth } from '../../../../store/auth-context';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  comments: string;
}

export interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onChange: (info: CustomerInfo) => void;
  errors?: Partial<CustomerInfo>;
}

export const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerInfo,
  onChange,
  errors = {}
}) => {
  const { user, isAuthenticated } = useAuth();

  // Auto-populate user data when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      onChange({
        ...customerInfo,
        firstName: user.firstName || user.username || customerInfo.firstName,
        lastName: user.lastName || customerInfo.lastName,
        email: user.email || customerInfo.email,
        phone: (user as any).phone || customerInfo.phone
      });
    }
  }, [isAuthenticated, user]);

  const handleChange = (field: keyof CustomerInfo, value: string) => {
    onChange({
      ...customerInfo,
      [field]: value
    });
  };

  return (
    <div className="checkout-customer-info">
      <h3 className="checkout-customer-info__title">Customer Information</h3>
      
      <div className="checkout-customer-info__name-row">
        <FormField label="First Name" required error={errors.firstName}>
          <Input
            value={customerInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
            className="checkout-customer-info__first-name"
          />
        </FormField>
        <FormField label="Last Name" error={errors.lastName}>
          <Input
            value={customerInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="checkout-customer-info__last-name"
          />
        </FormField>
      </div>
      
      <div className="checkout-customer-info__contact-row">
        <FormField label="Email Address" required error={errors.email}>
          <Input
            type="email"
            value={customerInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            className="checkout-customer-info__email"
          />
        </FormField>
        <FormField label="Phone Number" error={errors.phone}>
          <Input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="checkout-customer-info__phone"
          />
        </FormField>
      </div>
      
      <FormField label="Order Comments" className="checkout-customer-info__comments">
        <Textarea
          value={customerInfo.comments}
          onChange={(e) => handleChange('comments', e.target.value)}
          placeholder="Special instructions, requirements, or questions about your order..."
          rows={4}
          className="checkout-customer-info__comments-field"
        />
      </FormField>
    </div>
  );
};

export default CustomerInfoForm;