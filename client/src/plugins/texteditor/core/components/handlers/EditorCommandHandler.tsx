import React, { useCallback } from 'react';
import { SecurityService } from '../../../shared/utils/SecurityService';
import { ContentSerializationService } from '../../services/content/ContentSerializationService';
import { ServiceFactory } from '../../services/ServiceFactory';
import { TableService } from '../../services/TableService';
import { MediaService } from '../../services/media/MediaService';
import { HistoryService } from '../../services/HistoryService';

export interface CommandHandlerProps {
  readonly editorRef: React.RefObject<HTMLDivElement>;
  readonly historyService: HistoryService;
  readonly updateFormatState: () => void;
  readonly onChange?: (content: string) => void;
  readonly onSave?: (content: string) => Promise<void>;
  readonly setContent: (content: string) => void;
  readonly setError: (error: string | null) => void;
  readonly setIsLoading: (loading: boolean) => void;
  readonly setIsFullscreen: (fullscreen: boolean) => void;
  readonly isFullscreen: boolean;
}

export const useEditorCommandHandler = ({
  editorRef,
  historyService,
  updateFormatState,
  onChange,
  onSave,
  setContent,
  setError,
  setIsLoading,
  setIsFullscreen,
  isFullscreen
}: CommandHandlerProps) => {
  const execCommand = useCallback(async (command: string, value?: string | any) => {
    // Save state before formatting changes (except undo/redo)
    if (command !== 'undo' && command !== 'redo' && command !== 'fullscreen' && editorRef.current) {
      historyService.saveState(editorRef.current.innerHTML);
    }
    
    // Get format service asynchronously
    const formatService = await ServiceFactory.getUnifiedFormatService();
    
    // Use UnifiedFormatService for consistent formatting
    switch (command) {
      case 'bold':
        formatService.applyBold();
        break;
      case 'italic':
        formatService.applyItalic();
        break;
      case 'underline':
        formatService.applyUnderline();
        break;
      case 'fontSize':
        if (value) formatService.applyFontSize(value as any);
        break;
      case 'fontFamily':
        if (value) {
          formatService.applyFontFamily(value as any);
        }
        break;
      case 'textAlign':
        if (value) {
          formatService.applyTextAlign(value as any);
        }
        break;
      case 'textColor':
        if (value) {
          formatService.applyTextColor(value);
        }
        break;
      case 'backgroundColor':
        if (value) {
          formatService.applyBackgroundColor(value);
        }
        break;
      case 'bulletList':
        formatService.applyBulletList();
        break;
      case 'numberedList':
        formatService.applyNumberedList();
        break;
      case 'removeList':
        formatService.removeList();
        break;
      case 'increaseNesting':
        formatService.increaseListNesting();
        break;
      case 'decreaseNesting':
        formatService.decreaseListNesting();
        break;
      case 'insertLink':
        if (value) {
          formatService.applyLink(value);
        }
        break;
      case 'editLink':
        if (value) {
          formatService.editLink(value);
        }
        break;
      case 'removeLink':
        formatService.removeLink();
        break;
      case 'insertImage':
        if (value) {
          formatService.insertImage(value);
        }
        break;
      case 'insertTable':

        if (value) {
          TableService.insertTable(value);
        } else {

        }
        break;
      case 'undo':
        try {
          const restoredContent = await historyService.undoContent();
          if (restoredContent && editorRef.current) {
            editorRef.current.innerHTML = restoredContent;
            setContent(restoredContent);
            onChange?.(restoredContent);
          } else {
            // Fallback to browser undo
            document.execCommand('undo');
          }
        } catch (error) {
          // Fallback to browser undo
          document.execCommand('undo');
        }
        break;
      case 'redo':
        try {
          const restoredContent = await historyService.redoContent();
          if (restoredContent && editorRef.current) {
            editorRef.current.innerHTML = restoredContent;
            setContent(restoredContent);
            onChange?.(restoredContent);
          } else {
            // Fallback to browser redo
            document.execCommand('redo');
          }
        } catch (error) {
          // Fallback to browser redo
          document.execCommand('redo');
        }
        break;
      case 'fullscreen':
        setIsFullscreen(!isFullscreen);
        break;
      default:

    }
    
    editorRef.current?.focus();
    
    // Update format state and content after DOM changes
    setTimeout(() => {
      updateFormatState();
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);
        onChange?.(newContent);
        
        // Make sure all images are resizable after content changes
        MediaService.makeAllImagesResizable(editorRef.current);
        

      }
    }, 10); // Small delay to ensure DOM is updated
  }, [editorRef, historyService, updateFormatState, onChange, setContent, setIsFullscreen, isFullscreen]);

  // Enhanced save handling with format preservation
  const handleSave = useCallback(async () => {
    if (!onSave || !editorRef.current) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Serialize content with format preservation
      const serializedContent = ContentSerializationService.serializeContent(editorRef.current);
      await onSave(serializedContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? SecurityService.sanitizeLog(err.message) : 'Save failed';
      setError(errorMessage);

    } finally {
      setIsLoading(false);
    }
  }, [onSave, editorRef, setError, setIsLoading]);

  return { execCommand, handleSave };
};
