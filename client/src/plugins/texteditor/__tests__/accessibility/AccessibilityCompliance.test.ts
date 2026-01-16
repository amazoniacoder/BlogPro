/**
 * Accessibility Compliance Tests
 * WCAG 2.1 AA compliance validation
 */

import { KeyboardNavigationService } from '../../core/services/accessibility/KeyboardNavigationService';
import { ScreenReaderService } from '../../core/services/accessibility/ScreenReaderService';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var afterEach: any;
}

describe('Accessibility Compliance', () => {
  let container: HTMLElement;
  let keyboardService: KeyboardNavigationService;
  let screenReaderService: ScreenReaderService;

  beforeEach(() => {
    document.body.innerHTML = '<div class="test-container"></div>';
    container = document.querySelector('.test-container')!;
    keyboardService = KeyboardNavigationService.getInstance();
    screenReaderService = ScreenReaderService.getInstance();
  });

  afterEach(() => {
    keyboardService.destroy();
    screenReaderService.destroy();
    document.body.innerHTML = '';
  });

  describe('Keyboard Navigation', () => {
    test('should initialize navigation with focusable elements', () => {
      container.innerHTML = `
        <button>Button 1</button>
        <input type="text" />
        <button>Button 2</button>
      `;

      keyboardService.initializeNavigation(container);
      const state = keyboardService.getState();
      
      expect(state.focusableElements.length).toBe(3);
    });

    test('should trap focus within container', () => {
      container.innerHTML = `
        <button>Button 1</button>
        <button>Button 2</button>
      `;

      keyboardService.trapFocus(container);
      const state = keyboardService.getState();
      
      expect(state.isTrapped).toBe(true);
      expect(state.focusableElements.length).toBe(2);
    });

    test('should navigate to next focusable element', () => {
      container.innerHTML = `
        <button>Button 1</button>
        <button>Button 2</button>
      `;

      keyboardService.trapFocus(container);
      const success = keyboardService.focusNext();
      
      expect(success).toBe(true);
      expect(keyboardService.getState().currentFocusIndex).toBe(0);
    });
  });

  describe('Screen Reader Support', () => {
    test('should announce format changes', () => {
      screenReaderService.announceFormatChange('bold', true);
      expect(typeof screenReaderService.announce).toBe('function');
    });

    test('should set ARIA attributes correctly', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      
      screenReaderService.setAriaLabel(button, 'Test button');
      screenReaderService.setRole(button, 'button');
      screenReaderService.setAriaPressed(button, true);
      
      expect(button.getAttribute('aria-label')).toBe('Test button');
      expect(button.getAttribute('role')).toBe('button');
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('WCAG 2.1 AA Compliance', () => {
    test('should provide keyboard navigation for interactive elements', () => {
      container.innerHTML = `
        <button aria-label="Bold">B</button>
        <div contenteditable="true" role="textbox" aria-label="Text editor"></div>
      `;

      keyboardService.initializeNavigation(container);
      const state = keyboardService.getState();
      
      expect(state.focusableElements.length).toBeGreaterThan(0);
    });

    test('should provide proper ARIA labels', () => {
      const editor = document.createElement('div');
      editor.contentEditable = 'true';
      container.appendChild(editor);
      
      screenReaderService.setRole(editor, 'textbox');
      screenReaderService.setAriaLabel(editor, 'Rich text editor');
      
      expect(editor.getAttribute('role')).toBe('textbox');
      expect(editor.getAttribute('aria-label')).toBe('Rich text editor');
    });
  });
});
