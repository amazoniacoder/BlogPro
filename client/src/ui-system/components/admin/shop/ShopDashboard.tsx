import React, { useState, useEffect } from 'react';
import { Icon } from '../../../icons/components';

export interface ShopStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockItems: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orderCount: number;
}

export const ShopDashboard: React.FC = () => {
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Skip API call - not implemented yet
    setStats({
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      lowStockItems: 0
    });
    setRevenueData([]);
    setLoading(false);
  };

  if (loading) {
    return <div className="shop-dashboard__loading">Loading dashboard...</div>;
  }

  return (
    <div className="shop-dashboard">
      <div className="shop-dashboard__header">
        <h1 className="shop-dashboard__title">Shop Dashboard</h1>
      </div>

      <div className="shop-dashboard__stats">
        <div className="shop-dashboard__stat-card">
          <div className="shop-dashboard__stat-icon">
            <Icon name="chart" size={24} />
          </div>
          <div className="shop-dashboard__stat-content">
            <div className="shop-dashboard__stat-value">${stats?.totalRevenue || 0}</div>
            <div className="shop-dashboard__stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="shop-dashboard__stat-card">
          <div className="shop-dashboard__stat-icon">
            <Icon name="file" size={24} />
          </div>
          <div className="shop-dashboard__stat-content">
            <div className="shop-dashboard__stat-value">{stats?.totalOrders || 0}</div>
            <div className="shop-dashboard__stat-label">Total Orders</div>
          </div>
        </div>

        <div className="shop-dashboard__stat-card">
          <div className="shop-dashboard__stat-icon">
            <Icon name="clock" size={24} />
          </div>
          <div className="shop-dashboard__stat-content">
            <div className="shop-dashboard__stat-value">{stats?.pendingOrders || 0}</div>
            <div className="shop-dashboard__stat-label">Pending Orders</div>
          </div>
        </div>

        <div className="shop-dashboard__stat-card shop-dashboard__stat-card--warning">
          <div className="shop-dashboard__stat-icon">
          <Icon name="warning" size={24} />
          </div>
          <div className="shop-dashboard__stat-content">
            <div className="shop-dashboard__stat-value">{stats?.lowStockItems || 0}</div>
            <div className="shop-dashboard__stat-label">Low Stock Items</div>
          </div>
        </div>
      </div>

      <div className="shop-dashboard__charts">
        <div className="shop-dashboard__chart-card">
          <h3 className="shop-dashboard__chart-title">Revenue Overview</h3>
          <div className="shop-dashboard__chart-content">
            {revenueData.length > 0 ? (
              <div className="shop-dashboard__revenue-list">
                {revenueData.slice(0, 7).map((item, index) => (
                  <div key={index} className="shop-dashboard__revenue-item">
                    <span className="shop-dashboard__revenue-date">{item.date}</span>
                    <span className="shop-dashboard__revenue-amount">${item.revenue}</span>
                    <span className="shop-dashboard__revenue-orders">{item.orderCount} orders</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="shop-dashboard__no-data">No revenue data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
