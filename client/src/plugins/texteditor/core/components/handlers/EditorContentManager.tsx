import React, { useCallback, useEffect } from 'react';
import { normalizeContent, cleanupEmptyFormatElements } from '../../../shared/utils/domUtils';
import { InputValidator } from '../../../shared/utils/InputValidator';
import { ContentSerializationService } from '../../services/content/ContentSerializationService';
import { MediaService } from '../../services/media/MediaService';
import { TableService } from '../../services/TableService';
import { HistoryService } from '../../services/HistoryService';

export interface ContentManagerProps {
  readonly editorRef: React.RefObject<HTMLDivElement>;
  readonly initialContent: string;
  readonly onChange?: (content: string) => void;
  readonly setContent: (content: string) => void;
  readonly setError: (error: string | null) => void;
  readonly updateFormatState: () => void;
  readonly historyService: HistoryService;
  readonly isTypingRef: React.MutableRefObject<boolean>;
}

export const useEditorContentManager = ({
  editorRef,
  initialContent,
  onChange,
  setContent,
  setError,
  updateFormatState,
  historyService,
  isTypingRef
}: ContentManagerProps) => {
  // Initialize content properly with format preservation
  useEffect(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      
      if (initialContent) {
        if (InputValidator.validateContent(initialContent)) {
          const deserializedContent = ContentSerializationService.deserializeContent(initialContent);
          
          // Only update if content is actually different
          if (currentContent !== deserializedContent) {
            editorRef.current.innerHTML = deserializedContent;
            normalizeContent(editorRef.current);
          }
        } else {
          setError('Invalid initial content provided');
        }
      } else {
        // Clear editor when initialContent is empty (only if not already empty)
        if (currentContent !== '<p><br></p>' && currentContent.trim() !== '') {
          editorRef.current.innerHTML = '<p><br></p>';
        }
      }
      
      // Make all existing images resizable
      MediaService.makeAllImagesResizable(editorRef.current);
      
      // Initialize existing tables
      TableService.initializeExistingTables(editorRef.current);
      
      // Save initial state for undo/redo
      if (historyService) {
        historyService.saveState(editorRef.current.innerHTML);
      }
    }
  }, [initialContent, historyService, editorRef, setError]);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    isTypingRef.current = true;
    
    const newContent = e.currentTarget.innerHTML;
    const previousContent = editorRef.current?.innerHTML || '';
    
    console.log('🔄 EditorContentManager: handleInput triggered', {
      eventType: e.type,
      newContentLength: newContent.length,
      previousContentLength: previousContent.length,
      contentPreview: newContent.substring(0, 50),
      isContentDifferent: newContent !== previousContent,
      isDeletion: newContent.length < previousContent.length
    });
    
    // Validate content before processing
    if (!InputValidator.validateContent(newContent)) {
      console.error('🔧 EditorContentManager: Invalid content detected');
      setError('Invalid content detected');
      return;
    }
    
    setContent(newContent);
    
    // Pass raw content to onChange - serialization happens only on save
    onChange?.(newContent);
    
    // Clean up empty elements and update format state synchronously
    if (editorRef.current) {
      cleanupEmptyFormatElements(editorRef.current);
    }
    isTypingRef.current = false;
    updateFormatState();
  }, [onChange, updateFormatState, setContent, setError, isTypingRef, editorRef]);

  // Handle selection changes to update format state
  const handleSelectionChange = useCallback(() => {
    if (!isTypingRef.current) {
      updateFormatState();
    }
  }, [updateFormatState, isTypingRef]);

  // Add selection change listener
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  const handleClick = useCallback(() => {
    // Allow clicking to position cursor anywhere in the editor
    // This ensures users can click below lists to position cursor outside
    setTimeout(() => {
      updateFormatState();
    }, 0);
  }, [updateFormatState]);

  return {
    handleInput,
    handleClick
  };
};
