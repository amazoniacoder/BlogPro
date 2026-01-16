import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TableEditService } from '../services/TableEditService';

interface TableColorEditorProps {}

interface ColorData {
  borderColor: string;
  headerBackgroundColor: string;
  cellBackgroundColor: string;
  textColor: string;
}

const TableColorEditor: React.FC<TableColorEditorProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [colorData, setColorData] = useState<ColorData>({
    borderColor: '#ccc',
    headerBackgroundColor: '#f9fafb',
    cellBackgroundColor: '#ffffff',
    textColor: '#000000'
  });
  const [editingTable, setEditingTable] = useState<HTMLTableElement | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Listen for color editor events
  useEffect(() => {
    const handleColorEdit = (event: CustomEvent) => {
      const { table, currentData } = event.detail;
      setEditingTable(table);
      setColorData({
        borderColor: currentData.borderColor || '#ccc',
        headerBackgroundColor: currentData.headerBackgroundColor || '#f9fafb',
        cellBackgroundColor: currentData.cellBackgroundColor || '#ffffff',
        textColor: currentData.textColor || '#000000'
      });
      
      // Check if mobile and dispatch modal event
      if (window.innerWidth <= 768) {
        document.dispatchEvent(new CustomEvent('openPluginModal', {
          detail: { plugin: 'table-color-editor' }
        }));
        return;
      }
      
      setIsOpen(true);
    };

    document.addEventListener('openTableColorEditor', handleColorEdit as EventListener);
    return () => document.removeEventListener('openTableColorEditor', handleColorEdit as EventListener);
  }, []);

  // Apply colors to table
  const handleApplyColors = useCallback(() => {
    if (editingTable) {
      TableEditService.applyTableColors(editingTable, colorData);
      setIsOpen(false);
      setEditingTable(null);
    }
  }, [editingTable, colorData]);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  if (!isOpen) return null;

  return (
    <div 
      className="table-color-editor" 
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
        minWidth: '300px'
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
          Table Colors
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

        {/* Header Background Color */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Header Background
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="color"
              value={colorData.headerBackgroundColor}
              onChange={(e) => setColorData(prev => ({ ...prev, headerBackgroundColor: e.target.value }))}
              style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={colorData.headerBackgroundColor}
              onChange={(e) => setColorData(prev => ({ ...prev, headerBackgroundColor: e.target.value }))}
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

        {/* Cell Background Color */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            Cell Background
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="color"
              value={colorData.cellBackgroundColor}
              onChange={(e) => setColorData(prev => ({ ...prev, cellBackgroundColor: e.target.value }))}
              style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={colorData.cellBackgroundColor}
              onChange={(e) => setColorData(prev => ({ ...prev, cellBackgroundColor: e.target.value }))}
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

export default TableColorEditor;
