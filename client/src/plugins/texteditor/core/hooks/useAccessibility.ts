import { useEffect, useCallback, useRef } from 'react';
import { KeyboardNavigationService } from '../services/accessibility/KeyboardNavigationService';
import { ScreenReaderService } from '../services/accessibility/ScreenReaderService';
import { AccessibilityConfig } from '../types/AccessibilityTypes';

export interface UseAccessibilityReturn {
  readonly announceFormatChange: (formatType: string, isActive: boolean) => void;
  readonly announceSelectionChange: (selectedText: string) => void;
  readonly announceContentChange: (changeType: 'insert' | 'delete' | 'replace', content?: string) => void;
  readonly announceError: (error: string) => void;
  readonly announceSuccess: (message: string) => void;
  readonly trapFocus: (container: HTMLElement) => void;
  readonly releaseFocus: () => void;
}

const defaultConfig: AccessibilityConfig = {
  enableKeyboardNavigation: true,
  enableScreenReader: true,
  enableFocusTrapping: true,
  announceChanges: true
};

export const useAccessibility = (
  editorRef: React.RefObject<HTMLElement>,
  config: Partial<AccessibilityConfig> = {}
): UseAccessibilityReturn => {
  const finalConfig = { ...defaultConfig, ...config };
  const keyboardServiceRef = useRef<KeyboardNavigationService>();
  const screenReaderServiceRef = useRef<ScreenReaderService>();

  useEffect(() => {
    if (finalConfig.enableKeyboardNavigation) {
      keyboardServiceRef.current = KeyboardNavigationService.getInstance();
    }
    
    if (finalConfig.enableScreenReader) {
      screenReaderServiceRef.current = ScreenReaderService.getInstance();
    }

    // Initialize keyboard navigation when editor is ready
    if (editorRef.current && keyboardServiceRef.current) {
      keyboardServiceRef.current.initializeNavigation(editorRef.current);
    }

    return () => {
      keyboardServiceRef.current?.destroy();
      screenReaderServiceRef.current?.destroy();
    };
  }, [editorRef, finalConfig]);

  const announceFormatChange = useCallback((formatType: string, isActive: boolean): void => {
    if (finalConfig.announceChanges && screenReaderServiceRef.current) {
      screenReaderServiceRef.current.announceFormatChange(formatType, isActive);
    }
  }, [finalConfig.announceChanges]);

  const announceSelectionChange = useCallback((selectedText: string): void => {
    if (finalConfig.announceChanges && screenReaderServiceRef.current) {
      screenReaderServiceRef.current.announceSelectionChange(selectedText);
    }
  }, [finalConfig.announceChanges]);

  const announceContentChange = useCallback((
    changeType: 'insert' | 'delete' | 'replace', 
    content?: string
  ): void => {
    if (finalConfig.announceChanges && screenReaderServiceRef.current) {
      screenReaderServiceRef.current.announceContentChange(changeType, content);
    }
  }, [finalConfig.announceChanges]);

  const announceError = useCallback((error: string): void => {
    if (finalConfig.announceChanges && screenReaderServiceRef.current) {
      screenReaderServiceRef.current.announceError(error);
    }
  }, [finalConfig.announceChanges]);

  const announceSuccess = useCallback((message: string): void => {
    if (finalConfig.announceChanges && screenReaderServiceRef.current) {
      screenReaderServiceRef.current.announceSuccess(message);
    }
  }, [finalConfig.announceChanges]);

  const trapFocus = useCallback((container: HTMLElement): void => {
    if (finalConfig.enableFocusTrapping && keyboardServiceRef.current) {
      keyboardServiceRef.current.trapFocus(container);
    }
  }, [finalConfig.enableFocusTrapping]);

  const releaseFocus = useCallback((): void => {
    if (finalConfig.enableFocusTrapping && keyboardServiceRef.current) {
      keyboardServiceRef.current.releaseFocus();
    }
  }, [finalConfig.enableFocusTrapping]);

  return {
    announceFormatChange,
    announceSelectionChange,
    announceContentChange,
    announceError,
    announceSuccess,
    trapFocus,
    releaseFocus
  };
};
