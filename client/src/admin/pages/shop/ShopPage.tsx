import React, { useState } from 'react';
import { ShopNavigation } from './ShopNavigation';
import {
  ShopDashboardPage,
  OrdersPage,
  InventoryPage,
  PaymentsPage,
  CustomersPage,
  ShopSettingsPage
} from './index';

const ShopPage: React.FC = () => {
  const [activePath, setActivePath] = useState('/admin/shop/dashboard');

  const renderContent = () => {
    switch (activePath) {
      case '/admin/shop/dashboard':
        return <ShopDashboardPage />;
      case '/admin/shop/orders':
        return <OrdersPage />;
      case '/admin/shop/inventory':
        return <InventoryPage />;
      case '/admin/shop/payments':
        return <PaymentsPage />;
      case '/admin/shop/customers':
        return <CustomersPage />;
      case '/admin/shop/settings':
        return <ShopSettingsPage />;
      default:
        return <ShopDashboardPage />;
    }
  };

  return (
    <div className="admin-page">
      <div className="shop-layout">
        <div className="shop-layout__sidebar">
          <ShopNavigation activePath={activePath} onNavigate={setActivePath} />
        </div>
        
        <div className="shop-layout__content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
