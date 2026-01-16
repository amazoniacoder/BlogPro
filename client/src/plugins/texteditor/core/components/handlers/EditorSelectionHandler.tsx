import { useEffect, RefObject } from 'react';

interface UseEditorSelectionHandlerProps {
  editorRef: RefObject<HTMLDivElement>;
  updateFormatState: () => void;
}

export const useEditorSelectionHandler = ({
  editorRef,
  updateFormatState
}: UseEditorSelectionHandlerProps) => {
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateFormatState();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editorRef, updateFormatState]);
};
