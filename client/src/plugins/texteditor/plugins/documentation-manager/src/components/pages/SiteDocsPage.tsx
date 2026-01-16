/**
 * Site Documentation Page
 * Public page for website library documentation
 * Max 100 lines - strict TypeScript compliance
 */

import React from 'react';
import { SupportEditorLayout } from '../layout/SupportEditorLayout';
import { MinimalContent } from '../content/MinimalContent';
import '../../styles/index.css';

/**
 * Site documentation page component
 * Provides public access to website documentation with admin editing capabilities
 */
export const SiteDocsPage: React.FC = () => {
  return (
    <SupportEditorLayout 
      libraryType="site"
      className="site-docs-page"
    >
      <MinimalContent libraryType="site" />
    </SupportEditorLayout>
  );
};

export default SiteDocsPage;
