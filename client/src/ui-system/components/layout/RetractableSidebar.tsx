import React from 'react';
import { Icon } from '@/ui-system/icons/components';

export interface RetractableSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function RetractableSidebar({ isOpen, onToggle, children }: RetractableSidebarProps) {
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onToggle]);

  return (
    <>
      <button 
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        <Icon name="hamburger" size={20} />
      </button>
      
      <div 
        className={`retractable-sidebar ${isOpen ? 'retractable-sidebar--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="retractable-sidebar__header">
          <h2 id="sidebar-title" className="retractable-sidebar__title">Navigation</h2>
          <button 
            className="retractable-sidebar__close"
            onClick={onToggle}
            aria-label="Close sidebar"
            autoFocus={isOpen}
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="retractable-sidebar__content">
          {children}
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="retractable-sidebar__overlay"
          onClick={onToggle}
        />
      )}
    </>
  );
}