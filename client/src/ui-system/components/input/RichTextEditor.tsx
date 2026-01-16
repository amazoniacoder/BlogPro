/**
 * BlogPro Rich Text Editor Component
 * Universal rich text editor with toolbar
 */

import React, { useRef, useEffect, useState } from 'react';
import { Icon, IconName } from '../../icons/components';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  minHeight = 200,
  maxHeight = 400,
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  };

  const isCommandActive = (command: string) => {
    return document.queryCommandState(command);
  };

  const toolbarButtons: Array<{
    command?: string;
    icon?: IconName;
    title?: string;
    prompt?: string;
    type?: 'separator';
  }> = [
    { command: 'bold', icon: 'edit', title: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: 'edit', title: 'Italic (Ctrl+I)' },
    { command: 'underline', icon: 'edit', title: 'Underline (Ctrl+U)' },
    { command: 'strikeThrough', icon: 'delete', title: 'Strikethrough' },
    { type: 'separator' },
    { command: 'justifyLeft', icon: 'arrow-left', title: 'Align Left' },
    { command: 'justifyCenter', icon: 'gear', title: 'Align Center' },
    { command: 'justifyRight', icon: 'arrow-right', title: 'Align Right' },
    { type: 'separator' },
    { command: 'insertUnorderedList', icon: 'add', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: 'add', title: 'Numbered List' },
    { type: 'separator' },
    { command: 'createLink', icon: 'house', title: 'Insert Link', prompt: 'Enter URL:' },
    { command: 'unlink', icon: 'delete', title: 'Remove Link' }
  ];

  return (
    <div className={`bp-rich-editor ${isFocused ? 'rich-editor--focused' : ''} ${className}`}>
      <div className="rich-editor__toolbar">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return <div key={index} className="rich-editor__separator" />;
          }

          return (
            <button
              key={button.command}
              type="button"
              className={`rich-editor__tool ${
                button.command && isCommandActive(button.command) ? 'rich-editor__tool--active' : ''
              }`}
              onClick={() => {
                if (button.command) {
                  if (button.prompt) {
                    const value = prompt(button.prompt);
                    if (value) execCommand(button.command, value);
                  } else {
                    execCommand(button.command);
                  }
                }
              }}
              title={button.title}
              disabled={disabled}
            >
              {button.icon ? <Icon name={button.icon} size={16} /> : null}
            </button>
          );
        })}
      </div>

      <div
        ref={editorRef}
        className="rich-editor__content"
        contentEditable={!disabled}
        onInput={handleContentChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
