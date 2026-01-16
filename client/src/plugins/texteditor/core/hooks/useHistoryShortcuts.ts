/**
 * History keyboard shortcuts hook
 * Handles Undo/Redo shortcuts
 */

import { useEffect, RefObject } from 'react';
import { cleanupEmptyFormatElements } from '../../shared/utils/domUtils';
import { HistoryService } from '../services/HistoryService';

export const useHistoryShortcuts = (
  editorRef: RefObject<HTMLDivElement>,
  updateFormatState: () => void,
  historyService?: HistoryService,
  onChange?: (content: string) => void
): void => {
  useEffect(() => {
    const handleHistoryShortcut = (e: KeyboardEvent) => {
      if (!editorRef.current) return;
      if (!(e.ctrlKey || e.metaKey)) return;

      const key = e.key.toLowerCase();
      
      // Handle Undo (Ctrl+Z)
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (historyService) {
          const restoredContent = historyService.undoContent();
          restoredContent.then(content => {
            if (content && editorRef.current) {
              editorRef.current.innerHTML = content;
              cleanupEmptyFormatElements(editorRef.current);
              updateFormatState();
              onChange?.(content);
            }
          });
        } else {
          document.execCommand('undo');
          setTimeout(() => {
            if (editorRef.current) {
              cleanupEmptyFormatElements(editorRef.current);
            }
            updateFormatState();
          }, 0);
        }
      }
      // Handle Redo (Ctrl+Y or Ctrl+Shift+Z)
      else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        if (historyService) {
          const restoredContent = historyService.redoContent();
          restoredContent.then(content => {
            if (content && editorRef.current) {
              editorRef.current.innerHTML = content;
              cleanupEmptyFormatElements(editorRef.current);
              updateFormatState();
              onChange?.(content);
            }
          });
        } else {
          document.execCommand('redo');
          setTimeout(() => {
            if (editorRef.current) {
              cleanupEmptyFormatElements(editorRef.current);
            }
            updateFormatState();
          }, 0);
        }
      }
    };

    const editorElement = editorRef.current;
    if (editorElement) {
      editorElement.addEventListener('keydown', handleHistoryShortcut);
      return () => editorElement.removeEventListener('keydown', handleHistoryShortcut);
    }
  }, [editorRef, updateFormatState, historyService, onChange]);
};
