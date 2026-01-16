import React from 'react';
import { AnalyticsExport as UIAnalyticsExport } from '@/ui-system/components/admin';

interface AnalyticsExportProps {
  onExport?: (format: string, days: number) => void;
}

const AnalyticsExport: React.FC<AnalyticsExportProps> = ({ onExport }) => {
  return <UIAnalyticsExport onExport={onExport} />;
};

export default AnalyticsExport;
