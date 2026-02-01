import React, { useState, useCallback } from 'react';
import type { FooterBlock } from '../../../../../../../shared/types/footer';

interface ResizeHandleProps {
  block: FooterBlock;
  onResize: (size: { width: string; height: string }) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ block, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    
    // Parse current size
    const currentWidth = parseInt(block.size.width) || 200;
    const currentHeight = parseInt(block.size.height) || 100;
    setStartSize({ width: currentWidth, height: currentHeight });
  }, [block.size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    const newWidth = Math.max(100, startSize.width + deltaX);
    const newHeight = Math.max(50, startSize.height + deltaY);

    onResize({
      width: `${newWidth}px`,
      height: `${newHeight}px`
    });
  }, [isResizing, startPos, startSize, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <>
      {/* Угловая ручка (правый нижний угол) */}
      <div
        className={`resize-handle resize-handle--corner ${isResizing ? 'resize-handle--active' : ''}`}
        onMouseDown={handleMouseDown}
        title="Изменить размер"
        style={{
          position: 'absolute',
          bottom: '-4px',
          right: '-4px',
          width: '8px',
          height: '8px',
          backgroundColor: '#0066cc',
          cursor: 'nw-resize',
          borderRadius: '2px',
          border: '1px solid #fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}
      />
      
      {/* Правая грань */}
      <div
        className="resize-handle resize-handle--right"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsResizing(true);
          setStartPos({ x: e.clientX, y: e.clientY });
          const currentWidth = parseInt(block.size.width) || 200;
          setStartSize({ width: currentWidth, height: 0 });
        }}
        title="Изменить ширину"
        style={{
          position: 'absolute',
          top: '0',
          right: '-4px',
          width: '8px',
          height: '100%',
          cursor: 'ew-resize',
          backgroundColor: isResizing ? 'rgba(0,102,204,0.3)' : 'transparent'
        }}
      />
      
      {/* Нижняя грань */}
      <div
        className="resize-handle resize-handle--bottom"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsResizing(true);
          setStartPos({ x: e.clientX, y: e.clientY });
          const currentHeight = parseInt(block.size.height) || 100;
          setStartSize({ width: 0, height: currentHeight });
        }}
        title="Изменить высоту"
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: '0',
          width: '100%',
          height: '8px',
          cursor: 'ns-resize',
          backgroundColor: isResizing ? 'rgba(0,102,204,0.3)' : 'transparent'
        }}
      />
    </>
  );
};