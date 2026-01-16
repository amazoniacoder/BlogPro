import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DeviceStatsProps {
  stats: Record<string, number>;
}

const DeviceStats: React.FC<DeviceStatsProps> = React.memo(({ stats }) => {
  const deviceStats = stats || {};
  
  const total = Object.values(deviceStats).reduce((sum, count) => sum + count, 0);
  
  const chartData = {
    labels: Object.keys(deviceStats),
    datasets: [
      {
        data: Object.values(deviceStats),
        backgroundColor: [
          'rgb(79, 70, 229)',
          'rgb(236, 72, 153)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const }
    }
  };

  return (
    <div className="admin-analytics-device-stats">
      <h3 className="admin-analytics-device-stats__title">Device Breakdown</h3>
      {total > 0 ? (
        <>
          <div className="admin-analytics-device-stats__chart">
            <Doughnut data={chartData} options={options} />
          </div>
          <div className="admin-analytics-device-stats__list">
            {Object.entries(deviceStats).map(([device, count]) => (
              <div key={device} className="admin-analytics-device-stats__item">
                <span className="admin-analytics-device-stats__device">{device}</span>
                <span className="admin-analytics-device-stats__count">
                  {count.toLocaleString()} ({Math.round((count / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="admin-analytics-device-stats__empty">No device data available</div>
      )}
    </div>
  );
});

DeviceStats.displayName = 'DeviceStats';

export default DeviceStats;
