import React, { useState, useEffect } from 'react';
import { AdminTabs } from '../AdminTabs';
import { Icon } from '../../../icons/components';
import { useNotification } from '../../feedback';
import { FooterCanvas } from './FooterCanvas';
import { BlockLibrary } from './BlockLibrary';
import { StylePanel } from './StylePanel';
import { HistoryPanel } from './HistoryPanel';
import { useFooterEditor } from '../../../../hooks/useFooterEditor';
import { useFooterWebSocket } from '../../../../services/websocket/useFooterWebSocket';
import type { FooterBlock, FooterConfig } from '../../../../../../shared/types/footer';

export const FooterEditorEmbedded: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const {
    config,
    setConfig,
    saveConfig,
    previewConfig,
    isLoading,
    error
  } = useFooterEditor();

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [previewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('editor');

  // WebSocket integration for live preview
  useFooterWebSocket({
    onConfigUpdated: (updatedConfig) => {
      setConfig(updatedConfig);
    },
    onPreviewUpdated: (previewConfig) => {
      console.log('Preview updated from WebSocket:', previewConfig);
    }
  });

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

  const handleBlockAdd = (blockType: FooterBlock['type']) => {
    if (!config) return;

    const newBlock: FooterBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      position: { x: 0, y: 0 },
      size: { width: '100%', height: 'auto' },
      content: {},
      styles: {}
    };

    setConfig({
      ...config,
      blocks: [...config.blocks, newBlock]
    });
  };

  const handleConfigChange = (updates: Partial<FooterConfig>) => {
    if (!config) return;
    setConfig({ ...config, ...updates });
  };

  const handleBlockSelect = (blockId: string | null) => {
    setSelectedBlock(blockId);
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<FooterBlock>) => {
    if (!config) return;

    setConfig({
      ...config,
      blocks: config.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    });
  };

  // Listen for footer block creation events
  useEffect(() => {
    const handleCreateFooterBlock = () => {
      // Default to brand block when creating from site editor
      handleBlockAdd('brand');
    };

    window.addEventListener('createFooterBlock', handleCreateFooterBlock);
    return () => window.removeEventListener('createFooterBlock', handleCreateFooterBlock);
  }, [config]);

  if (error) {
    return (
      <div className="footer-editor__error">
        <Icon name="alert-circle" size={24} />
        <p>Ошибка загрузки редактора футера: {error}</p>
      </div>
    );
  }

  return (
    <div className="footer-editor footer-editor--embedded">
      <div className="footer-editor__header">
        <div className="footer-editor__title">
          <Icon name="layout" size={20} />
          <h3>Редактор футера</h3>
        </div>
        <div className="footer-editor__actions">
          <button
            className="admin-button admin-button--secondary"
            onClick={handlePreview}
            disabled={isLoading}
          >
            <Icon name="eye" size={16} />
            Предварительный просмотр
          </button>
          <button
            className="admin-button admin-button--primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Icon name="save" size={16} />
            Сохранить
          </button>
        </div>
      </div>

      <AdminTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        items={[
          {
            id: 'editor',
            label: 'Редактор',
            icon: <Icon name="edit" size={16} />,
            content: (
              <div className="footer-editor__workspace">
                <div className="footer-editor__sidebar">
                  <BlockLibrary onBlockAdd={handleBlockAdd} />
                </div>
                <div className="footer-editor__canvas">
                  <FooterCanvas
                    config={config}
                    selectedBlock={selectedBlock}
                    previewMode={previewMode}
                    onConfigChange={handleConfigChange}
                    onBlockSelect={handleBlockSelect}
                    onPreviewModeChange={() => {}}
                  />
                </div>
              </div>
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
                onBlockUpdate={handleBlockUpdate}
              />
            )
          },
          {
            id: 'history',
            label: 'История',
            icon: <Icon name="history" size={16} />,
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
  );
};