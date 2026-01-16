import React, { useCallback } from 'react';
import { ServiceFactory } from '../../services/ServiceFactory';

export interface KeyboardHandlerProps {
  readonly editorRef: React.RefObject<HTMLDivElement>;
  readonly onChange?: (content: string) => void;
  readonly setContent: (content: string) => void;
}

export const useEditorKeyboardHandler = ({ 
  editorRef, 
  onChange, 
  setContent 
}: KeyboardHandlerProps) => {
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle Space key with format service
    if (e.key === ' ') {
      const formatService = await ServiceFactory.getUnifiedFormatService();
      const handled = formatService.handleSpace();
      
      if (handled) {
        e.preventDefault();
        
        // Update content and notify parent
        setTimeout(() => {
          if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            setContent(newContent);
            onChange?.(newContent);
          }
        }, 0);
        return;
      }
      // Browser handles space normally
    }
    
    // Handle Enter key for new paragraphs and list items
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Check if we're in a list
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
        
        // Find if we're in a list item
        let listItem = element;
        while (listItem && listItem.tagName !== 'LI' && !listItem.matches('.editor-content')) {
          listItem = listItem.parentElement;
        }
        
        if (listItem && listItem.tagName === 'LI') {
          // Check if current list item is empty - if so, exit the list
          const listItemContent = listItem.textContent?.trim() || '';
          const listItemHTML = listItem.innerHTML.trim();
          
          if (listItemContent === '' || listItemHTML === '<br>' || listItemHTML === '') {
            // Empty list item - exit the list
            const list = listItem.parentElement;
            if (list) {
              // Remove the empty list item
              listItem.remove();
              
              // Create new paragraph after the list
              const newParagraph = document.createElement('p');
              newParagraph.innerHTML = '<br>';
              
              // Insert paragraph after the list
              list.parentNode?.insertBefore(newParagraph, list.nextSibling);
              
              // Move cursor to new paragraph
              const newRange = document.createRange();
              newRange.setStart(newParagraph, 0);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
              
              // Update content
              setTimeout(() => {
                if (editorRef.current) {
                  const newContent = editorRef.current.innerHTML;
                  setContent(newContent);
                  onChange?.(newContent);
                }
              }, 0);
              return;
            }
          } else {
            // Non-empty list item - create new list item
            const newListItem = document.createElement('li');
            newListItem.innerHTML = '<br>';
            
            // Insert after current list item
            listItem.parentNode?.insertBefore(newListItem, listItem.nextSibling);
            
            // Move cursor to new list item
            const newRange = document.createRange();
            newRange.setStart(newListItem, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Update content
            setTimeout(() => {
              if (editorRef.current) {
                const newContent = editorRef.current.innerHTML;
                setContent(newContent);
              }
            }, 0);
            return;
          }
        }
      }
      
      // Not in a list - handle normally
      const formatService = await ServiceFactory.getUnifiedFormatService();
      const handled = formatService.handleEnter();
      
      if (handled) {
        // Update content and notify parent
        setTimeout(() => {
          if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            setContent(newContent);
            onChange?.(newContent);
          }
        }, 0);
      }
      return;
    }
  }, [editorRef, onChange, setContent]);

  return { handleKeyDown };
};
