/**
 * Refactored keyboard shortcuts hook
 * Composes focused hooks for better maintainability
 */

import { RefObject } from 'react';
import { HistoryService } from '../services/HistoryService';
import { useFormatShortcuts } from './useFormatShortcuts';
import { useHistoryShortcuts } from './useHistoryShortcuts';
import { useDeletionShortcuts } from './useDeletionShortcuts';
import { useSaveShortcut } from './useSaveShortcut';

export const useKeyboardShortcuts = (
  editorRef: RefObject<HTMLDivElement>,
  updateFormatState: () => void,
  onSave?: (content: string) => void,
  historyService?: HistoryService,
  onChange?: (content: string) => void
): void => {
  // Compose focused hooks
  useFormatShortcuts(editorRef, updateFormatState);
  useHistoryShortcuts(editorRef, updateFormatState, historyService, onChange);
  useDeletionShortcuts(editorRef, updateFormatState);
  useSaveShortcut(editorRef, onSave);
};

