import React, { useState } from 'react';
import { FormField, Input } from '../../form';
import { Button } from '../../button';
import { useCheckout } from '../../../../store/checkout-context';

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  comments: string;
}

export const ShippingForm: React.FC = () => {
  const { customerInfo, updateCustomerInfo, nextStep } = useCheckout();
  
  const [formData, setFormData] = useState<CustomerInfo>(() => {
    return {
      firstName: customerInfo.firstName || '',
      lastName: customerInfo.lastName || '',
      email: customerInfo.email || '',
      phone: customerInfo.phone || '',
      comments: customerInfo.comments || ''
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateCustomerInfo(formData);
      nextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="shipping-form">
      <div className="shipping-form__header">
        <h2 className="shipping-form__title">Customer Information</h2>
      </div>

      <div className="shipping-form__fields">
        <div className="shipping-form__row">
          <FormField label="First Name" error={errors.firstName} required>
            <Input
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
            />
          </FormField>

          <FormField label="Last Name" error={errors.lastName}>
            <Input
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
            />
          </FormField>
        </div>

        <FormField label="Email Address" error={errors.email} required>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
          />
        </FormField>

        <FormField label="Phone Number" error={errors.phone}>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Phone number (optional)"
          />
        </FormField>

        <FormField label="Order Comments" error={errors.comments}>
          <Input
            value={formData.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            placeholder="Special instructions or comments (optional)"
          />
        </FormField>
      </div>

      <div className="shipping-form__actions">
        <Button type="submit" variant="primary" size="lg">
          Continue to Payment
        </Button>
      </div>
    </form>
  );
};
