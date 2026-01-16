import { Icon } from '../../../../ui-system/icons/components';
/**
 * Spell Check Indicator Component
 * 
 * Professional spell check error highlighting with suggestion popups.
 * Provides real-time error detection and correction interface.
 * 
 * Features:
 * - Error highlighting overlay
 * - Suggestion popup with corrections
 * - Keyboard navigation support
 * - Add to dictionary functionality
 * - Accessibility compliant
 * 
 * @author BlogPro Text Editor Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types/spellCheckTypes';
import { ServiceFactory } from '../services/ServiceFactory';
import { calculateContextMenuPosition, getMenuDimensions } from '../../shared/utils/positionUtils';
import './SpellCheckIndicator.css';

interface SpellCheckIndicatorProps {
  /** Target editor element */
  editorElement: HTMLElement | null;
  /** Current content */
  content: string;
  /** Detected language */
  language: Language;
  /** Spell check enabled state */
  enabled: boolean;
  /** Callback when word is corrected */
  onCorrection?: (original: string, correction: string) => void;
  /** Callback when word is added to dictionary */
  onAddToDictionary?: (word: string) => void;
  /** Callback when word is ignored */
  onIgnoreWord?: (word: string) => void;
}

// Combined error type that includes both spelling and grammar errors
interface CombinedError {
  word: string;
  start: number;
  end: number;
  language: Language;
  type?: 'spelling' | 'grammar';
  suggestions?: string[];
  confidence?: number;
  message?: string;
  explanation?: string;
  severity?: string;
  ruleId?: string;
  context?: string;
  subtype?: string;
}

interface SuggestionPopup {
  visible: boolean;
  x: number;
  y: number;
  error: CombinedError | null;
  suggestions: string[];
}

