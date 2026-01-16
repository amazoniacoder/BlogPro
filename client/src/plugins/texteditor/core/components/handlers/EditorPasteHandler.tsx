import React, { useCallback } from 'react';
import { PasteService } from '../../services/PasteService';
import { SecurityService } from '../../../shared/utils/SecurityService';

export interface PasteHandlerProps {
  readonly updateFormatState: () => void;
  readonly onChange?: (content: string) => void;
  readonly setContent: (content: string) => void;
  readonly setError: (error: string | null) => void;
  readonly editorRef: React.RefObject<HTMLDivElement>;
}

export const useEditorPasteHandler = ({
  updateFormatState,
  onChange,
  setContent,
  setError,
  editorRef
}: PasteHandlerProps) => {
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    
    try {
      const result = await PasteService.handlePaste(e.clipboardData, {
        preserveFormatting: true,
        cleanupHtml: true,
        maxLength: 50000
      });
      
      if (result.success && result.content) {
        // Content already inserted by PasteService.handlePaste()
        // No need to insert again here
        
        // Update content and format state after paste
        setTimeout(() => {
          if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            setContent(newContent);
            onChange?.(newContent);
          }
          updateFormatState();
        }, 0);
      } else {
        setError(result.error || 'Paste operation failed');
      }
    } catch (err) {
      setError('Failed to paste content');
      console.error('Paste error:', SecurityService.sanitizeLog(err));
    }
  }, [updateFormatState, onChange, setContent, setError, editorRef]);

  return { handlePaste };
};
