import React, { useState } from 'react';
import { OrderHistory, SavedAddresses, Wishlist } from '../ui-system/components/ecommerce/advanced';
import { Icon } from '../ui-system/icons/components';

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { id: 'orders', label: 'Order History', icon: 'file' as const },
    { id: 'addresses', label: 'Addresses', icon: 'house' as const },
    { id: 'wishlist', label: 'Wishlist', icon: 'heart' as const }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return <OrderHistory />;
      case 'addresses':
        return <SavedAddresses />;
      case 'wishlist':
        return <Wishlist />;
      default:
        return <OrderHistory />;
    }
  };

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-page__header">
          <h1 className="account-page__title">My Account</h1>
        </div>

        <div className="account-page__content">
          <div className="account-page__sidebar">
            <nav className="account-page__nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`account-page__nav-item ${
                    activeTab === tab.id ? 'account-page__nav-item--active' : ''
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="account-page__main">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
