import React from 'react';
import { ShopNavigation } from './ShopNavigation';

interface ShopLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  onNavigate?: (path: string) => void;
}

const ShopLayout: React.FC<ShopLayoutProps> = ({ children, activePath, onNavigate }) => {
  return (
    <div className="shop-layout">
      <div className="shop-layout__sidebar">
        <ShopNavigation activePath={activePath} onNavigate={onNavigate} />
      </div>
      
      <div className="shop-layout__content">
        {children}
      </div>
    </div>
  );
};

export default ShopLayout;
