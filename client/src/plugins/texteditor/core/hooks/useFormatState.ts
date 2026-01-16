import { useState, useCallback, RefObject } from 'react';
import { FormatState } from '../types/CoreTypes';
import { cleanupEmptyFormatElements } from '../../shared/utils/domUtils';
import { ServiceFactory } from '../services/ServiceFactory';
import { PerformanceService } from '../services/ui/PerformanceService';
import { Debouncer } from '../../shared/utils/Debouncer';
import { DOMCache } from '../../shared/utils/DOMCache';
import { EDITOR_CONFIG } from '../../shared/constants/EditorConfig';

// Get format state using UnifiedFormatService
const getCursorFormatState = async (): Promise<FormatState> => {
  const formatService = await ServiceFactory.getUnifiedFormatService();
  return formatService.getFormatState();
};

interface UseFormatStateReturn {
  readonly formatState: FormatState;
  readonly updateFormatState: () => void;
  readonly immediateUpdateFormatState: () => void;
}

export const useFormatState = (editorRef: RefObject<HTMLDivElement>): UseFormatStateReturn => {
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    fontSize: '12pt',
    fontFamily: 'Arial',
    textAlign: 'left'
  });

  const updateFormatState = useCallback(() => {
    if (!editorRef.current) return;

    PerformanceService.measurePerformance('format_state_update', () => {
      try {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        // Clean up empty elements
        cleanupEmptyFormatElements(editorRef.current!);
        
        // Clear cache on content change
        DOMCache.clearAll();
        
        // Get format state
        getCursorFormatState().then(cursorFormatState => {
          setFormatState(cursorFormatState);
        }).catch(error => {
          console.error('Failed to get format state:', error);
        });
      } catch (error) {

      }
    });
  }, [editorRef]);

  // Create debounced update function for performance
  const debouncedUpdateFormatState = useCallback(
    Debouncer.debounce('format-state-update', updateFormatState, EDITOR_CONFIG.PERFORMANCE.DEBOUNCE_DELAY),
    [updateFormatState]
  );

  return { 
    formatState, 
    updateFormatState: debouncedUpdateFormatState,
    immediateUpdateFormatState: updateFormatState
  };
};
