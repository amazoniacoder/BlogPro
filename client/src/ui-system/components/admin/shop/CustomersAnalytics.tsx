import React, { useState, useEffect } from 'react';
import { Icon } from '../../../icons/components';

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

export const CustomersAnalytics: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    // Skip API call - not implemented yet
    setCustomers([]);
    setLoading(false);
  };

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 1000) return { tier: 'VIP', class: 'customers-table__tier--vip' };
    if (totalSpent >= 500) return { tier: 'Gold', class: 'customers-table__tier--gold' };
    if (totalSpent >= 100) return { tier: 'Silver', class: 'customers-table__tier--silver' };
    return { tier: 'Bronze', class: 'customers-table__tier--bronze' };
  };

  return (
    <div className="customers-analytics">
      <div className="customers-analytics__header">
        <h1 className="customers-analytics__title">Customer Analytics</h1>
      </div>

      {loading ? (
        <div className="customers-analytics__loading">Loading customers...</div>
      ) : (
        <div className="customers-table">
          <div className="customers-table__header">
            <div className="customers-table__header-cell">Customer</div>
            <div className="customers-table__header-cell">Email</div>
            <div className="customers-table__header-cell">Orders</div>
            <div className="customers-table__header-cell">Total Spent</div>
            <div className="customers-table__header-cell">Tier</div>
            <div className="customers-table__header-cell">Member Since</div>
          </div>

          {customers && customers.length > 0 && customers.map((customer) => {
            const tierInfo = getCustomerTier(customer.totalSpent);
            
            return (
              <div key={customer.id} className="customers-table__row">
                <div className="customers-table__cell">
                  <div className="customers-table__customer-info">
                    <div className="customers-table__customer-avatar">
                      <Icon name="user" size={20} />
                    </div>
                    <div className="customers-table__customer-name">
                      {customer.firstName} {customer.lastName}
                    </div>
                  </div>
                </div>
                
                <div className="customers-table__cell">
                  {customer.email}
                </div>
                
                <div className="customers-table__cell">
                  <span className="customers-table__order-count">
                    {customer.orderCount}
                  </span>
                </div>
                
                <div className="customers-table__cell">
                  <span className="customers-table__total-spent">
                    ${customer.totalSpent}
                  </span>
                </div>
                
                <div className="customers-table__cell">
                  <span className={`customers-table__tier ${tierInfo.class}`}>
                    {tierInfo.tier}
                  </span>
                </div>
                
                <div className="customers-table__cell">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}

          {(!customers || customers.length === 0) && !loading && (
            <div className="customers-table__empty">
              <Icon name="users" size={48} />
              <p>No customers found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
