// client/src/admin/pages/site-editor/index.tsx
import React from 'react';
import { WebsiteEditorTabs } from '../../../ui-system/components/admin/website-editor/WebsiteEditorTabs';

const SiteEditor: React.FC = () => {
  return (
    <div className="admin-site-editor">
      <div className="admin-site-editor__content">
        <WebsiteEditorTabs />
      </div>
    </div>
  );
};

export default SiteEditor;
