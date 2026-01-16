/**
 * Admin Control Center Component
 * Central admin interface with library switching and view management
 * Max 200 lines - strict TypeScript compliance
 */

import React, { useState } from 'react';
import { LibraryType, AdminView } from '../../types/SharedTypes';
import { AdminHeader } from './AdminHeader';
import { ContentManager } from './ContentManager';
import { SectionManager } from './SectionManager';
import { VersionManager } from './VersionManager';
import { IntegratedTextEditor } from '../IntegratedTextEditor';

/**
 * Main admin control center component
 */
export const AdminControlCenter: React.FC = () => {
  const [activeLibrary, setActiveLibrary] = useState<LibraryType>('texteditor');
  const [activeView, setActiveView] = useState<AdminView>('content');

  return (
    <div className="admin-control-center">
      <AdminHeader
        activeLibrary={activeLibrary}
        activeView={activeView}
        userRole="admin" // TODO: Get from useUserRole hook
        canManage={true}
        onLibrarySwitch={setActiveLibrary}
        onViewSwitch={setActiveView}
      />
      
      <div className="admin-content">
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
        
        {activeView === 'sections' && (
          <SectionManager libraryType={activeLibrary} />
        )}
        
        {activeView === 'versions' && (
          <VersionManager libraryType={activeLibrary} />
        )}
      </div>
    </div>
  );
};

export default AdminControlCenter;
