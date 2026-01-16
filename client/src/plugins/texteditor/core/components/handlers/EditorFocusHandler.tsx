import { useEffect, RefObject } from 'react';

interface UseEditorFocusHandlerProps {
  editorRef: RefObject<HTMLDivElement>;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const useEditorFocusHandler = ({
  editorRef,
  onFocus,
  onBlur
}: UseEditorFocusHandlerProps) => {
  useEffect(() => {
    const element = editorRef.current;
    if (!element) return;

    const handleFocus = () => {
      onFocus?.();
    };

    const handleBlur = () => {
      onBlur?.();
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    
    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [editorRef, onFocus, onBlur]);
};
