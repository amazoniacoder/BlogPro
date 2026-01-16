import React from 'react';
import {
  ShopDashboardPage,
  OrdersPage,
  InventoryPage,
  PaymentsPage,
  CustomersPage,
  ShopSettingsPage
} from './index';

interface ShopRouterProps {
  activePath: string;
}

const ShopRouter: React.FC<ShopRouterProps> = ({ activePath }) => {
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

export default ShopRouter;
