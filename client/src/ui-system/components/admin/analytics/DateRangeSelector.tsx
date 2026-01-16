import React, { useState } from 'react';

interface DateRangeSelectorProps {
  onDateRangeChange: (days: number) => void;
  currentDays: number;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = React.memo(({ 
  onDateRangeChange, 
  currentDays 
}) => {
  const [selectedRange, setSelectedRange] = useState(currentDays);

  const dateRanges = [
    { label: 'Last 24 hours', days: 1 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last 6 months', days: 180 },
    { label: 'Last year', days: 365 }
  ];

  const handleRangeChange = (days: number) => {
    setSelectedRange(days);
    onDateRangeChange(days);
  };

  return (
    <div className="admin-analytics__date-range">
      <h4 className="admin-analytics__date-range-title">Time Period</h4>
      <div className="admin-analytics__date-range-buttons flex-col">
        {dateRanges.map(({ label, days }) => (
          <button
            key={days}
            className={`admin-analytics__date-range-button ${
              selectedRange === days ? 'admin-analytics__date-range-button--active' : ''
            }`}
            onClick={() => handleRangeChange(days)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
});

DateRangeSelector.displayName = 'DateRangeSelector';

export default DateRangeSelector;
