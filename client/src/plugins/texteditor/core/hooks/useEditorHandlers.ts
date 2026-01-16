/**
 * Editor Handlers Hook
 * 
 * Consolidates all editor event handlers into a single hook.
 */

import { useRef, useState, useEffect } from 'react';
import { useEditorKeyboardHandler } from '../components/handlers/EditorKeyboardHandler';
import { useEditorPasteHandler } from '../components/handlers/EditorPasteHandler';
import { useEditorContentManager } from '../components/handlers/EditorContentManager';

export interface UseEditorHandlersProps {
  editorRef: React.RefObject<HTMLDivElement>;
  initialContent: string;
  onChange: (content: string) => void;
  setContent: (content: string) => void;
  setError: (error: string | null) => void;
  updateFormatState: () => void;
}

export const useEditorHandlers = ({
  editorRef,
  initialContent,
  onChange,
  setContent,
  setError,
  updateFormatState
}: UseEditorHandlersProps) => {
  const isTypingRef = useRef(false);
  const [historyService, setHistoryService] = useState<any>(null);
  
  // Initialize history service asynchronously
  useEffect(() => {
    const initHistoryService = async () => {
      try {
        // Use direct instantiation to avoid circular dependency
        const { HistoryService } = await import('../services/HistoryService');
        setHistoryService(new HistoryService());
      } catch (error) {
        console.error('Failed to initialize history service in handlers:', error);
        setHistoryService(null);
      }
    };
    initHistoryService();
  }, []);

  // Individual handler hooks
  const { handleKeyDown } = useEditorKeyboardHandler({ 
    editorRef, 
    onChange, 
    setContent 
  });

  const { handlePaste } = useEditorPasteHandler({ 
    updateFormatState, 
    onChange, 
    setContent, 
    setError, 
    editorRef 
  });

  const { handleInput, handleClick } = useEditorContentManager({
    editorRef,
    initialContent,
    onChange,
    setContent,
    setError,
    updateFormatState,
    historyService,
    isTypingRef
  });

  return {
    handleInput,
    handleKeyDown,
    handleClick,
    handlePaste,
    handleContextMenu: () => {} // Placeholder
  };
};
