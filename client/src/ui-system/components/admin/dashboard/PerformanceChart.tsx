import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartModal from './ChartModal';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AnalyticsData {
  date: string;
  pageViews: number;
  visitors: number;
}

interface PerformanceChartProps {
  loading?: boolean;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ loading = false }) => {
  const { t } = useTranslation('admin');
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [period, setPeriod] = useState('7');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  // Auto-refresh analytics data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [period]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics/overview?days=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const analyticsData = await response.json();
        // Transform the new API response to match the expected format
        const chartData = analyticsData.chartData?.map((item: any) => ({
          date: item.date,
          pageViews: item.pageViews || 0,
          visitors: item.uniqueVisitors || 0
        })) || [];
        setData(chartData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="admin-card admin-dashboard__chart">
        <div className="admin-card__header">
          <h3 className="admin-card__title">{t('performance')}</h3>
        </div>
        <div className="admin-card__body">
          <div className="admin-loading">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="admin-card admin-dashboard__chart">
        <div className="admin-card__header">
          <h3 className="admin-card__title">{t('performance')}</h3>
        </div>
        <div className="admin-card__body">
          <p className="admin-dashboard__placeholder">
            Analytics data will appear automatically as visitors browse your site.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card admin-dashboard__chart">
      <div className="admin-card__header">
        <h3 className="admin-card__title">{t('performance')}</h3>
        <div className="admin-card__actions">
          <div className="admin-select-wrapper">
            <select 
              className="admin-select admin-select--styled"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="1">Last 24 hours</option>
              <option value="3">Last 3 days</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <div className="admin-select-arrow">▼</div>
          </div>
        </div>
      </div>
      <div className="admin-card__body">
        <div className="admin-dashboard__chart-container" onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
          <div className="admin-dashboard__doughnut-chart">
            <Doughnut 
              data={{
                labels: ['Page Views', 'Visitors'],
                datasets: [{
                  data: [
                    data.reduce((sum, d) => sum + d.pageViews, 0),
                    data.reduce((sum, d) => sum + d.visitors, 0)
                  ],
                  backgroundColor: ['#4f46e5', '#ec4899'],
                  borderWidth: 3,
                  borderColor: '#fff'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' as const }
                }
              }}
            />
          </div>
        </div>
        
        <ChartModal 
          data={data}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          period={period}
          onPeriodChange={(newPeriod) => {
            setPeriod(newPeriod);
            setIsModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default PerformanceChart;
