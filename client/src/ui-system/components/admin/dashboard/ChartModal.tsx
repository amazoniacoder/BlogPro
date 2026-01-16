import React from 'react';
import { useTranslation } from 'react-i18next';

interface AnalyticsData {
  date: string;
  pageViews: number;
  visitors: number;
}

interface ChartModalProps {
  data: AnalyticsData[];
  isOpen: boolean;
  onClose: () => void;
  period: string;
  onPeriodChange: (period: string) => void;
}

const ChartModal: React.FC<ChartModalProps> = ({ data, isOpen, onClose, period, onPeriodChange }) => {
  const { t } = useTranslation('admin');

  if (!isOpen) return null;

  const chartHeight = 400;
  const chartWidth = 800;
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  
  const maxPageViews = Math.max(...data.map(d => d.pageViews));
  const maxVisitors = Math.max(...data.map(d => d.visitors));
  const maxValue = Math.max(maxPageViews, maxVisitors);
  
  const createPath = (values: number[]) => {
    if (values.length === 0) return '';
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * innerWidth;
      const y = innerHeight - (value / (maxValue || 1)) * innerHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };
  
  const pageViewsPath = createPath(data.map(d => d.pageViews));
  const visitorsPath = createPath(data.map(d => d.visitors));

  return (
    <div className="admin-modal admin-modal--fullscreen">
      <div className="admin-modal__overlay" onClick={onClose}></div>
      <div className="admin-modal__content admin-modal__content--chart">
        <div className="admin-modal__header">
          <h3 className="admin-modal__title">{t('performance')} - Detailed View</h3>
          <div className="admin-modal__actions">
            <select 
              className="admin-select admin-select--chart-period"
              value={period}
              onChange={(e) => onPeriodChange(e.target.value)}
            >
              <option value="1">Last 24 hours</option>
              <option value="3">Last 3 days</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button className="admin-modal__close hover-bg" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="admin-modal__body">
          <div className="admin-dashboard__chart-container admin-dashboard__chart-container--large">
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <defs>
                <pattern id="grid-large" width="80" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 60" fill="none" stroke="#d0d0d0" strokeWidth="1.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-large)" />
              
              <g transform={`translate(${padding.left}, ${padding.top})`}>
                <line x1="0" y1="0" x2="0" y2={innerHeight} stroke="#888" strokeWidth="3" />
                <line x1="0" y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#888" strokeWidth="3" />
                
                {/* Y-axis labels */}
                <text x="-15" y="5" textAnchor="end" fontSize="14" fill="#666">
                  {maxValue}
                </text>
                <text x="-15" y={innerHeight / 2} textAnchor="end" fontSize="14" fill="#666">
                  {Math.round(maxValue / 2)}
                </text>
                <text x="-15" y={innerHeight + 5} textAnchor="end" fontSize="14" fill="#666">
                  0
                </text>
                
                {/* X-axis labels */}
                {data.map((item, index) => {
                  const x = (index / (data.length - 1)) * innerWidth;
                  const date = new Date(item.date);
                  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <text 
                      key={index}
                      x={x} 
                      y={innerHeight + 25} 
                      textAnchor="middle" 
                      fontSize="12" 
                      fill="#666"
                    >
                      {label}
                    </text>
                  );
                })}
                
                {/* Page Views curve */}
                <path
                  d={pageViewsPath}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Visitors curve */}
                <path
                  d={visitorsPath}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {data.map((item, index) => {
                  const x = (index / (data.length - 1)) * innerWidth;
                  const pageViewsY = innerHeight - (item.pageViews / (maxValue || 1)) * innerHeight;
                  const visitorsY = innerHeight - (item.visitors / (maxValue || 1)) * innerHeight;
                  
                  return (
                    <g key={index}>
                      <circle cx={x} cy={pageViewsY} r="7" fill="#4f46e5" stroke="white" strokeWidth="4" />
                      <circle cx={x} cy={visitorsY} r="7" fill="#ec4899" stroke="white" strokeWidth="4" />
                    </g>
                  );
                })}
              </g>
            </svg>
            
            <div className="admin-dashboard__chart-legend admin-dashboard__chart-legend--large">
              <div className="admin-dashboard__chart-legend-item">
                <span className="admin-dashboard__chart-legend-color" style={{ backgroundColor: '#4f46e5' }}></span>
                <span className="admin-dashboard__chart-legend-label">{t('pageViews')}</span>
              </div>
              <div className="admin-dashboard__chart-legend-item">
                <span className="admin-dashboard__chart-legend-color" style={{ backgroundColor: '#ec4899' }}></span>
                <span className="admin-dashboard__chart-legend-label">{t('visitors')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
