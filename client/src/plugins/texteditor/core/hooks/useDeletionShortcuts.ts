/**
 * Deletion keyboard shortcuts hook
 * Handles Backspace/Delete with smart formatting
 */

import { useEffect, RefObject } from 'react';
import { cleanupEmptyFormatElements } from '../../shared/utils/domUtils';
import { SPECIAL_KEYS } from '../../shared/constants/keyboardConstants';
import { DeletionService } from '../services/DeletionService';


export const useDeletionShortcuts = (
  editorRef: RefObject<HTMLDivElement>,
  updateFormatState: () => void
): void => {
  useEffect(() => {
    const handleDeletionShortcut = (e: KeyboardEvent) => {
      if (!editorRef.current || document.activeElement !== editorRef.current) return;

      switch (e.key) {
        case SPECIAL_KEYS.SPACE:
          // Space key handling is now centralized in FormatResetService
          // This case is kept for backward compatibility but does nothing
          break;
        case SPECIAL_KEYS.BACKSPACE:
          const backspaceResult = DeletionService.handleBackspace();
          if (backspaceResult.shouldResetFormat) {
            setTimeout(() => {
              if (editorRef.current) {
                cleanupEmptyFormatElements(editorRef.current);
              }
              // Format removal now handled by FormatBoundaryService
              updateFormatState();
            }, 0);
          }
          break;
        case SPECIAL_KEYS.DELETE:
          const deleteResult = DeletionService.handleDelete();
          if (deleteResult.shouldResetFormat) {
            setTimeout(() => {
              if (editorRef.current) {
                cleanupEmptyFormatElements(editorRef.current);
              }
              // Format removal now handled by FormatBoundaryService
              updateFormatState();
            }, 0);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleDeletionShortcut);
    return () => document.removeEventListener('keydown', handleDeletionShortcut);
  }, [editorRef, updateFormatState]);
};
