/**
 * EditorCore Component
 * 
 * Pure contentEditable element with minimal responsibilities.
 */

import React, { forwardRef } from 'react';

export interface EditorCoreProps {
  readonly content?: string;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly spellCheckEnabled?: boolean;
  readonly className?: string;
  readonly onInput?: (event: React.FormEvent<HTMLDivElement>) => void;
  readonly onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  readonly onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  readonly onPaste?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
  readonly onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void;
  readonly error?: string | null;
}

export const EditorCore = forwardRef<HTMLDivElement, EditorCoreProps>(({
  placeholder = 'Start typing...',
  readOnly = false,
  spellCheckEnabled = true,
  className = '',
  onInput,
  onKeyDown,
  onClick,
  onPaste,
  onContextMenu,
  error
}, ref) => {
  return (
    <>
      <div
        ref={ref}
        contentEditable={!readOnly}
        className={`editor-content ${spellCheckEnabled ? 'spell-check-enabled' : ''} ${className}`}
        role="textbox"
        aria-label="Rich text editor with formatting support. Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline."
        aria-multiline="true"
        aria-describedby={error ? 'editor-error' : 'editor-help'}
        aria-expanded="false"
        aria-autocomplete="none"
        spellCheck={spellCheckEnabled}
        lang="en-US"
        tabIndex={0}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onClick={onClick}
        onPaste={onPaste}
        onContextMenu={onContextMenu}
        // Additional event listeners for better deletion detection
        onKeyUp={(e) => {
          console.log('⌨️ EditorCore: keyUp event', {
            key: e.key,
            code: e.code,
            contentLength: (e.target as HTMLDivElement).innerHTML?.length || 0
          });
          // Trigger input handler for deletion keys
          if (['Backspace', 'Delete'].includes(e.key)) {
            console.log('🗑️ EditorCore: Deletion key detected, triggering input handler');
            onInput?.(e as any);
          }
        }}
        onBeforeInput={(e) => {
          console.log('🔄 EditorCore: beforeInput event', {
            inputType: (e.nativeEvent as InputEvent).inputType,
            data: (e.nativeEvent as InputEvent).data
          });
        }}
        suppressContentEditableWarning
        data-placeholder={placeholder}
      />
      
      {/* Hidden help text for screen readers */}
      <div id="editor-help" className="sr-only">
        Rich text editor. Use keyboard shortcuts: Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline, Ctrl+Z for undo, Ctrl+Y for redo, Ctrl+S to save.
      </div>
    </>
  );
});
