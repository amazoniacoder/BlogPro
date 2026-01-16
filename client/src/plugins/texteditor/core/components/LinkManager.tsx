/**
 * Link Manager Component
 * Provides link insertion, editing, and removal functionality
 */

import React, { useState, useRef, useEffect } from 'react';
import { LinkService, LinkData, LinkValidationResult } from '../services/media/LinkService';
import './LinkManager.css';

export interface LinkManagerProps {
  onLinkChange: (command: string, data?: LinkData) => void;
  disabled?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const LinkManager: React.FC<LinkManagerProps> = ({
  onLinkChange,
  disabled = false,
  onClose,
  isModal = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [linkData, setLinkData] = useState<LinkData>({
    url: '',
    text: '',
    target: '_self'
  });
  const [validation, setValidation] = useState<LinkValidationResult>({ isValid: true });
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

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

  // Focus URL input when dropdown opens
  useEffect(() => {
    if (isOpen && urlInputRef.current) {
      setTimeout(() => urlInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;

    // Check if mobile and dispatch modal event
    if (window.innerWidth <= 768) {
      document.dispatchEvent(new CustomEvent('openPluginModal', {
        detail: { plugin: 'link-manager' }
      }));
      return;
    }

    if (isOpen) {
      setIsOpen(false);
      return;
    }

    // Save current selection before opening dialog
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      try {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
      } catch (error) {
        // Fallback for test environments where cloneRange might not be available
        savedSelectionRef.current = selection.getRangeAt(0);
      }
    }

    // Check if we're editing an existing link
    const existingLink = LinkService.findLinkAtSelection();
    if (existingLink) {
      const existingData = LinkService.getLinkData(existingLink);
      setLinkData(existingData);
      setIsEditing(true);
    } else {
      // Get selected text for new link
      const selectedText = selection?.toString() || '';
      setLinkData({
        url: '',
        text: selectedText,
        target: '_self'
      });
      setIsEditing(false);
    }

    setValidation({ isValid: true });
    setIsOpen(true);
  };

  const handleUrlChange = (url: string) => {
    setLinkData(prev => ({ ...prev, url }));
    
    if (url.trim()) {
      const result = LinkService.validateUrl(url);
      setValidation(result);
    } else {
      setValidation({ isValid: true });
    }
  };

  const handleApplyLink = () => {
    const result = LinkService.validateUrl(linkData.url);
    setValidation(result);

    if (!result.isValid) return;

    // Restore saved selection before applying link
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }

    const finalLinkData: LinkData = {
      ...linkData,
      url: result.normalizedUrl || linkData.url
    };

    if (isEditing) {
      onLinkChange('editLink', finalLinkData);
    } else {
      onLinkChange('insertLink', finalLinkData);
    }

    if (isModal) {
      onClose?.();
    } else {
      setIsOpen(false);
    }
    
    // Focus back to editor after a short delay
    setTimeout(() => {
      const editor = document.querySelector('.editor-content') as HTMLElement;
      if (editor) {
        editor.focus();
      }
    }, 100);
  };

  const handleRemoveLink = () => {
    onLinkChange('removeLink');
    if (isModal) {
      onClose?.();
    } else {
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && validation.isValid && linkData.url.trim()) {
      e.preventDefault();
      handleApplyLink();
    }
  };

  // If in modal mode, render only the panel content
  if (isModal) {
    return (
      <div 
        className="link-manager__panel"
        role="dialog"
        aria-label="Link editor"
      >
        <div className="link-manager__form">
          <div className="link-manager__field">
            <label htmlFor="link-url" className="link-manager__label">
              URL *
            </label>
            <input
              ref={urlInputRef}
              id="link-url"
              type="text"
              className={`link-manager__input ${!validation.isValid ? 'error' : ''}`}
              value={linkData.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://example.com"
              aria-describedby={!validation.isValid ? 'url-error' : undefined}
            />
            {!validation.isValid && (
              <span id="url-error" className="link-manager__error">
                {validation.error}
              </span>
            )}
          </div>

          <div className="link-manager__field">
            <label htmlFor="link-text" className="link-manager__label">
              Link Text
            </label>
            <input
              id="link-text"
              type="text"
              className="link-manager__input"
              value={linkData.text}
              onChange={(e) => setLinkData(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Link text (optional)"
            />
          </div>

          <div className="link-manager__field">
            <label htmlFor="link-target" className="link-manager__label">
              Target
            </label>
            <select
              id="link-target"
              className="link-manager__select"
              value={linkData.target}
              onChange={(e) => setLinkData(prev => ({ 
                ...prev, 
                target: e.target.value as '_blank' | '_self' 
              }))}
            >
              <option value="_self">Same window</option>
              <option value="_blank">New window</option>
            </select>
          </div>
        </div>

        <div className="link-manager__actions">
          <button
            className="link-manager__button link-manager__button--primary"
            onClick={handleApplyLink}
            disabled={!validation.isValid || !linkData.url.trim()}
            type="button"
          >
            {isEditing ? 'Update' : 'Insert'} Link
          </button>
          
          {isEditing && (
            <button
              className="link-manager__button link-manager__button--danger"
              onClick={handleRemoveLink}
              type="button"
            >
              Remove Link
            </button>
          )}
          
          <button
            className="link-manager__button link-manager__button--secondary"
            onClick={() => onClose?.()}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="link-manager" ref={dropdownRef}>
      <button
        className={`link-manager__trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        type="button"
        aria-label="Insert or edit link"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Insert Link (Ctrl+K)"
      >
        <span className="link-manager__icon">🔗</span>
      </button>

      {isOpen && (
        <div 
          className="link-manager__panel"
          role="dialog"
          aria-label="Link editor"
        >
          <div className="link-manager__header">
            <h3 className="link-manager__title">
              {isEditing ? 'Edit Link' : 'Insert Link'}
            </h3>
          </div>

          <div className="link-manager__form">
            <div className="link-manager__field">
              <label htmlFor="link-url" className="link-manager__label">
                URL *
              </label>
              <input
                ref={urlInputRef}
                id="link-url"
                type="text"
                className={`link-manager__input ${!validation.isValid ? 'error' : ''}`}
                value={linkData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://example.com"
                aria-describedby={!validation.isValid ? 'url-error' : undefined}
              />
              {!validation.isValid && (
                <span id="url-error" className="link-manager__error">
                  {validation.error}
                </span>
              )}
            </div>

            <div className="link-manager__field">
              <label htmlFor="link-text" className="link-manager__label">
                Link Text
              </label>
              <input
                id="link-text"
                type="text"
                className="link-manager__input"
                value={linkData.text}
                onChange={(e) => setLinkData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Link text (optional)"
              />
            </div>

            <div className="link-manager__field">
              <label htmlFor="link-target" className="link-manager__label">
                Target
              </label>
              <select
                id="link-target"
                className="link-manager__select"
                value={linkData.target}
                onChange={(e) => setLinkData(prev => ({ 
                  ...prev, 
                  target: e.target.value as '_blank' | '_self' 
                }))}
              >
                <option value="_self">Same window</option>
                <option value="_blank">New window</option>
              </select>
            </div>
          </div>

          <div className="link-manager__actions">
            <button
              className="link-manager__button link-manager__button--primary"
              onClick={handleApplyLink}
              disabled={!validation.isValid || !linkData.url.trim()}
              type="button"
            >
              {isEditing ? 'Update' : 'Insert'} Link
            </button>
            
            {isEditing && (
              <button
                className="link-manager__button link-manager__button--danger"
                onClick={handleRemoveLink}
                type="button"
              >
                Remove Link
              </button>
            )}
            
            <button
              className="link-manager__button link-manager__button--secondary"
              onClick={() => onClose?.()}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
