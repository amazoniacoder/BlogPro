import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui-system/icons/components';
import { useToast } from '@/ui-system/components/feedback';

interface SettingsData {
  general?: Record<string, any>;
  security?: Record<string, any>;
  notifications?: Record<string, any>;
  contact?: Record<string, any>;
  mailings?: Record<string, any>;
  api?: Record<string, any>;
}

interface SettingsExportImportProps {
  onImport?: (data: SettingsData) => Promise<void>;
  onExport?: () => Promise<SettingsData>;
  className?: string;
}

const SettingsExportImport: React.FC<SettingsExportImportProps> = ({
  onImport,
  onExport,
  className = ''
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const { showSuccess, showError } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!onExport) return;

    try {
      setIsExporting(true);
      const data = await onExport();
      
      const exportData = {
        ...data,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blogpro-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess(t('admin:settingsExported', { 
        defaultValue: 'Settings exported successfully' 
      }));
    } catch (error) {
      console.error('Export error:', error);
      showError(t('admin:exportError', { 
        defaultValue: 'Failed to export settings' 
      }));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImport) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the imported data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid settings file format');
      }

      // Remove metadata before importing
      const { exportedAt, version, ...settingsData } = data;
      
      await onImport(settingsData);
      
      showSuccess(t('admin:settingsImported', { 
        defaultValue: 'Settings imported successfully' 
      }));
    } catch (error) {
      console.error('Import error:', error);
      showError(t('admin:importError', { 
        defaultValue: 'Failed to import settings. Please check the file format.' 
      }));
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`settings-export-import ${className}`}>
      <div className="settings-export-import__actions">
        <button
          className="settings-export-import__button settings-export-import__button--export"
          onClick={handleExport}
          disabled={isExporting || !onExport}
          title={t('admin:exportSettings', { defaultValue: 'Export Settings' })}
        >
          {isExporting ? (
            <Icon name="refresh" size={16} className="settings-export-import__loading" />
          ) : (
            <Icon name="download" size={16} />
          )}
          <span className="settings-export-import__button-text">
            {isExporting 
              ? t('admin:exporting', { defaultValue: 'Exporting...' })
              : t('admin:export', { defaultValue: 'Export' })
            }
          </span>
        </button>

        <button
          className="settings-export-import__button settings-export-import__button--import"
          onClick={handleImportClick}
          disabled={isImporting || !onImport}
          title={t('admin:importSettings', { defaultValue: 'Import Settings' })}
        >
          {isImporting ? (
            <Icon name="refresh" size={16} className="settings-export-import__loading" />
          ) : (
            <Icon name="upload" size={16} />
          )}
          <span className="settings-export-import__button-text">
            {isImporting 
              ? t('admin:importing', { defaultValue: 'Importing...' })
              : t('admin:import', { defaultValue: 'Import' })
            }
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="settings-export-import__file-input"
        aria-hidden="true"
      />
    </div>
  );
};

export default SettingsExportImport;
