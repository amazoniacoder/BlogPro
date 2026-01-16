import React, { useState, useMemo } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

interface DailyStats {
  id: number;
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; visits: number }>;
  deviceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
}

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

interface AnalyticsChartsProps {
  data: DailyStats[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = React.memo(({ data }) => {
  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'doughnut'>('doughnut');

  const chartData = useMemo(() => ({
    labels: (data || []).map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Page Views',
        data: (data || []).map(d => d.pageViews),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Unique Visitors',
        data: (data || []).map(d => d.uniqueVisitors),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Sessions',
        data: (data || []).map(d => d.sessions),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }), [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Traffic Overview' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const totalPageViews = (data || []).reduce((sum, d) => sum + d.pageViews, 0);
  const totalVisitors = (data || []).reduce((sum, d) => sum + d.uniqueVisitors, 0);
  const totalSessions = (data || []).reduce((sum, d) => sum + d.sessions, 0);

  const doughnutData = {
    labels: ['Page Views', 'Unique Visitors', 'Sessions'],
    datasets: [{
      data: [totalPageViews, totalVisitors, totalSessions],
      backgroundColor: [
        'rgb(79, 70, 229)',
        'rgb(236, 72, 153)', 
        'rgb(34, 197, 94)'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: true, text: 'Performance Overview' }
    }
  };

  return (
    <div className="admin-analytics-charts">
      <div className="admin-analytics-charts__header">
        <h3 className="admin-analytics-charts__title">Performance</h3>
        <div className="admin-analytics-charts__controls">
          <button 
            className={`admin-button ${activeChart === 'doughnut' ? 'admin-button--primary' : 'admin-button--secondary'}`}
            onClick={() => setActiveChart('doughnut')}
          >
            Circle
          </button>
          <button 
            className={`admin-button ${activeChart === 'line' ? 'admin-button--primary' : 'admin-button--secondary'}`}
            onClick={() => setActiveChart('line')}
          >
            Line
          </button>
          <button 
            className={`admin-button ${activeChart === 'bar' ? 'admin-button--primary' : 'admin-button--secondary'}`}
            onClick={() => setActiveChart('bar')}
          >
            Bar
          </button>
        </div>
      </div>
      <div className="admin-analytics-charts__container">
        {!data || data.length === 0 ? (
          <div className="admin-analytics-charts__empty">
            <p>No chart data available. Visit your site to generate analytics data.</p>
          </div>
        ) : activeChart === 'doughnut' ? (
          <Doughnut data={doughnutData} options={doughnutOptions} />
        ) : activeChart === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
});

AnalyticsCharts.displayName = 'AnalyticsCharts';

export default AnalyticsCharts;
