import React from 'react';
import { FormatState } from '../types/CoreTypes';

// ToolbarButton interface
export interface ToolbarButton {
  readonly id: string;
  readonly label: string;
  readonly command: string;
  readonly icon?: string;
  readonly isActive?: boolean;
  readonly shortcut?: string;
}
import { FontSizeDropdown } from './FontSizeDropdown';
import { FontFamilyDropdown } from './FontFamilyDropdown';
import { TextAlignmentDropdown } from './TextAlignmentDropdown';
import { TextColorPicker } from './TextColorPicker';
import { ListFormatting } from './ListFormatting';
import { LinkManager } from './LinkManager';
import { ImageUpload } from './ImageUpload';
import TableEditor from './TableEditor';
import FindReplace from './FindReplace';
import './Toolbar.css';

interface ToolbarProps {
  formatState: FormatState;
  onCommand: (command: string, value?: string | any) => void;
  isFullscreen?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ formatState, onCommand, isFullscreen = false }) => {
  const toolbarButtons: ToolbarButton[] = [
    { id: 'bold', label: 'Bold', command: 'bold', icon: 'B', shortcut: 'Ctrl+B' },
    { id: 'italic', label: 'Italic', command: 'italic', icon: 'I', shortcut: 'Ctrl+I' },
    { id: 'underline', label: 'Underline', command: 'underline', icon: 'U', shortcut: 'Ctrl+U' },
  ];

  const handleButtonClick = (button: ToolbarButton) => {
    // Always use onCommand callback for consistency
    onCommand(button.command);
  };

  const isActive = (buttonId: string): boolean => {
    switch (buttonId) {
      case 'bold': return formatState.bold;
      case 'italic': return formatState.italic;
      case 'underline': return formatState.underline;
      default: return false;
    }
  };

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        {toolbarButtons.map(button => (
          <button
            key={button.id}
            className={`toolbar-button ${isActive(button.id) ? 'active' : ''}`}
            onClick={() => handleButtonClick(button)}
            title={`${button.label} (${button.shortcut})`}
            type="button"
          >
            {button.icon && <span className="button-icon">{button.icon}</span>}
            {!button.icon && button.label}
          </button>
        ))}
        
        <div className="toolbar-separator" />
        
        <button
          className="toolbar-button"
          onClick={() => onCommand('undo')}
          title="Undo (Ctrl+Z)"
          type="button"
        >
          ↶
        </button>
        <button
          className="toolbar-button"
          onClick={() => onCommand('redo')}
          title="Redo (Ctrl+Y)"
          type="button"
        >
          ↷
        </button>
        
        <div className="toolbar-separator" />
        
        <FontFamilyDropdown
          currentFontFamily={formatState.fontFamily as any}
          onFontFamilyChange={(fontFamily) => {
            onCommand('fontFamily', fontFamily);
          }}
        />
        <FontSizeDropdown
          currentFontSize={formatState.fontSize as any}
          onFontSizeChange={(fontSize) => {
            onCommand('fontSize', fontSize);
          }}
        />
        <TextAlignmentDropdown
          currentAlignment={formatState.textAlign}
          onAlignmentChange={(textAlign) => {
            onCommand('textAlign', textAlign);
          }}
        />
        
        <div className="toolbar-separator" />
        
        <LinkManager
          onLinkChange={(command, data) => {
            onCommand(command, data as any);
          }}
        />
        <ImageUpload
          onImageInsert={(command, data) => {
            onCommand(command, data as any);
          }}
        />
        <TableEditor
          onCommand={(command, data) => {
            onCommand(command, data as any);
          }}
        />
        
        <div className="toolbar-separator" />
        
        <TextColorPicker
          currentColor={formatState.textColor || '#000000'}
          onColorChange={(color) => {
            onCommand('textColor', color);
          }}
          type="text"
        />
        <TextColorPicker
          currentColor={formatState.backgroundColor || '#ffffff'}
          onColorChange={(color) => {
            onCommand('backgroundColor', color);
          }}
          type="background"
        />
        
        <div className="toolbar-separator" />
        
        <ListFormatting
          listState={formatState.listState || { isInList: false, listType: null, nestingLevel: 0 }}
          onListChange={(command) => {
            onCommand(command);
          }}
        />
        <FindReplace />
        
        <div className="toolbar-separator" />
        
        <button
          className="toolbar-button fullscreen-button"
          onClick={() => onCommand('fullscreen')}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          type="button"
        >
          {isFullscreen ? '🗗' : '🗖'}
        </button>
        
        {/* AutoSave plugin renders here */}
      </div>
    </div>
  );
};
