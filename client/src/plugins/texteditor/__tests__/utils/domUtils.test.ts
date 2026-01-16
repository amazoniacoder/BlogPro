/**
 * Unit tests for domUtils
 */

import { normalizeContent, cleanupEmptyFormatElements } from '../../shared/utils/domUtils';

describe('domUtils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('normalizeContent', () => {
    test('should convert div elements to paragraphs', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div>First line</div><div>Second line</div>';
      
      normalizeContent(container);
      
      expect(container.querySelectorAll('p')).toHaveLength(2);
      expect(container.querySelectorAll('div')).toHaveLength(0);
      expect(container.textContent).toBe('First lineSecond line');
    });

    test('should ensure at least one paragraph exists', () => {
      const container = document.createElement('div');
      container.innerHTML = 'Plain text content';
      
      normalizeContent(container);
      
      expect(container.querySelectorAll('p')).toHaveLength(1);
      expect(container.querySelector('p')!.textContent).toBe('Plain text content');
    });

    test('should add br to empty paragraphs', () => {
      const container = document.createElement('div');
      container.innerHTML = '<p></p><p>Content</p><p></p>';
      
      normalizeContent(container);
      
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs[0].innerHTML).toBe('<br>');
      expect(paragraphs[1].textContent).toBe('Content');
      expect(paragraphs[2].innerHTML).toBe('<br>');
    });
  });

  describe('cleanupEmptyFormatElements', () => {
    test('should remove empty formatting elements', () => {
      const container = document.createElement('div');
      container.className = 'editor-content';
      container.innerHTML = '<p>Text <strong></strong> more <em></em> text <u></u></p>';
      document.body.appendChild(container);
      
      cleanupEmptyFormatElements(container);
      
      expect(container.querySelectorAll('strong')).toHaveLength(0);
      expect(container.querySelectorAll('em')).toHaveLength(0);
      expect(container.querySelectorAll('u')).toHaveLength(0);
    });

    test('should preserve formatting elements with content', () => {
      const container = document.createElement('div');
      container.className = 'editor-content';
      container.innerHTML = '<p>Text <strong>bold</strong> and <em>italic</em> text</p>';
      document.body.appendChild(container);
      
      cleanupEmptyFormatElements(container);
      
      expect(container.querySelectorAll('strong')).toHaveLength(1);
      expect(container.querySelectorAll('em')).toHaveLength(1);
      expect(container.querySelector('strong')!.textContent).toBe('bold');
      expect(container.querySelector('em')!.textContent).toBe('italic');
    });
  });
});
