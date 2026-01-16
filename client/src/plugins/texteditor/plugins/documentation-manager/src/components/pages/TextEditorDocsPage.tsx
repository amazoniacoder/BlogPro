/**
 * Text Editor Documentation Page
 * Public page for text editor library documentation
 * Max 100 lines - strict TypeScript compliance
 */

import React from 'react';
import { SupportEditorLayout } from '../layout/SupportEditorLayout';
import { MinimalContent } from '../content/MinimalContent';
import '../../styles/index.css';

/**
 * Text Editor documentation page component
 * Provides public access to text editor documentation with admin editing capabilities
 */
export const TextEditorDocsPage: React.FC = () => {
  return (
    <SupportEditorLayout 
      libraryType="texteditor"
      className="text-editor-docs-page"
    >
      <MinimalContent libraryType="texteditor" />
    </SupportEditorLayout>
  );
};

export default TextEditorDocsPage;
