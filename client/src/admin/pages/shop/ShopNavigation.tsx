import React from 'react';
import { Icon } from '../../../ui-system/icons/components';

const shopMenuItems = [
  { path: '/admin/shop/dashboard', label: 'Dashboard', icon: 'chart' as const },
  { path: '/admin/shop/orders', label: 'Orders', icon: 'file' as const },
  { path: '/admin/shop/inventory', label: 'Inventory', icon: 'folder' as const },
  { path: '/admin/shop/payments', label: 'Payments', icon: 'credit-card' as const },
  { path: '/admin/shop/customers', label: 'Customers', icon: 'users' as const },
  { path: '/admin/shop/settings', label: 'Settings', icon: 'gear' as const }
];

interface ShopNavigationProps {
  activePath?: string;
  onNavigate?: (path: string) => void;
}

export const ShopNavigation: React.FC<ShopNavigationProps> = ({ 
  activePath = '/admin/shop/dashboard',
  onNavigate 
}) => {
  return (
    <nav className="shop-navigation">
      <div className="shop-navigation__header">
        <h2 className="shop-navigation__title">Shop Management</h2>
      </div>
      
      <ul className="shop-navigation__menu">
        {shopMenuItems.map((item) => (
          <li key={item.path} className="shop-navigation__item">
            <a
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.(item.path);
              }}
              className={`shop-navigation__link ${
                activePath === item.path ? 'shop-navigation__link--active' : ''
              }`}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
