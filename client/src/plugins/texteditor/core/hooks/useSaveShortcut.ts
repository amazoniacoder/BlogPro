/**
 * Save keyboard shortcut hook
 * Handles Ctrl+S save functionality
 */

import { useEffect, RefObject } from 'react';
import { KEYBOARD_SHORTCUTS } from '../../shared/constants/keyboardConstants';

export const useSaveShortcut = (
  editorRef: RefObject<HTMLDivElement>,
  onSave?: (content: string) => void
): void => {
  useEffect(() => {
    const handleSaveShortcut = (e: KeyboardEvent) => {
      if (!editorRef.current || document.activeElement !== editorRef.current) return;
      if (!(e.ctrlKey || e.metaKey)) return;

      if (e.key.toLowerCase() === KEYBOARD_SHORTCUTS.SAVE) {
        e.preventDefault();
        if (onSave && editorRef.current) {
          onSave(editorRef.current.innerHTML);
        }
      }
    };

    document.addEventListener('keydown', handleSaveShortcut);
    return () => document.removeEventListener('keydown', handleSaveShortcut);
  }, [editorRef, onSave]);
};
