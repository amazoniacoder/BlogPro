import React from 'react';
import { DateRangeSelector as UIDateRangeSelector } from '@/ui-system/components/admin';

interface DateRangeSelectorProps {
  onDateRangeChange: (days: number) => void;
  currentDays: number;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onDateRangeChange, currentDays }) => {
  return <UIDateRangeSelector onDateRangeChange={onDateRangeChange} currentDays={currentDays} />;
};

export default DateRangeSelector;
