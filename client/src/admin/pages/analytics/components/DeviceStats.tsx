import React from 'react';
import { DeviceStats as UIDeviceStats } from '@/ui-system/components/admin';

interface DeviceStatsProps {
  stats: Record<string, number>;
}

const DeviceStats: React.FC<DeviceStatsProps> = ({ stats }) => {
  return <UIDeviceStats stats={stats} />;
};

export default DeviceStats;
