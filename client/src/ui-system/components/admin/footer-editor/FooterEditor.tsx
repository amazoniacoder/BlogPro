import React, { useState } from 'react';
import { AdminEditor, AdminTabs, AdminButton } from '../index';
import { Icon } from '../../../icons/components';
import { useFooterEditor } from '../../../../hooks/useFooterEditor';
import { useNotification } from '../../../../hooks/useNotification';
import type { FooterConfig } from '../../../../../../shared/types/footer';
import { FooterCanvas } from './FooterCanvas';
import { StylePanel } from './StylePanel';
import { HistoryPanel } from './HistoryPanel';

export const FooterEditor: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { config, setConfig, saveConfig, previewConfig, isLoading, error } = useFooterEditor();
  
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleSave = async () => {
    try {
      await saveConfig();
      showSuccess('Конфигурация футера сохранена');
    } catch (err) {
      showError('Ошибка сохранения конфигурации');
    }
  };

  const handlePreview = async () => {
    try {
      await previewConfig();
      showSuccess('Предварительный просмотр обновлен');
    } catch (err) {
      showError('Ошибка предварительного просмотра');
    }
  };

  const handleConfigChange = (updates: Partial<FooterConfig>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  const handleBlockSelect = (blockId: string | null) => {
    setSelectedBlock(blockId);
  };

  const handlePreviewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewMode(mode);
  };

  if (error) {
    return (
      <AdminEditor title="Редактор футера">
        <div className="footer-editor__error">
          <Icon name="alert-circle" size={24} />
          <span>{error}</span>
        </div>
      </AdminEditor>
    );
  }

  return (
    <AdminEditor title="Редактор футера">
      <div className="footer-editor">
        <div className="footer-editor__header">
          <div className="footer-editor__title">
            <Icon name="layout" size={20} />
            <h3>Редактор футера</h3>
          </div>
          <div className="footer-editor__actions">
            <AdminButton
              variant="secondary"
              onClick={handlePreview}
              disabled={isLoading || !config}
            >
              <Icon name="eye" size={16} />
              Предварительный просмотр
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={handleSave}
              disabled={isLoading || !config}
            >
              <Icon name="save" size={16} />
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </AdminButton>
          </div>
        </div>
        <AdminTabs
          items={[
            { 
              id: 'editor', 
              label: 'Редактор', 
              icon: <Icon name="edit" size={16} />,
              content: (
                <FooterCanvas
                  config={config}
                  selectedBlock={selectedBlock}
                  previewMode={previewMode}
                  onConfigChange={handleConfigChange}
                  onBlockSelect={handleBlockSelect}
                  onPreviewModeChange={handlePreviewModeChange}
                />
              )
            },
            { 
              id: 'styles', 
              label: 'Стили', 
              icon: <Icon name="palette" size={16} />,
              content: (
                <StylePanel
                  config={config}
                  selectedBlock={selectedBlock}
                  onConfigChange={handleConfigChange}
                />
              )
            },
            { 
              id: 'history', 
              label: 'История', 
              icon: <Icon name="clock" size={16} />,
              content: (
                <HistoryPanel
                  configId={config?.id}
                  onRestore={(restoredConfig) => setConfig(restoredConfig)}
                />
              )
            }
          ]}
        />
      </div>
    </AdminEditor>
  );
};