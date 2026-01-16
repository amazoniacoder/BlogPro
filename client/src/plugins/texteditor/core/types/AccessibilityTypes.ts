/**
 * Accessibility Types
 * WCAG 2.1 AA compliance type definitions
 */

export interface AccessibilityConfig {
  readonly enableKeyboardNavigation: boolean;
  readonly enableScreenReader: boolean;
  readonly enableFocusTrapping: boolean;
  readonly announceChanges: boolean;
}

export interface KeyboardNavigationState {
  readonly currentFocusIndex: number;
  readonly focusableElements: HTMLElement[];
  readonly isTrapped: boolean;
}

export interface AriaLiveRegion {
  readonly element: HTMLElement;
  readonly politeness: 'polite' | 'assertive';
  readonly atomic: boolean;
}

export interface FocusableElement {
  readonly element: HTMLElement;
  readonly tabIndex: number;
  readonly role?: string;
  readonly ariaLabel?: string;
}
