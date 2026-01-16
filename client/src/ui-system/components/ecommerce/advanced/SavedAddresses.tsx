import React, { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Icon } from '../../../icons/components';

interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const SavedAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      // Simulate API call - in real implementation, fetch from user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAddresses([
        {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = (index: number) => {
    setAddresses(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="saved-addresses saved-addresses--loading">
        <Icon name="refresh" size={24} />
        <span>Loading addresses...</span>
      </div>
    );
  }

  return (
    <div className="saved-addresses">
      <div className="saved-addresses__header">
        <h2 className="saved-addresses__title">Saved Addresses</h2>
        <Button variant="primary" size="sm">
          <Icon name="add" size={16} />
          Add Address
        </Button>
      </div>

      <div className="saved-addresses__list">
        {addresses.map((address, index) => (
          <div key={index} className="saved-addresses__item">
            <div className="saved-addresses__content">
              <div className="saved-addresses__name">
                {address.firstName} {address.lastName}
              </div>
              <div className="saved-addresses__address">
                {address.address1}
                {address.address2 && <br />}
                {address.address2}
                <br />
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.country}
              </div>
            </div>
            
            <div className="saved-addresses__actions">
              <Button variant="secondary" size="sm">
                <Icon name="edit" size={14} />
                Edit
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => handleDeleteAddress(index)}
              >
                <Icon name="delete" size={14} />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="saved-addresses__empty">
          <Icon name="house" size={48} />
          <h3>No saved addresses</h3>
          <p>Add an address to make checkout faster.</p>
        </div>
      )}
    </div>
  );
};
