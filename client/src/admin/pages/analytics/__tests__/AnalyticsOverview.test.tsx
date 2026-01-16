import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalyticsOverview from '../components/AnalyticsOverview';

const mockData = {
  totalPageViews: 1500,
  uniqueVisitors: 750,
  totalSessions: 900,
  bounceRate: 35.5,
  avgSessionDuration: 180,
  topPages: [],
  topReferrers: [],
  deviceStats: {},
  countryStats: {},
  chartData: []
};

describe('AnalyticsOverview', () => {
  it('renders analytics metrics correctly', () => {
    render(<AnalyticsOverview data={mockData} />);
    
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('750')).toBeInTheDocument();
    expect(screen.getByText('900')).toBeInTheDocument();
    expect(screen.getByText('36%')).toBeInTheDocument();
    expect(screen.getByText('3m 0s')).toBeInTheDocument();
  });

  it('displays correct labels', () => {
    render(<AnalyticsOverview data={mockData} />);
    
    expect(screen.getByText('Page Views')).toBeInTheDocument();
    expect(screen.getByText('Unique Visitors')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg. Session')).toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    const dataWithLongDuration = {
      ...mockData,
      avgSessionDuration: 3665
    };
    
    render(<AnalyticsOverview data={dataWithLongDuration} />);
    expect(screen.getByText('61m 5s')).toBeInTheDocument();
  });
});
