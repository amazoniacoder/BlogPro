/**
 * Library Context Hook
 * Manages library switching and context state
 */

import { useState, useCallback, useEffect } from 'react';
import { LibraryContext, LIBRARY_CONFIGS, getLibraryConfig } from '../types/LibraryContext';

interface UseLibraryContextReturn {
  context: LibraryContext;
  switchLibrary: (newLibraryType: string) => void;
  isValidLibrary: (libraryType: string) => boolean;
}

export const useLibraryContext = (initialLibraryType: string): UseLibraryContextReturn => {
  const [context, setContext] = useState<LibraryContext>(() => 
    getLibraryConfig(initialLibraryType)
  );

  const isValidLibrary = useCallback((libraryType: string): boolean => {
    return libraryType in LIBRARY_CONFIGS;
  }, []);

  const switchLibrary = useCallback((newLibraryType: string) => {
    if (!isValidLibrary(newLibraryType)) {
      console.warn(`Invalid library type: ${newLibraryType}`);
      return;
    }

    const newContext = LIBRARY_CONFIGS[newLibraryType];
    setContext(newContext);
    
    // Update URL without page reload
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', newContext.baseRoute);
    }
  }, [isValidLibrary]);

  // Update context when initialLibraryType changes
  useEffect(() => {
    const newContext = getLibraryConfig(initialLibraryType);
    if (newContext.libraryType !== context.libraryType) {
      setContext(newContext);
    }
  }, [initialLibraryType, context.libraryType]);

  return {
    context,
    switchLibrary,
    isValidLibrary
  };
};
