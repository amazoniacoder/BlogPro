import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TableEditService } from '../services/TableEditService';

interface CellColorData {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

const CellColorEditor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Notify menu manager of state changes
  const notifyMenuState = useCallback((isOpen: boolean) => {
    const event = new CustomEvent('menuStateChange', {
      detail: { menuType: 'cellColor', isOpen }
    });
    document.dispatchEvent(event);
  }, []);
  const [colorData, setColorData] = useState<CellColorData>({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#ccc'
  });
  const [editingCell, setEditingCell] = useState<HTMLTableCellElement | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Listen for cell color editor events
  useEffect(() => {
    const handleCellColorEdit = (event: CustomEvent) => {
      const { cell, currentColors } = event.detail;
      setEditingCell(cell);
      setColorData(currentColors);
      setIsOpen(true);
      notifyMenuState(true);
    };

    document.addEventListener('openCellColorEditor', handleCellColorEdit as EventListener);
    return () => document.removeEventListener('openCellColorEditor', handleCellColorEdit as EventListener);
  }, []);

  // Apply colors to cell
  const handleApplyColors = useCallback(() => {
    if (editingCell) {
      TableEditService.applyCellColors(editingCell, colorData);
      setIsOpen(false);
      notifyMenuState(false);
      setEditingCell(null);
    }
  }, [editingCell, colorData, notifyMenuState]);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      notifyMenuState(false);
    }
  }, [notifyMenuState]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  if (!isOpen) return null;

  return (
    <div 
      className="cell-color-editor" 
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999999,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '20px',
        minWidth: '280px'
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
          Cell Color
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Background Color */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Background Color
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="color"
              value={colorData.backgroundColor}
              onChange={(e) => setColorData(prev => ({ ...prev, backgroundColor: e.target.value }))}
              style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={colorData.backgroundColor}
              onChange={(e) => setColorData(prev => ({ ...prev, backgroundColor: e.target.value }))}
              style={{ 
                flex: 1, 
                padding: '6px 8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Text Color
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="color"
              value={colorData.textColor}
              onChange={(e) => setColorData(prev => ({ ...prev, textColor: e.target.value }))}
              style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={colorData.textColor}
              onChange={(e) => setColorData(prev => ({ ...prev, textColor: e.target.value }))}
              style={{ 
                flex: 1, 
                padding: '6px 8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Border Color */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Border Color
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="color"
              value={colorData.borderColor}
              onChange={(e) => setColorData(prev => ({ ...prev, borderColor: e.target.value }))}
              style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={colorData.borderColor}
              onChange={(e) => setColorData(prev => ({ ...prev, borderColor: e.target.value }))}
              style={{ 
                flex: 1, 
                padding: '6px 8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{
            padding: '8px 16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApplyColors}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Apply Colors
        </button>
      </div>
    </div>
  );
};

export default CellColorEditor;
