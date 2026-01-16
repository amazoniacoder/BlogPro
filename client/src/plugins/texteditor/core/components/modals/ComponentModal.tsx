import React from 'react';
import { LinkManager } from '../LinkManager';
import { ImageUpload } from '../ImageUpload';
import TableEditor from '../TableEditor';
import { TextColorPicker } from '../TextColorPicker';
import { TextAlignmentDropdown } from '../TextAlignmentDropdown';
import { ListFormatting } from '../ListFormatting';
import TableColorEditor from '../TableColorEditor';

interface ComponentModalProps {
  showComponentModal: string | null;
  onClose: () => void;
}

export const ComponentModal: React.FC<ComponentModalProps> = ({
  showComponentModal,
  onClose
}) => {
  if (!showComponentModal) return null;

  return (
    <>
      {showComponentModal === 'link-manager' && (
        <>
          <button 
            className="component-modal__close"
            onClick={onClose}
            title="Close"
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <LinkManager 
            onLinkChange={() => {}} 
            isModal={true}
            onClose={onClose}
          />
        </>
      )}
      {showComponentModal === 'image-upload' && (
        <>
          <button 
            className="component-modal__close"
            onClick={onClose}
            title="Close"
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <ImageUpload 
            onImageInsert={() => {}}
            isModal={true}
            onClose={onClose}
          />
        </>
      )}
      {showComponentModal === 'table-editor' && (
        <>
          <button 
            className="component-modal__close"
            onClick={onClose}
            title="Close"
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <TableEditor 
            onCommand={() => {}}
            isModal={true}
            onClose={onClose}
          />
        </>
      )}
      {showComponentModal === 'text-color-picker' && (
        <>
          <button 
            className="component-modal__close"
            onClick={onClose}
            title="Close"
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <TextColorPicker 
            onColorChange={() => {}}
            isModal={true}
            onClose={onClose}
          />
        </>
      )}
      {showComponentModal === 'text-alignment' && (
        <>
          <button 
            className="component-modal__close"
            onClick={onClose}
            title="Close"
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <TextAlignmentDropdown 
            onAlignmentChange={() => {}}
            isModal={true}
            onClose={onClose}
          />
        </>
      )}
      {showComponentModal === 'list-formatting' && (
        <>
          <button 
            className="component-modal__close"
            onClick={onClose}
            title="Close"
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <ListFormatting 
            onCommand={() => {}}
            isModal={true}
            onClose={onClose}
          />
        </>
      )}
      {showComponentModal === 'table-color-editor' && (
        <>
          <button 
            className="component-modal__close"
            onClick={onClose}
            title="Close"
            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <TableColorEditor />
        </>
      )}
    </>
  );
};
