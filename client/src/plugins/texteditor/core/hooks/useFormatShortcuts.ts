/**
 * Format keyboard shortcuts hook
 * Handles Bold, Italic, Underline shortcuts
 */

import { useEffect, RefObject } from 'react';
import { ServiceFactory } from '../services/ServiceFactory';
import { KEYBOARD_SHORTCUTS } from '../../shared/constants/keyboardConstants';

export const useFormatShortcuts = (
  editorRef: RefObject<HTMLDivElement>,
  updateFormatState: () => void
): void => {
  useEffect(() => {
    const handleFormatShortcut = async (e: KeyboardEvent) => {
      if (!editorRef.current || document.activeElement !== editorRef.current) return;
      if (!(e.ctrlKey || e.metaKey)) return;

      const formatService = await ServiceFactory.getUnifiedFormatService();
      
      switch (e.key.toLowerCase()) {
        case KEYBOARD_SHORTCUTS.BOLD:
          e.preventDefault();
          formatService.applyBold();
          setTimeout(() => updateFormatState(), 0);
          break;
        case KEYBOARD_SHORTCUTS.ITALIC:
          e.preventDefault();
          formatService.applyItalic();
          setTimeout(() => updateFormatState(), 0);
          break;
        case KEYBOARD_SHORTCUTS.UNDERLINE:
          e.preventDefault();
          formatService.applyUnderline();
          setTimeout(() => updateFormatState(), 0);
          break;
      }
    };

    document.addEventListener('keydown', handleFormatShortcut);
    return () => document.removeEventListener('keydown', handleFormatShortcut);
  }, [editorRef, updateFormatState]);
};
