/**
 * Unit tests for TextReplacementService
 */

import { TextReplacementService } from '../../core/services/content/TextReplacementService';

import { vi } from 'vitest';

// Mock the dependencies
vi.mock('../../shared/utils/selectionUtils', () => ({
  getCurrentSelection: vi.fn(),
  setSelectionRange: vi.fn(() => true)
}));

vi.mock('../../shared/utils/domUtils', () => ({
  normalizeContent: vi.fn()
}));

vi.mock('../../shared/utils/SecurityService', () => ({
  SecurityService: {
    sanitizeHTML: vi.fn((text) => text)
  }
}));

describe('TextReplacementService', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('replaceSpellError', () => {
    test('should replace spell error element with correction', () => {
      const container = document.createElement('div');
      container.className = 'editor-content';
      const errorElement = document.createElement('span');
      errorElement.className = 'spell-error-highlight';
      errorElement.textContent = 'teh';
      errorElement.setAttribute('data-word', 'teh');
      
      container.appendChild(errorElement);
      document.body.appendChild(container);

      const success = TextReplacementService.replaceSpellError(errorElement, 'the');

      expect(success).toBe(true);
      expect(container.textContent).toBe('the');
      expect(container.querySelector('.spell-error-highlight')).toBeNull();
    });

    test('should handle invalid inputs gracefully', () => {
      const success = TextReplacementService.replaceSpellError(null as any, 'test');
      expect(success).toBe(false);
    });
  });

  describe('replaceTextInContext', () => {
    test('should replace text in text node', () => {
      const textNode = document.createTextNode('Hello world');
      
      const success = TextReplacementService.replaceTextInContext(textNode, 6, 11, 'universe');
      
      expect(success).toBe(true);
      expect(textNode.textContent).toBe('Hello universe');
    });

    test('should validate offsets', () => {
      const textNode = document.createTextNode('Hello');
      
      const success = TextReplacementService.replaceTextInContext(textNode, 10, 15, 'test');
      
      expect(success).toBe(false);
    });
  });
});
