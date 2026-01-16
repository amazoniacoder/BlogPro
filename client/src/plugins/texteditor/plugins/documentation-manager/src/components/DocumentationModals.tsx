/**
 * Documentation Modals Component
 */

import React from 'react';
import { FormatConverter } from './FormatConverter';
import { DocumentationAdminPanel } from './admin/DocumentationAdminPanel';

interface DocumentationModalsProps {
  exportModal: {
    isOpen: boolean;
    contentId: string | null;
    contentTitle: string;
  };
  adminPanel: {
    isOpen: boolean;
    activePanel: 'content' | 'sections' | 'menu' | 'files' | 'converter' | 'search';
  };
  closeExportModal: () => void;
  closeAdminPanel: () => void;
  loadDynamicContent: () => void;
}

export const DocumentationModals: React.FC<DocumentationModalsProps> = ({
  exportModal,
  adminPanel,
  closeExportModal,
  closeAdminPanel,
  loadDynamicContent
}) => {
  return (
    <>
      {/* Export Modal */}
      {exportModal.isOpen && (
        <div className="modal-overlay" onClick={closeExportModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Export: {exportModal.contentTitle}</h3>
              <button onClick={closeExportModal} className="modal-close">✕</button>
            </div>
            
            <div className="modal-body">
              {exportModal.contentId && (
                <FormatConverter
                  contentId={exportModal.contentId}
                  contentTitle={exportModal.contentTitle}
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Admin Panel Modal */}
      {adminPanel.isOpen && (
        <div className="admin-modal-overlay" onClick={closeAdminPanel}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Documentation Management</h3>
              <button onClick={closeAdminPanel} className="modal-close">✕</button>
            </div>
            
            <div className="admin-modal-body">
              <DocumentationAdminPanel
                activeView={adminPanel.activePanel}
                onClose={closeAdminPanel}
                onMenuUpdate={loadDynamicContent}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
