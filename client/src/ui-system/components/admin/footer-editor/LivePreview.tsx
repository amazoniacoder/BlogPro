import React, { useState, useRef } from 'react';
import type { FooterConfig, FooterBlock } from '../../../../../../shared/types/footer';
import { BrandBlock } from './blocks/BrandBlock';
import { LinksBlock } from './blocks/LinksBlock';
import { ContactBlock } from './blocks/ContactBlock';
import { SocialBlock } from './blocks/SocialBlock';
import { NewsletterBlock } from './blocks/NewsletterBlock';
import { CustomBlock } from './blocks/CustomBlock';
import { DragHandle } from './controls/DragHandle';
import { ResizeHandle } from './controls/ResizeHandle';
import { BlockToolbar } from './controls/BlockToolbar';

interface LivePreviewProps {
  config: FooterConfig | null;
  selectedBlock: string | null;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onBlockSelect: (blockId: string | null) => void;
  onBlockUpdate: (blockId: string, updates: Partial<FooterBlock>) => void;
  onBlockDelete: (blockId: string) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  config,
  selectedBlock,
  previewMode,
  onBlockSelect,
  onBlockUpdate,
  onBlockDelete
}) => {
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  if (!config) {
    return (
      <div className="live-preview live-preview--empty">
        <div className="live-preview__placeholder">
          <p>Загрузите конфигурацию футера для предварительного просмотра</p>
        </div>
      </div>
    );
  }

  const handleBlockClick = (blockId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onBlockSelect(blockId);
  };

  const handleCanvasClick = () => {
    onBlockSelect(null);
  };

  const handleDragStart = (blockId: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    setDraggedBlock(blockId);
  };

  const handleDragMove = (event: MouseEvent) => {
    if (!draggedBlock || !previewRef.current) return;

    const previewRect = previewRef.current.getBoundingClientRect();
    const newX = event.clientX - previewRect.left - dragOffset.x;
    const newY = event.clientY - previewRect.top - dragOffset.y;

    onBlockUpdate(draggedBlock, {
      position: { x: Math.max(0, newX), y: Math.max(0, newY) }
    });
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragOffset({ x: 0, y: 0 });
  };

  React.useEffect(() => {
    if (draggedBlock) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggedBlock, dragOffset]);

  const handleBlockDuplicate = (blockId: string) => {
    const block = config.blocks.find(b => b.id === blockId);
    if (!block) return;

    const newBlock: FooterBlock = {
      ...block,
      id: `${block.type}-${Date.now()}`,
      position: { x: block.position.x + 20, y: block.position.y + 20 }
    };

    // Добавляем новый блок к существующим
    const updatedBlocks = [...config.blocks, newBlock];
    onBlockUpdate('config', { blocks: updatedBlocks } as any);
  };

  const renderBlock = (block: FooterBlock) => {
    const isSelected = selectedBlock === block.id;
    const commonProps = {
      block,
      isSelected,
      onUpdate: (updates: Partial<FooterBlock>) => onBlockUpdate(block.id, updates)
    };

    let BlockComponent;
    switch (block.type) {
      case 'brand':
        BlockComponent = BrandBlock;
        break;
      case 'links':
        BlockComponent = LinksBlock;
        break;
      case 'contact':
        BlockComponent = ContactBlock;
        break;
      case 'social':
        BlockComponent = SocialBlock;
        break;
      case 'newsletter':
        BlockComponent = NewsletterBlock;
        break;
      case 'custom':
        BlockComponent = CustomBlock;
        break;
      default:
        return null;
    }

    return (
      <div
        key={block.id}
        className={`live-preview__block ${isSelected ? 'live-preview__block--selected' : ''}`}
        style={{
          position: 'absolute',
          left: block.position.x,
          top: block.position.y,
          width: block.size.width,
          height: block.size.height,
          cursor: draggedBlock === block.id ? 'grabbing' : 'pointer',
          border: isSelected ? '2px solid #0066cc' : '1px solid transparent',
          borderRadius: '4px'
        }}
        onClick={(e) => handleBlockClick(block.id, e)}
      >
        <BlockComponent {...commonProps} />
        
        {isSelected && (
          <>
            <DragHandle onMouseDown={(e) => handleDragStart(block.id, e)} />
            <ResizeHandle
              block={block}
              onResize={(size) => onBlockUpdate(block.id, { size })}
            />
            <BlockToolbar
              block={block}
              onDelete={() => onBlockDelete(block.id)}
              onDuplicate={() => handleBlockDuplicate(block.id)}
            />
          </>
        )}
      </div>
    );
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  const footerStyles = {
    backgroundColor: config.styles.backgroundColor,
    color: config.styles.textColor,
    padding: config.styles.padding,
    margin: config.styles.margin,
    display: config.layout.type === 'grid' ? 'grid' : 'flex',
    gridTemplateColumns: config.layout.type === 'grid' 
      ? `repeat(${config.layout.columns}, 1fr)` 
      : undefined,
    gap: config.layout.gap,
    maxWidth: config.layout.maxWidth,
    width: getPreviewWidth(),
    position: 'relative' as const,
    minHeight: '200px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  return (
    <div className={`live-preview live-preview--${previewMode}`}>
      <div className="live-preview__device-frame">
        <div
          ref={previewRef}
          className="live-preview__footer"
          style={footerStyles}
          onClick={handleCanvasClick}
        >
          {config.blocks.length === 0 ? (
            <div className="live-preview__empty-state">
              <p>Добавьте блоки для создания футера</p>
            </div>
          ) : (
            config.blocks.map(renderBlock)
          )}
        </div>
      </div>
      
      <div className="live-preview__info">
        <span>Режим: {previewMode}</span>
        <span>Блоков: {config.blocks.length}</span>
        {selectedBlock && <span>Выбран: {selectedBlock}</span>}
      </div>
    </div>
  );
};