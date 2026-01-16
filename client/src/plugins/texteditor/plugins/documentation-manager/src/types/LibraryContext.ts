/**
 * Library Context Types
 * Defines the structure for multi-library documentation system
 */

export interface LibraryContext {
  libraryType: 'texteditor' | 'website';
  libraryName: string;
  baseRoute: string;
  features: {
    codeBlocks: boolean;
    mediaUpload: boolean;
    advancedFormatting: boolean;
  };
}

export const LIBRARY_CONFIGS: Record<string, LibraryContext> = {
  texteditor: {
    libraryType: 'texteditor',
    libraryName: 'Text Editor Documentation',
    baseRoute: '/plugins/texteditor/docs',
    features: { 
      codeBlocks: true, 
      mediaUpload: false, 
      advancedFormatting: true 
    }
  },
  website: {
    libraryType: 'website',
    libraryName: 'Website Documentation',
    baseRoute: '/docs',
    features: { 
      codeBlocks: false, 
      mediaUpload: true, 
      advancedFormatting: false 
    }
  }
};

export type LibraryType = keyof typeof LIBRARY_CONFIGS;

export const getLibraryConfig = (libraryType: string): LibraryContext => {
  return LIBRARY_CONFIGS[libraryType] || LIBRARY_CONFIGS.texteditor;
};
