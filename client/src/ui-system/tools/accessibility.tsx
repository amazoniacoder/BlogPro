/**
 * BlogPro Accessibility Utilities
 * ARIA attributes and keyboard navigation helpers
 */

import React, { useRef } from 'react';

// ARIA attribute helpers
export const aria = {
  label: (label: string) => ({ 'aria-label': label }),
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),
  describedBy: (id: string) => ({ 'aria-describedby': id }),
  expanded: (expanded: boolean) => ({ 'aria-expanded': expanded }),
  selected: (selected: boolean) => ({ 'aria-selected': selected }),
  checked: (checked: boolean) => ({ 'aria-checked': checked }),
  disabled: (disabled: boolean) => ({ 'aria-disabled': disabled }),
  hidden: (hidden: boolean) => ({ 'aria-hidden': hidden }),
  current: (current: string) => ({ 'aria-current': current }),
  live: (live: 'polite' | 'assertive' | 'off') => ({ 'aria-live': live }),
  role: (role: string) => ({ role })
};

// Keyboard navigation hook
export const useKeyboardNavigation = (
  items: HTMLElement[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: (index: number) => void;
  } = {}
) => {
  const { loop = true, orientation = 'vertical', onSelect } = options;
  const currentIndex = useRef(0);

  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    if (key === nextKey || key === prevKey) {
      event.preventDefault();
      
      const direction = key === nextKey ? 1 : -1;
      let newIndex = currentIndex.current + direction;
      
      if (loop) {
        newIndex = (newIndex + items.length) % items.length;
      } else {
        newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
      }
      
      currentIndex.current = newIndex;
      items[newIndex]?.focus();
      onSelect?.(newIndex);
    } else if (key === 'Home') {
      event.preventDefault();
      currentIndex.current = 0;
      items[0]?.focus();
      onSelect?.(0);
    } else if (key === 'End') {
      event.preventDefault();
      currentIndex.current = items.length - 1;
      items[items.length - 1]?.focus();
      onSelect?.(items.length - 1);
    }
  };

  return { handleKeyDown };
};

// Focus management hook
export const useFocusManagement = () => {
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  const trapFocus = (container: HTMLElement) => {
    const focusable = container.querySelectorAll(focusableElements) as NodeListOf<HTMLElement>;
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstFocusable?.focus();

    return () => container.removeEventListener('keydown', handleTabKey);
  };

  const restoreFocus = (previousElement: HTMLElement | null) => {
    previousElement?.focus();
  };

  return { trapFocus, restoreFocus };
};

// Screen reader announcements
export const useScreenReader = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
};

// Skip link component
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ 
  href, 
  children 
}) => (
  <a 
    href={href}
    className="skip-link"
    onFocus={(e) => e.currentTarget.classList.add('skip-link--visible')}
    onBlur={(e) => e.currentTarget.classList.remove('skip-link--visible')}
  >
    {children}
  </a>
);

// Accessible heading component
export const AccessibleHeading: React.FC<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  id?: string;
  className?: string;
}> = ({ level, children, id, className = '' }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag 
      id={id}
      className={`bp-heading heading--${level} ${className}`}
      tabIndex={-1}
    >
      {children}
    </Tag>
  );
};

// Live region component for dynamic content
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}> = ({ children, priority = 'polite', atomic = true }) => (
  <div
    aria-live={priority}
    aria-atomic={atomic}
    className="bp-live-region bp-sr-only"
  >
    {children}
  </div>
);

// Focus indicator component
export const FocusIndicator: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="focus-indicator">
    {children}
  </div>
);
