import React, { useState } from 'react';
import { EditorMediaPicker } from '@/ui-system/components/admin/media';
import type { MediaItem } from '@/admin/pages/media/state/types';
import './ImageUpload.css';

export interface ImageUploadProps {
  onImageInsert: (command: string, data?: any) => void;
  disabled?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageInsert,
  disabled = false,
  onClose,
  isModal = false
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const savedSelectionRef = React.useRef<Range | null>(null);

  // Save current selection when opening picker
  const handleOpenPicker = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Ensure we're inside the editor content
      const editorContent = document.querySelector('.editor-content');
      if (editorContent && editorContent.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
        console.log('ImageUpload: Saved valid selection inside editor');
      } else {
        // If no valid selection, create one at the end of editor content
        if (editorContent) {
          const newRange = document.createRange();
          newRange.selectNodeContents(editorContent);
          newRange.collapse(false); // Collapse to end
          savedSelectionRef.current = newRange;
          console.log('ImageUpload: Created fallback selection at end of editor');
        }
      }
    }
    setShowPicker(true);
  };

  // Handle image selection from media library
  const handleImageSelect = (item: MediaItem) => {
    console.log('ImageUpload: Inserting image:', item);
    
    // Restore saved selection before inserting image
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedSelectionRef.current);
          console.log('ImageUpload: Selection restored successfully');
        } catch (error) {
          console.error('ImageUpload: Failed to restore selection:', error);
          
          // Fallback: Focus editor and place cursor at end
          const editorContent = document.querySelector('.editor-content') as HTMLElement;
          if (editorContent) {
            editorContent.focus();
            const range = document.createRange();
            range.selectNodeContents(editorContent);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            console.log('ImageUpload: Used fallback selection');
          }
        }
      }
    }

    // Insert image into editor
    onImageInsert('insertImage', {
      url: item.url,
      alt: item.alt || item.originalName,
      alignment: 'none'
    });

    setShowPicker(false);
    
    // Focus back to editor after insertion
    setTimeout(() => {
      const editor = document.querySelector('.editor-content') as HTMLElement;
      if (editor) {
        editor.focus();
        console.log('ImageUpload: Editor focused after insertion');
      }
    }, 100);
  };

  const handleClose = () => {
    setShowPicker(false);
    if (onClose) onClose();
  };

  // If in modal mode, render the media picker directly
  if (isModal) {
    return (
      <EditorMediaPicker
        onSelect={handleImageSelect}
        onClose={handleClose}
      />
    );
  }

  // Regular toolbar button mode
  return (
    <>
      <button
        type="button"
        className="image-upload__button"
        onClick={handleOpenPicker}
        disabled={disabled}
        title="Insert Image"
        aria-label="Insert image from media library"
      >
        🖼️
      </button>

      {showPicker && (
        <EditorMediaPicker
          onSelect={handleImageSelect}
          onClose={handleClose}
        />
      )}
    </>
  );
};
