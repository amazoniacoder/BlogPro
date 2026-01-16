/**
 * List Formatting Component
 * Provides bullet lists, numbered lists, and nesting controls
 */

import React, { useState, useRef, useEffect } from 'react';
import { ListState, ListType } from '../services/ListService';
import './ListFormatting.css';

export interface ListFormattingProps {
  listState?: ListState;
  onListChange?: (command: string) => void;
  onCommand?: (command: string) => void;
  disabled?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

interface ListOption {
  type: ListType;
  label: string;
  command: string;
  shortcut: string;
}

const listOptions: ListOption[] = [
  { type: 'bullet', label: 'Bullet List', command: 'bulletList', shortcut: 'Ctrl+Shift+8' },
  { type: 'numbered', label: 'Numbered List', command: 'numberedList', shortcut: 'Ctrl+Shift+7' }
];

export const ListFormatting: React.FC<ListFormattingProps> = ({
  listState = { isInList: false, listType: 'bullet', nestingLevel: 1 },
  onListChange,
  onCommand,
  disabled = false,
  onClose,
  isModal = false
}) => {
  const handleCommand = onCommand || onListChange || (() => {});
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleListOptionClick = (option: ListOption) => {
    handleCommand(option.command);
    if (isModal) {
      onClose?.();
    } else {
      setIsOpen(false);
    }
  };

  const handleRemoveList = () => {
    handleCommand('removeList');
    if (isModal) {
      onClose?.();
    } else {
      setIsOpen(false);
    }
  };

  const handleIncreaseNesting = () => {
    handleCommand('increaseNesting');
  };

  const handleDecreaseNesting = () => {
    handleCommand('decreaseNesting');
  };

  const getCurrentListLabel = (): string => {
    if (!listState.isInList) return 'Lists';
    return listState.listType === 'bullet' ? 'Bullet List' : 'Numbered List';
  };

  const getCurrentListIcon = (): string => {
    if (!listState.isInList) return '☰';
    return listState.listType === 'bullet' ? '•' : '1.';
  };

  // If in modal mode, render only the panel content
  if (isModal) {
    return (
      <div 
        className="list-formatting__panel"
        role="listbox"
        aria-label="List formatting options"
      >
        <div className="list-section">
          <h4 className="list-section__title">List Types</h4>
          <div className="list-options">
            {listOptions.map((option) => (
              <button
                key={option.type}
                className={`list-option ${
                  listState.isInList && listState.listType === option.type ? 'selected' : ''
                }`}
                onClick={() => handleListOptionClick(option)}
                type="button"
                role="option"
                aria-selected={listState.isInList && listState.listType === option.type}
                aria-label={`${option.label} (${option.shortcut})`}
              >
                <span className="list-option__icon">
                  {option.type === 'bullet' ? '•' : '1.'}
                </span>
                <span className="list-option__content">
                  <span className="list-option__label">{option.label}</span>
                  <span className="list-option__shortcut">{option.shortcut}</span>
                </span>
                {listState.isInList && listState.listType === option.type && (
                  <span className="list-option__check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {listState.isInList && (
          <div className="list-section">
            <h4 className="list-section__title">List Actions</h4>
            <div className="list-actions">
              <button
                className="list-action-button list-action-button--remove"
                onClick={handleRemoveList}
                type="button"
              >
                Remove List
              </button>
            </div>
          </div>
        )}

        <div className="list-section">
          <h4 className="list-section__title">Nesting</h4>
          <div className="list-nesting-info">
            <p className="list-nesting-info__text">
              Use Tab to increase indent, Shift+Tab to decrease
            </p>
            {listState.isInList && (
              <p className="list-nesting-info__current">
                Current level: {listState.nestingLevel}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="list-formatting" ref={dropdownRef}>
      {/* Main List Dropdown */}
      <button
        className={`list-formatting__trigger ${isOpen ? 'open' : ''} ${listState.isInList ? 'active' : ''}`}
        onClick={() => {
          if (disabled) return;
          // Check if mobile and dispatch modal event
          if (window.innerWidth <= 768 && !isModal) {
            document.dispatchEvent(new CustomEvent('openPluginModal', {
              detail: { plugin: 'list-formatting' }
            }));
            return;
          }
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
        type="button"
        aria-label={`Lists: ${getCurrentListLabel()}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="list-formatting__icon">
          {getCurrentListIcon()}
        </span>

      </button>

      {/* Nesting Controls (visible when in list) */}
      {listState.isInList && (
        <div className="list-formatting__nesting">
          <button
            className="list-formatting__nest-button"
            onClick={handleDecreaseNesting}
            disabled={disabled || listState.nestingLevel <= 1}
            type="button"
            title="Decrease Indent (Shift+Tab)"
            aria-label="Decrease list indentation"
          >
            ◀
          </button>
          <span className="list-formatting__nest-level">
            {listState.nestingLevel}
          </span>
          <button
            className="list-formatting__nest-button"
            onClick={handleIncreaseNesting}
            disabled={disabled || listState.nestingLevel >= 5}
            type="button"
            title="Increase Indent (Tab)"
            aria-label="Increase list indentation"
          >
            ▶
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="list-formatting__panel"
          role="listbox"
          aria-label="List formatting options"
        >
          <div className="list-section">
            <h4 className="list-section__title">List Types</h4>
            <div className="list-options">
              {listOptions.map((option) => (
                <button
                  key={option.type}
                  className={`list-option ${
                    listState.isInList && listState.listType === option.type ? 'selected' : ''
                  }`}
                  onClick={() => handleListOptionClick(option)}
                  type="button"
                  role="option"
                  aria-selected={listState.isInList && listState.listType === option.type}
                  aria-label={`${option.label} (${option.shortcut})`}
                >
                  <span className="list-option__icon">
                    {option.type === 'bullet' ? '•' : '1.'}
                  </span>
                  <span className="list-option__content">
                    <span className="list-option__label">{option.label}</span>
                    <span className="list-option__shortcut">{option.shortcut}</span>
                  </span>
                  {listState.isInList && listState.listType === option.type && (
                    <span className="list-option__check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {listState.isInList && (
            <div className="list-section">
              <h4 className="list-section__title">List Actions</h4>
              <div className="list-actions">
                <button
                  className="list-action-button list-action-button--remove"
                  onClick={handleRemoveList}
                  type="button"
                >
                  Remove List
                </button>
              </div>
            </div>
          )}

          <div className="list-section">
            <h4 className="list-section__title">Nesting</h4>
            <div className="list-nesting-info">
              <p className="list-nesting-info__text">
                Use Tab to increase indent, Shift+Tab to decrease
              </p>
              {listState.isInList && (
                <p className="list-nesting-info__current">
                  Current level: {listState.nestingLevel}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