const SpellCheckIndicator: React.FC<SpellCheckIndicatorProps> = ({
  editorElement,
  content,
  language,
  enabled,
  onCorrection,
  onAddToDictionary,
  onIgnoreWord
}) => {
  const [errors, setErrors] = useState<CombinedError[]>([]);
  const [popup, setPopup] = useState<SuggestionPopup>({
    visible: false,
    x: 0,
    y: 0,
    error: null,
    suggestions: []
  });

  const [isProcessing, setIsProcessing] = useState(false);
  
  const grammarCheckService = useRef<any>(null);
  const spellCheckService = useRef<any>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Initialize minimal services
  useEffect(() => {
    const initServices = async () => {
      try {
        // Use GrammarCheckService directly since it's not in ServiceFactory
        const { GrammarCheckService } = await import('../services/GrammarCheckService');
        grammarCheckService.current = new GrammarCheckService();
        
        spellCheckService.current = await ServiceFactory.getUnifiedSpellCheckService();
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };
    initServices();
  }, []);

  // Debounced spell checking
  const performSpellCheck = useCallback(async (text: string) => {
    if (!enabled || !spellCheckService.current || !text.trim()) {

      setErrors([]);
      return;
    }

    // Extract plain text from HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    tempDiv.innerHTML = tempDiv.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    

    setIsProcessing(true);
    
    try {
      // Use combined spell + grammar checking

      
      if (grammarCheckService.current && grammarCheckService.current.checkTextWithGrammar) {
        const result = await grammarCheckService.current.checkTextWithGrammar(plainText, language);
        
        // Convert grammar errors to spell check format for UI compatibility
        const combinedErrors = [
          ...result.spelling.errors,
          ...result.grammar.errors.map((grammarError: any) => ({
            word: grammarError.text,
            start: grammarError.start,
            end: grammarError.end,
            type: 'grammar' as const,
            subtype: grammarError.subtype,
            suggestions: grammarError.suggestions,
            language: result.grammar.language,
            confidence: grammarError.confidence,
            message: grammarError.message,
            explanation: grammarError.explanation,
            severity: grammarError.severity,
            ruleId: grammarError.ruleId,
            context: grammarError.context
          }))
        ];
        

        
        setErrors(combinedErrors);
      } else if (spellCheckService.current && spellCheckService.current.checkText) {
        // Fallback to spell check only
        const result = await spellCheckService.current.checkText(plainText, language);

        setErrors(result.errors);
      } else {

        setErrors([]);
      }
      
      // Analytics moved to parent component
    } catch (error: any) {

      setErrors([]);
    } finally {
      setIsProcessing(false);
    }
  }, [enabled, language]);

  // Automatic spell check on content change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (enabled && content.trim()) {
        performSpellCheck(content);
      } else {
        setErrors([]);
      }
    }, 1000); // Increased delay to 1 second to be less aggressive

    return () => clearTimeout(timeoutId);
  }, [content, enabled, performSpellCheck]);

  // Handle error click for suggestions
  const handleErrorClick = useCallback(async (error: CombinedError, element: HTMLElement, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      let suggestions: string[] = [];
      
      if (error.type === 'grammar') {
        // For grammar errors, use suggestions from the error itself
        suggestions = error.suggestions || [];
      } else if (spellCheckService.current) {
        // For spelling errors, get suggestions from spell check service
        suggestions = await spellCheckService.current.getSuggestions(error.word, error.language);
      }
      
      const menuDimensions = getMenuDimensions(popupRef.current || undefined);
      const position = calculateContextMenuPosition(element, menuDimensions);
      
      setPopup({
        visible: true,
        x: position.x,
        y: position.y,
        error,
        suggestions
      });
    } catch (err) {

    }
  }, []);

  // Apply correction using editor's proper API (supports hyphenated words)
  const applyCorrection = useCallback((original: string, correction: string) => {

    
    // Find all error elements for this word (may be multiple spans for hyphenated words)
    const errorElements = editorElement?.querySelectorAll('.spell-error-highlight');
    const targetElements: HTMLElement[] = [];
    
    errorElements?.forEach(element => {
      const dataWord = element.getAttribute('data-word');
      if (dataWord === original) {
        targetElements.push(element as HTMLElement);
      }
    });
    

    
    if (targetElements.length > 0) {
      // For hyphenated words, we need to replace all parts and merge them
      if (targetElements.length === 1) {
        // Single element - simple replacement
        const success = ServiceFactory.getTextReplacementService()
          .replaceSpellError(targetElements[0], correction);
        
        if (success) {

        } else {

        }
      } else {
        // Multiple elements - replace with single corrected word
        const firstElement = targetElements[0];
        const parent = firstElement.parentNode;
        
        if (parent) {
          // Create new text node with correction
          const correctionNode = document.createTextNode(correction);
          
          // Replace first element with correction
          parent.replaceChild(correctionNode, firstElement);
          
          // Remove remaining elements
          for (let i = 1; i < targetElements.length; i++) {
            const elementParent = targetElements[i].parentNode;
            if (elementParent) {
              elementParent.removeChild(targetElements[i]);
            }
          }
          

        }
      }
      
      // Trigger content update through parent callback
      if (onCorrection) {
        onCorrection(original, correction);
      }
      
      // Learn from correction
      if (spellCheckService.current) {
        spellCheckService.current.learnCorrection(original, correction, language);
      }
    } else {

    }
    
    setPopup(prev => ({ ...prev, visible: false }));
  }, [editorElement, onCorrection, language]);

  // Add word to dictionary - delegate to parent
  const addToDictionary = useCallback((word: string) => {
    onAddToDictionary?.(word);
    setPopup(prev => ({ ...prev, visible: false }));
  }, [onAddToDictionary]);

  // Ignore word
  const ignoreWord = useCallback((word: string) => {
    onIgnoreWord?.(word);
    setPopup(prev => ({ ...prev, visible: false }));
  }, [onIgnoreWord]);

  // Close popup on outside click and adjust position when visible
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setPopup(prev => ({ ...prev, visible: false }));
      }
    };

    if (popup.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      

      
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [popup.visible, popup.error, editorElement]);

  // Keyboard navigation for popup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!popup.visible) return;

      switch (event.key) {
        case 'Escape':
          setPopup(prev => ({ ...prev, visible: false }));
          break;
        case 'Enter':
          if (popup.suggestions.length > 0) {
            applyCorrection(popup.error?.word || '', popup.suggestions[0]);
          }
          break;
      }
    };

    if (popup.visible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [popup.visible, popup.suggestions, popup.error, applyCorrection]);

  // Create text highlighting using existing DOM APIs with improved cursor preservation
  useEffect(() => {
    if (!editorElement || !enabled) {
      // Remove existing highlights if editor exists
      if (editorElement) {
        const existingHighlights = editorElement.querySelectorAll('.spell-error-highlight');
        existingHighlights.forEach(el => {
          const parent = el.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent || ''), el);
          }
        });
      }
      return;
    }

    // Save current cursor position with more detailed information
    const selection = window.getSelection();
    let cursorInfo: { node: Node; offset: number; isAtEnd: boolean } | null = null;
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        cursorInfo = {
          node: range.startContainer,
          offset: range.startOffset,
          isAtEnd: range.startOffset === (range.startContainer.textContent?.length || 0)
        };
      }
    }

    // Remove existing highlights
    const existingHighlights = editorElement.querySelectorAll('.spell-error-highlight');
    existingHighlights.forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ''), el);
      }
    });

    if (errors.length === 0) {
      // Restore cursor position if no errors
      if (cursorInfo && selection) {
        try {
          const range = document.createRange();
          range.setStart(cursorInfo.node, cursorInfo.offset);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e: any) {
          // Ignore if range is no longer valid
        }
      }
      return;
    }

    // Highlight errors by wrapping text in spans
    errors.forEach((error) => {
      highlightTextError(error, editorElement);
    });

    // Restore cursor position after highlighting with improved logic
    if (cursorInfo && selection) {
      try {
        // Find the text node that corresponds to our saved position
        const walker = document.createTreeWalker(
          editorElement,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let currentNode;
        let found = false;
        
        while (currentNode = walker.nextNode()) {
          if (currentNode === cursorInfo.node || 
              (currentNode.textContent && cursorInfo.node.textContent && 
               currentNode.textContent.includes(cursorInfo.node.textContent))) {
            const range = document.createRange();
            const offset = cursorInfo.isAtEnd ? 
              (currentNode.textContent?.length || 0) : 
              Math.min(cursorInfo.offset, currentNode.textContent?.length || 0);
            
            range.setStart(currentNode, offset);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            found = true;
            break;
          }
        }
        
        // If we couldn't find the exact position, place cursor at the end of editor
        if (!found) {
          const range = document.createRange();
          range.selectNodeContents(editorElement);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (e: any) {
        // Fallback: place cursor at end of editor
        try {
          const range = document.createRange();
          range.selectNodeContents(editorElement);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (fallbackError) {
          // If even fallback fails, do nothing
        }
      }
    }

  }, [editorElement, enabled, errors]);

  // Helper function to highlight text errors using DOM text manipulation (supports hyphenated words)
  const highlightTextError = useCallback((error: CombinedError, editor: HTMLElement) => {

    
    const walker = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let textNode;
    let cumulativePosition = 0;
    const nodesToProcess: Array<{node: Text, start: number, end: number}> = [];
    
    // First pass: collect all text nodes that intersect with the error
    while (textNode = walker.nextNode()) {
      const nodeText = textNode.textContent || '';
      const nodeStart = cumulativePosition;
      const nodeEnd = cumulativePosition + nodeText.length;
      
      if (error.start < nodeEnd && error.end > nodeStart) {
        nodesToProcess.push({
          node: textNode as Text,
          start: nodeStart,
          end: nodeEnd
        });
      }
      
      cumulativePosition += nodeText.length;
    }
    

    
    // Second pass: process nodes in reverse order to avoid DOM position issues
    for (let i = nodesToProcess.length - 1; i >= 0; i--) {
      const {node, start: nodeStart} = nodesToProcess[i];
      const nodeText = node.textContent || '';
      
      const relativeStart = Math.max(0, error.start - nodeStart);
      const relativeEnd = Math.min(nodeText.length, error.end - nodeStart);
      
      const beforeText = nodeText.substring(0, relativeStart);
      const errorText = nodeText.substring(relativeStart, relativeEnd);
      const afterText = nodeText.substring(relativeEnd);
      
      const parent = node.parentNode;
      if (parent && errorText) {

        
        // Create highlight span
        const highlight = document.createElement('span');
        highlight.className = `spell-error-highlight ${error.type === 'grammar' ? 'spell-error--grammar' : 'spell-error'}`;
        highlight.setAttribute('data-word', error.word);
        highlight.setAttribute('data-original-text', errorText);
        highlight.textContent = errorText;
        highlight.addEventListener('click', (e: any) => handleErrorClick(error, highlight, e as MouseEvent));
        
        // Replace text node with highlighted version
        if (beforeText) parent.insertBefore(document.createTextNode(beforeText), node);
        parent.insertBefore(highlight, node);
        if (afterText) parent.insertBefore(document.createTextNode(afterText), node);
        parent.removeChild(node);
      }
    }
  }, [handleErrorClick]);

  // Don't render if not enabled
  if (!enabled) {
    return null;
  }

  return (
    <>
      {/* Processing indicator */}
      {isProcessing && (
        <div className="spell-check-processing">
          <span className="spell-check-processing__icon">⏳</span>
          <span className="spell-check-processing__text">Checking spelling...</span>
        </div>
      )}

      {/* Suggestion popup */}
      {popup.visible && popup.error && (
        <div
          ref={popupRef}
          className="spell-check-context-menu"
          style={{
            left: popup.x,
            top: popup.y
          }}
          role="menu"
          aria-label="Spell check suggestions"
        >
          {/* Grammar error info */}
          {popup.error.type === 'grammar' && (
            <>
              <div className="spell-check-context-menu__header">
                Грамматическая ошибка:
              </div>
              <div className="spell-check-context-menu__item spell-check-context-menu__item--info">
                <span className="spell-check-context-menu__icon">⚠️</span>
                {popup.error.message || 'Грамматическая ошибка'}
              </div>
              {popup.error.explanation && (
                <div className="spell-check-context-menu__item spell-check-context-menu__item--explanation">
                  <span className="spell-check-context-menu__icon">💡</span>
                  {popup.error.explanation}
                </div>
              )}
              {popup.error.suggestions && popup.error.suggestions.length > 0 && (
                <>
                  <div className="spell-check-context-menu__separator" />
                  <div className="spell-check-context-menu__header">
                    Предложения:
                  </div>
                  {popup.error.suggestions.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion}
                      className="spell-check-context-menu__item spell-check-context-menu__item--suggestion"
                      onClick={() => applyCorrection(popup.error!.word, suggestion)}
                      role="menuitem"
                      tabIndex={0}
                    >
                      <span className="spell-check-context-menu__icon">✓</span>
                      {suggestion}
                    </button>
                  ))}
                </>
              )}
              <div className="spell-check-context-menu__separator" />
            </>
          )}

          {/* Spelling suggestions */}
          {popup.error.type !== 'grammar' && popup.suggestions.length > 0 && (
            <>
              <div className="spell-check-context-menu__header">
                Предложения для "{popup.error.word}":
              </div>
              {popup.suggestions.slice(0, 5).map((suggestion) => (
                <button
                  key={suggestion}
                  className="spell-check-context-menu__item spell-check-context-menu__item--suggestion"
                  onClick={() => applyCorrection(popup.error!.word, suggestion)}
                  role="menuitem"
                  tabIndex={0}
                >
                  <span className="spell-check-context-menu__icon">✓</span>
                  {suggestion}
                </button>
              ))}
              <div className="spell-check-context-menu__separator" />
            </>
          )}

          {/* No suggestions for spelling errors */}
          {popup.error.type !== 'grammar' && popup.suggestions.length === 0 && (
            <>
              <div className="spell-check-context-menu__item spell-check-context-menu__item--disabled">
                <Icon name="delete" size={16} />
                Предложения не найдены
              </div>
              <div className="spell-check-context-menu__separator" />
            </>
          )}

          {/* Actions - only for spelling errors */}
          {popup.error.type !== 'grammar' && (
            <>
              <button
                className="spell-check-context-menu__item spell-check-context-menu__item--action"
                onClick={() => addToDictionary(popup.error!.word)}
                role="menuitem"
                tabIndex={0}
              >
                <Icon name="book" size={16} />
                Добавить в словарь
              </button>

              <button
                className="spell-check-context-menu__item spell-check-context-menu__item--action"
                onClick={() => ignoreWord(popup.error!.word)}
                role="menuitem"
                tabIndex={0}
              >
                <span className="spell-check-context-menu__icon">👁️</span>
                Игнорировать слово
              </button>
            </>
          )}

          {/* Language info */}
          <div className="spell-check-context-menu__separator" />
          <div className="spell-check-context-menu__item spell-check-context-menu__item--info">
            <span className="spell-check-context-menu__icon">🌐</span>
            Язык: {popup.error.language.toUpperCase()}
            {popup.error.type === 'grammar' && popup.error.ruleId && (
              <span className="spell-check-context-menu__rule-id"> | {popup.error.ruleId}</span>
            )}
          </div>
        </div>
      )}

      {/* Error count indicator */}
      {errors.length > 0 && (
        <div className="spell-check-error-count">
          <span className="spell-check-error-count__icon">📝</span>
          <span className="spell-check-error-count__text">
            {(() => {
              const spellingErrors = errors.filter(e => e.type !== 'grammar').length;
              const grammarErrors = errors.filter(e => e.type === 'grammar').length;
              
              if (spellingErrors > 0 && grammarErrors > 0) {
                return `${spellingErrors} spelling, ${grammarErrors} grammar`;
              } else if (spellingErrors > 0) {
                return `${spellingErrors} spelling ${spellingErrors === 1 ? 'error' : 'errors'}`;
              } else {
                return `${grammarErrors} grammar ${grammarErrors === 1 ? 'error' : 'errors'}`;
              }
            })()
            }
          </span>
        </div>
      )}
      

    </>
  );
};

export default SpellCheckIndicator;
