/**
 * Tests for format preservation and cursor movement fixes
 */

import '../setup'; // Import global test setup
import { ContentSerializationService } from '../../core/services/content/ContentSerializationService';
import { ServiceFactory } from '../../core/services/ServiceFactory';

describe('Format Preservation and Cursor Movement Fixes', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('ContentSerializationService', () => {
    test('preserves formatting when serializing', () => {
      const editorDiv = document.createElement('div');
      editorDiv.innerHTML = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
      
      const serialized = ContentSerializationService.serializeContent(editorDiv);
      
      expect(serialized).toContain('<strong>Bold</strong>');
      expect(serialized).toContain('<em>italic</em>');
    });

    test('restores formatting when deserializing', () => {
      const htmlContent = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
      
      const deserialized = ContentSerializationService.deserializeContent(htmlContent);
      
      expect(deserialized).toContain('<strong>Bold</strong>');
      expect(deserialized).toContain('<em>italic</em>');
    });

    test('handles empty content properly', () => {
      const deserialized = ContentSerializationService.deserializeContent('');
      
      expect(deserialized).toBe('<p><br></p>');
    });
  });

  describe('UnifiedFormatService', () => {
    let formatService: any;

    beforeEach(() => {
      formatService = ServiceFactory.getUnifiedFormatService();
    });

    test('detects formatting context', () => {
      // Setup DOM with formatted text
      const editorDiv = document.createElement('div');
      editorDiv.className = 'editor-content';
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const textNode = document.createTextNode('bold');
      strong.appendChild(textNode);
      p.appendChild(strong);
      editorDiv.appendChild(p);
      document.body.appendChild(editorDiv);

      // Mock selection to be inside the strong element
      const mockRange = {
        startContainer: textNode,
        startOffset: 2,
        collapsed: true
      };
      
      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange
      };
      
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      // Test format state detection
      const formatState = formatService.getFormatState();
      
      expect(formatState.bold).toBe(true);
    });

    test('handles no formatting gracefully', () => {
      // Setup DOM with plain text
      const editorDiv = document.createElement('div');
      editorDiv.className = 'editor-content';
      const p = document.createElement('p');
      const textNode = document.createTextNode('plain text');
      p.appendChild(textNode);
      editorDiv.appendChild(p);
      document.body.appendChild(editorDiv);

      // Mock selection in plain text
      const mockRange = {
        startContainer: textNode,
        startOffset: 5,
        collapsed: true
      };
      
      const mockSelection = {
        rangeCount: 1,
        getRangeAt: () => mockRange
      };
      
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      // Test format state detection
      const formatState = formatService.getFormatState();
      
      expect(formatState.bold).toBe(false);
    });
  });
});
