import React, { useState } from 'react';
import { Card } from '../../card';
import { AdminButton } from '../AdminButton';
import { Icon } from '../../../icons/components';
import type { FooterConfig, FooterBlock } from '../../../../../../shared/types/footer';
import { BlockLibrary } from './BlockLibrary';
import { LivePreview } from './LivePreview';

interface FooterCanvasProps {
  config: FooterConfig | null;
  selectedBlock: string | null;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onConfigChange: (updates: Partial<FooterConfig>) => void;
  onBlockSelect: (blockId: string | null) => void;
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export const FooterCanvas: React.FC<FooterCanvasProps> = ({
  config,
  selectedBlock,
  previewMode,
  onConfigChange,
  onBlockSelect,
  onPreviewModeChange
}) => {
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);

  const handleBlockAdd = (blockType: FooterBlock['type']) => {
    if (!config) return;

    const newBlock: FooterBlock = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      position: { x: 0, y: config.blocks.length },
      size: { width: '100%', height: 'auto' },
      content: {},
      styles: {}
    };

    onConfigChange({
      blocks: [...config.blocks, newBlock]
    });

    setShowBlockLibrary(false);
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<FooterBlock>) => {
    if (!config) return;

    onConfigChange({
      blocks: config.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    });
  };

  const handleBlockDelete = (blockId: string) => {
    if (!config) return;

    onConfigChange({
      blocks: config.blocks.filter(block => block.id !== blockId)
    });

    if (selectedBlock === blockId) {
      onBlockSelect(null);
    }
  };

  return (
    <div className="footer-canvas">
      <Card className="footer-canvas__toolbar">
        <h3>Инструменты</h3>
        <div className="footer-canvas__controls">
          <AdminButton
            variant="primary"
            size="sm"
            onClick={() => setShowBlockLibrary(!showBlockLibrary)}
          >
            <Icon name="add" size={16} />
            Добавить блок
          </AdminButton>

          <div className="footer-canvas__preview-modes">
            <AdminButton
              variant={previewMode === 'desktop' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onPreviewModeChange('desktop')}
            >
              <Icon name="gear" size={16} />
              Desktop
            </AdminButton>
            <AdminButton
              variant={previewMode === 'tablet' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onPreviewModeChange('tablet')}
            >
              <Icon name="gear" size={16} />
              Tablet
            </AdminButton>
            <AdminButton
              variant={previewMode === 'mobile' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onPreviewModeChange('mobile')}
            >
              <Icon name="gear" size={16} />
              Mobile
            </AdminButton>
          </div>
        </div>

        {showBlockLibrary && (
          <BlockLibrary
            onBlockAdd={handleBlockAdd}
            onClose={() => setShowBlockLibrary(false)}
          />
        )}
      </Card>

      <Card className="footer-canvas__preview">
        <h3>Предварительный просмотр</h3>
        <LivePreview
          config={config}
          selectedBlock={selectedBlock}
          previewMode={previewMode}
          onBlockSelect={onBlockSelect}
          onBlockUpdate={handleBlockUpdate}
          onBlockDelete={handleBlockDelete}
        />
      </Card>
    </div>
  );
};