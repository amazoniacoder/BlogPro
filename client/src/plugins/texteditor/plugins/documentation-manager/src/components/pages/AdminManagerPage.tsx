/**
 * Admin Manager Page
 * Unified admin control center for managing both libraries
 * Max 200 lines - strict TypeScript compliance
 */

import React, { useState } from 'react';
import { LibraryType, AdminView } from '../../types/SharedTypes';
import { useUserRole } from '../../hooks/useUserRole';
import { AdminHeader } from '../admin/AdminHeader';
import { ContentManager } from '../admin/ContentManager';
import { SectionManager } from '../admin/SectionManager';
import { VersionManager } from '../admin/VersionManager';
import { IntegratedTextEditor } from '../IntegratedTextEditor';
import '../../styles/index.css';

/**
 * Main admin page for managing documentation across all libraries
 */
export const AdminManagerPage: React.FC = () => {
  const { userRole, canEdit, canManage } = useUserRole();
  const [activeLibrary, setActiveLibrary] = useState<LibraryType>('texteditor');
  const [activeView, setActiveView] = useState<AdminView>('content');

  // Redirect if user doesn't have permissions (disabled for development)
  // TODO: Re-enable authentication check in production
  if (false && !canEdit) {
    return (
      <div className="admin-access-denied">
        <h1>Access Denied</h1>
        <p>You need editor or admin permissions to access this panel.</p>
        <a href="/auth">Login</a>
      </div>
    );
  }

  return (
    <div className="admin-manager-page">
      <AdminHeader
        activeLibrary={activeLibrary}
        activeView={activeView}
        userRole={userRole || 'admin'}
        canManage={canManage || true}
        onLibrarySwitch={setActiveLibrary}
        onViewSwitch={setActiveView}
      />

      <main className="admin-content">
        {activeView === 'content' && (
          <ContentManager 
            libraryType={activeLibrary}
            textEditor={
              <IntegratedTextEditor 
                libraryContext={{
                  libraryType: activeLibrary === 'site' ? 'website' : activeLibrary,
                  libraryName: activeLibrary === 'texteditor' ? 'Text Editor Documentation' : 'Website Documentation',
                  baseRoute: `/plugins/texteditor/documentation-${activeLibrary}`,
                  features: {
                    codeBlocks: true,
                    mediaUpload: true,
                    advancedFormatting: true
                  }
                }}
                onSave={async (content: string) => {
                  console.log('Content saved:', content);
                }}
              />
            }
          />
        )}
        
        {activeView === 'sections' && (canManage || true) && (
          <SectionManager libraryType={activeLibrary} />
        )}
        
        {activeView === 'versions' && (
          <VersionManager libraryType={activeLibrary} />
        )}
      </main>
    </div>
  );
};

export default AdminManagerPage;
