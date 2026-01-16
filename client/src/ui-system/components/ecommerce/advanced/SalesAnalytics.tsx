import React, { useState, useEffect } from 'react';
import { Icon } from '../../../icons/components';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export const SalesAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData({
        totalRevenue: 12450.00,
        totalOrders: 156,
        averageOrderValue: 79.81,
        topProducts: [
          { id: '1', name: 'Product A', sales: 45, revenue: 1350.00 },
          { id: '2', name: 'Product B', sales: 32, revenue: 960.00 },
          { id: '3', name: 'Product C', sales: 28, revenue: 840.00 }
        ],
        revenueByDay: [
          { date: '2024-01-15', revenue: 1200, orders: 15 },
          { date: '2024-01-16', revenue: 1800, orders: 22 },
          { date: '2024-01-17', revenue: 1500, orders: 18 }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="sales-analytics sales-analytics--loading">
        <Icon name="refresh" size={24} />
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="sales-analytics sales-analytics--error">
        <Icon name="error" size={24} />
        <span>Failed to load analytics data</span>
      </div>
    );
  }

  return (
    <div className="sales-analytics">
      <div className="sales-analytics__header">
        <h2 className="sales-analytics__title">Sales Analytics</h2>
        
        <select
          className="sales-analytics__time-range"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="sales-analytics__metrics">
        <div className="sales-analytics__metric">
          <div className="sales-analytics__metric-icon">
            <Icon name="chart" size={24} />
          </div>
          <div className="sales-analytics__metric-content">
            <div className="sales-analytics__metric-value">
              ${data.totalRevenue.toFixed(2)}
            </div>
            <div className="sales-analytics__metric-label">Total Revenue</div>
          </div>
        </div>

        <div className="sales-analytics__metric">
          <div className="sales-analytics__metric-icon">
            <Icon name="file" size={24} />
          </div>
          <div className="sales-analytics__metric-content">
            <div className="sales-analytics__metric-value">{data.totalOrders}</div>
            <div className="sales-analytics__metric-label">Total Orders</div>
          </div>
        </div>

        <div className="sales-analytics__metric">
          <div className="sales-analytics__metric-icon">
            <Icon name="credit-card" size={24} />
          </div>
          <div className="sales-analytics__metric-content">
            <div className="sales-analytics__metric-value">
              ${data.averageOrderValue.toFixed(2)}
            </div>
            <div className="sales-analytics__metric-label">Avg Order Value</div>
          </div>
        </div>
      </div>

      <div className="sales-analytics__charts">
        <div className="sales-analytics__chart">
          <h3 className="sales-analytics__chart-title">Top Products</h3>
          <div className="sales-analytics__top-products">
            {data.topProducts.map((product, index) => (
              <div key={product.id} className="sales-analytics__product">
                <div className="sales-analytics__product-rank">#{index + 1}</div>
                <div className="sales-analytics__product-info">
                  <div className="sales-analytics__product-name">{product.name}</div>
                  <div className="sales-analytics__product-stats">
                    {product.sales} sales • ${product.revenue.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sales-analytics__chart">
          <h3 className="sales-analytics__chart-title">Revenue Trend</h3>
          <div className="sales-analytics__revenue-chart">
            {data.revenueByDay.map((day) => (
              <div key={day.date} className="sales-analytics__revenue-day">
                <div className="sales-analytics__revenue-bar">
                  <div 
                    className="sales-analytics__revenue-fill"
                    style={{ height: `${(day.revenue / 2000) * 100}%` }}
                  />
                </div>
                <div className="sales-analytics__revenue-label">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="sales-analytics__revenue-value">
                  ${day.revenue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
