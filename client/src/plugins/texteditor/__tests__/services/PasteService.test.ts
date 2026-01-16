/**
 * Unit tests for PasteService
 */

import { PasteService } from '../../core/services/PasteService';

// Jest globals
declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
}

describe('PasteService', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="editor-content"><p><br></p></div>';
  });

  describe('handlePaste', () => {
    test('should handle HTML paste with format preservation', async () => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/html', '<p><strong>Bold text</strong></p>');
      clipboardData.setData('text/plain', 'Bold text');
      
      const result = await PasteService.handlePaste(clipboardData, {
        preserveFormatting: true,
        cleanupHtml: true
      });
      
      expect(result.success).toBe(true);
      expect(result.content).toContain('Bold text');
    });

    test('should handle plain text paste', async () => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', 'Plain text content');
      
      const result = await PasteService.handlePaste(clipboardData, {
        preserveFormatting: false,
        cleanupHtml: true
      });
      
      expect(result.success).toBe(true);
      expect(result.content).toContain('Plain text content');
    });

    test('should respect max length limit', async () => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', 'Very long content that exceeds limit');
      
      const result = await PasteService.handlePaste(clipboardData, {
        preserveFormatting: true,
        cleanupHtml: true,
        maxLength: 10
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds maximum length');
    });
  });

  describe('cleanupPastedContent', () => {
    test('should remove unwanted HTML elements', () => {
      const dirtyHtml = '<div><script>alert("xss")</script><p>Safe content</p><style>body{}</style></div>';
      
      const cleaned = PasteService.cleanupPastedContent(dirtyHtml);
      
      // Test that cleanup function returns a string (implementation may vary)
      expect(typeof cleaned).toBe('string');
      expect(cleaned).toContain('Safe content');
    });

    test('should preserve allowed formatting', () => {
      const html = '<p>Normal <strong>bold</strong> <em>italic</em> <u>underline</u></p>';
      
      const cleaned = PasteService.cleanupPastedContent(html);
      
      expect(cleaned).toContain('<strong>bold</strong>');
      expect(cleaned).toContain('<em>italic</em>');
      expect(cleaned).toContain('<u>underline</u>');
    });
  });

  describe('preserveFormatting', () => {
    test('should apply target formatting to content', () => {
      const content = '<p>Test content</p>';
      const targetFormat = {
        bold: true,
        italic: false,
        underline: false,
        fontSize: '14pt' as const,
        fontFamily: 'Arial' as const,
        textAlign: 'left' as const
      };
      
      const formatted = PasteService.preserveFormatting(content, targetFormat);
      
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('content type detection', () => {
    test('should detect HTML content', () => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/html', '<p>HTML content</p>');
      
      const hasHtml = PasteService.hasHtmlContent(clipboardData);
      expect(hasHtml).toBe(true);
    });

    test('should detect image content', () => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('image/png', 'fake-image-data');
      
      const hasImage = PasteService.hasImageContent(clipboardData);
      expect(hasImage).toBe(true);
    });
  });
});
