/**
 * Keyboard Navigation Service
 * Manages keyboard navigation and focus management for accessibility
 */

import { KeyboardNavigationState } from '../../types/AccessibilityTypes';

export class KeyboardNavigationService {
  private static instance: KeyboardNavigationService;
  private state: KeyboardNavigationState;
  private listeners = new Set<(state: KeyboardNavigationState) => void>();

  private constructor() {
    this.state = {
      currentFocusIndex: -1,
      focusableElements: [],
      isTrapped: false
    };
  }

  static getInstance(): KeyboardNavigationService {
    if (!this.instance) {
      this.instance = new KeyboardNavigationService();
    }
    return this.instance;
  }

  initializeNavigation(container: HTMLElement): void {
    this.updateFocusableElements(container);
    this.attachKeyboardListeners(container);
  }

  trapFocus(container: HTMLElement): void {
    this.state = { ...this.state, isTrapped: true };
    this.updateFocusableElements(container);
    this.notifyListeners();
  }

  releaseFocus(): void {
    this.state = { ...this.state, isTrapped: false, currentFocusIndex: -1 };
    this.notifyListeners();
  }

  focusNext(): boolean {
    if (this.state.focusableElements.length === 0) return false;
    
    const nextIndex = (this.state.currentFocusIndex + 1) % this.state.focusableElements.length;
    return this.focusElementAt(nextIndex);
  }

  focusPrevious(): boolean {
    if (this.state.focusableElements.length === 0) return false;
    
    const prevIndex = this.state.currentFocusIndex <= 0 
      ? this.state.focusableElements.length - 1 
      : this.state.currentFocusIndex - 1;
    return this.focusElementAt(prevIndex);
  }

  focusFirst(): boolean {
    return this.focusElementAt(0);
  }

  focusLast(): boolean {
    return this.focusElementAt(this.state.focusableElements.length - 1);
  }

  private focusElementAt(index: number): boolean {
    if (index < 0 || index >= this.state.focusableElements.length) return false;
    
    const element = this.state.focusableElements[index];
    element.focus();
    
    this.state = { ...this.state, currentFocusIndex: index };
    this.notifyListeners();
    return true;
  }

  private updateFocusableElements(container: HTMLElement): void {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
    this.state = { ...this.state, focusableElements: elements };
  }

  private attachKeyboardListeners(container: HTMLElement): void {
    container.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.state.isTrapped) return;

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) {
          this.focusPrevious();
        } else {
          this.focusNext();
        }
        break;
      case 'Escape':
        this.releaseFocus();
        break;
      case 'Home':
        if (event.ctrlKey) {
          event.preventDefault();
          this.focusFirst();
        }
        break;
      case 'End':
        if (event.ctrlKey) {
          event.preventDefault();
          this.focusLast();
        }
        break;
    }
  }

  subscribe(listener: (state: KeyboardNavigationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): KeyboardNavigationState {
    return { ...this.state };
  }

  destroy(): void {
    this.listeners.clear();
    this.state = {
      currentFocusIndex: -1,
      focusableElements: [],
      isTrapped: false
    };
  }
}
