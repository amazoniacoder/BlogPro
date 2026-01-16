/**
 * BlogPro Keyboard Navigation Enhancement
 * Enhanced keyboard navigation for all components
 */

import React, { useEffect, useRef } from 'react';

// Enhanced keyboard navigation hook
export const useEnhancedKeyboardNavigation = () => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, target, ctrlKey, shiftKey } = event;
      const activeElement = target as HTMLElement;

      // Global keyboard shortcuts
      if (ctrlKey && key === '/') {
        event.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLElement;
        searchInput?.focus();
        return;
      }

      // Escape key handling
      if (key === 'Escape') {
        // Close modals, dropdowns, etc.
        const openModal = document.querySelector('[data-modal-open]');
        const openDropdown = document.querySelector('[data-dropdown-open]');
        
        if (openModal) {
          const closeButton = openModal.querySelector('[data-modal-close]') as HTMLElement;
          closeButton?.click();
        } else if (openDropdown) {
          const toggleButton = openDropdown.querySelector('[data-dropdown-toggle]') as HTMLElement;
          toggleButton?.click();
        } else {
          // Remove focus from current element
          activeElement.blur();
        }
        return;
      }

      // Tab navigation enhancement
      if (key === 'Tab') {
        const focusableElements = container.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        const currentIndex = Array.from(focusableElements).indexOf(activeElement);
        
        if (shiftKey) {
          // Shift+Tab - previous element
          if (currentIndex === 0) {
            event.preventDefault();
            focusableElements[focusableElements.length - 1]?.focus();
          }
        } else {
          // Tab - next element
          if (currentIndex === focusableElements.length - 1) {
            event.preventDefault();
            focusableElements[0]?.focus();
          }
        }
      }

      // Arrow key navigation for specific components
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        handleArrowNavigation(event, activeElement);
      }

      // Enter and Space key handling
      if (key === 'Enter' || key === ' ') {
        handleActivation(event, activeElement);
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return containerRef;
};

// Arrow key navigation handler
const handleArrowNavigation = (event: KeyboardEvent, activeElement: HTMLElement) => {
  const { key } = event;
  
  // Tab navigation
  if (activeElement.closest('[role="tablist"]')) {
    event.preventDefault();
    const tablist = activeElement.closest('[role="tablist"]');
    const tabs = tablist?.querySelectorAll('[role="tab"]') as NodeListOf<HTMLElement>;
    const currentIndex = Array.from(tabs).indexOf(activeElement);
    
    let nextIndex = currentIndex;
    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    } else if (key === 'ArrowRight' || key === 'ArrowDown') {
      nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    }
    
    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
    return;
  }

  // Menu navigation
  if (activeElement.closest('[role="menu"]') || activeElement.closest('[role="menubar"]')) {
    event.preventDefault();
    const menu = activeElement.closest('[role="menu"], [role="menubar"]');
    const items = menu?.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLElement>;
    const currentIndex = Array.from(items).indexOf(activeElement);
    
    let nextIndex = currentIndex;
    if (key === 'ArrowUp') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    } else if (key === 'ArrowDown') {
      nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    }
    
    items[nextIndex]?.focus();
    return;
  }

  // Grid navigation (for data tables)
  if (activeElement.closest('[role="grid"]')) {
    event.preventDefault();
    const grid = activeElement.closest('[role="grid"]');
    const rows = grid?.querySelectorAll('[role="row"]') as NodeListOf<HTMLElement>;
    
    const currentCell = activeElement.closest('[role="gridcell"]') as HTMLElement;
    const currentRow = activeElement.closest('[role="row"]') as HTMLElement;
    
    const cellIndex = Array.from(currentRow.querySelectorAll('[role="gridcell"]')).indexOf(currentCell);
    const rowIndex = Array.from(rows).indexOf(currentRow);
    
    let nextCell: HTMLElement | null = null;
    
    if (key === 'ArrowLeft' && cellIndex > 0) {
      nextCell = currentRow.querySelectorAll('[role="gridcell"]')[cellIndex - 1] as HTMLElement;
    } else if (key === 'ArrowRight' && cellIndex < currentRow.querySelectorAll('[role="gridcell"]').length - 1) {
      nextCell = currentRow.querySelectorAll('[role="gridcell"]')[cellIndex + 1] as HTMLElement;
    } else if (key === 'ArrowUp' && rowIndex > 0) {
      const prevRow = rows[rowIndex - 1];
      nextCell = prevRow.querySelectorAll('[role="gridcell"]')[cellIndex] as HTMLElement;
    } else if (key === 'ArrowDown' && rowIndex < rows.length - 1) {
      const nextRow = rows[rowIndex + 1];
      nextCell = nextRow.querySelectorAll('[role="gridcell"]')[cellIndex] as HTMLElement;
    }
    
    nextCell?.focus();
    return;
  }
};

// Enter/Space activation handler
const handleActivation = (event: KeyboardEvent, activeElement: HTMLElement) => {
  const { key } = event;
  
  // Button activation
  if (activeElement.tagName === 'BUTTON' && key === ' ') {
    event.preventDefault();
    activeElement.click();
    return;
  }

  // Link activation
  if (activeElement.tagName === 'A' && key === 'Enter') {
    event.preventDefault();
    activeElement.click();
    return;
  }

  // Checkbox/Radio activation
  if (activeElement.tagName === 'INPUT') {
    const inputElement = activeElement as HTMLInputElement;
    if ((inputElement.type === 'checkbox' || inputElement.type === 'radio') && key === ' ') {
      event.preventDefault();
      activeElement.click();
      return;
    }
  }

  // Custom interactive elements
  if (activeElement.hasAttribute('data-interactive') && (key === 'Enter' || key === ' ')) {
    event.preventDefault();
    activeElement.click();
    return;
  }
};

// Keyboard navigation provider component
export const KeyboardNavigationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const containerRef = useEnhancedKeyboardNavigation();

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} className="keyboard-navigation">
      {children}
    </div>
  );
};

// Focus trap component for modals
export const FocusTrap: React.FC<{
  children: React.ReactNode;
  active: boolean;
}> = ({ children, active }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    previousActiveElement.current = document.activeElement as HTMLElement;

    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      previousActiveElement.current?.focus();
    };
  }, [active]);

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  );
};
