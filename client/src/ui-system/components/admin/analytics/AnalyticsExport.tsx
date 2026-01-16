import React, { useState } from 'react';

interface AnalyticsExportProps {
  onExport?: (format: string, days: number) => void;
}

const AnalyticsExport: React.FC<AnalyticsExportProps> = React.memo(({ onExport }) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [days, setDays] = useState(30);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics/export?format=${format}&days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${days}days-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onExport?.(format, days);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="admin-analytics__export">
      <h3 className="admin-analytics__export-title">Export Data</h3>
      
      <div className="admin-analytics__export-controls flex-col">
        <div className="admin-analytics__export-field flex-col">
          <label className="admin-analytics__export-label">Format:</label>
          <select 
            className="admin-analytics__export-select"
            value={format} 
            onChange={(e) => setFormat(e.target.value as 'csv' | 'json')}
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>
        
        <div className="admin-analytics__export-field flex-col">
          <label className="admin-analytics__export-label">Days:</label>
          <select 
            className="admin-analytics__export-select"
            value={days} 
            onChange={(e) => setDays(parseInt(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
        
        <button 
          className="admin-button admin-button--primary"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
});

AnalyticsExport.displayName = 'AnalyticsExport';

export default AnalyticsExport;
