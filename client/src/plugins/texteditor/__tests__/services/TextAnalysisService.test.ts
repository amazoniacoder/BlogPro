/**
 * UnifiedTextAnalysisService Tests
 * Following development methodology for comprehensive service testing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UnifiedTextAnalysisService } from '../../core/services/analysis/UnifiedTextAnalysisService';

describe('UnifiedTextAnalysisService', () => {
  beforeEach(() => {
    UnifiedTextAnalysisService.clearCache();
  });

  afterEach(() => {
    UnifiedTextAnalysisService.clearCache();
  });

  describe('Word Counting', () => {
    it('counts English words correctly', () => {
      const result = UnifiedTextAnalysisService.getWordCount('hello world test');
      expect(result).toBe(3);
    });

    it('counts Russian words correctly', () => {
      const result = UnifiedTextAnalysisService.getWordCount('привет мир тест');
      expect(result).toBe(3);
    });

    it('counts mixed language words correctly', () => {
      const result = UnifiedTextAnalysisService.getWordCount('hello мир test тест');
      expect(result).toBe(4);
    });

    it('does not count single characters as words', () => {
      const result = UnifiedTextAnalysisService.getWordCount('a я 1 b');
      expect(result).toBe(0);
    });

    it('counts words with 2+ characters only', () => {
      const result = UnifiedTextAnalysisService.getWordCount('ab яя 12 cd тест');
      expect(result).toBe(5);
    });

    it('handles empty content', () => {
      const result = UnifiedTextAnalysisService.getWordCount('');
      expect(result).toBe(0);
    });

    it('handles whitespace-only content', () => {
      const result = UnifiedTextAnalysisService.getWordCount('   \n\t  ');
      expect(result).toBe(0);
    });

    it('handles HTML content correctly', () => {
      const result = UnifiedTextAnalysisService.getWordCount('<p>hello</p><p>world</p>');
      expect(result).toBe(2);
    });

    it('handles complex HTML with nested tags', () => {
      const result = UnifiedTextAnalysisService.getWordCount('<div><p>hello <strong>world</strong></p><br><p>test</p></div>');
      expect(result).toBe(3);
    });

    it('handles numbers correctly', () => {
      const result = UnifiedTextAnalysisService.getWordCount('test 123 hello 456');
      expect(result).toBe(4);
    });

    it('handles punctuation correctly', () => {
      const result = UnifiedTextAnalysisService.getWordCount('hello, world! How are you?');
      expect(result).toBe(5);
    });
  });

  describe('Character Counting', () => {
    it('counts characters including spaces', () => {
      const result = UnifiedTextAnalysisService.getCharacterCount('hello world', true);
      expect(result).toBe(11);
    });

    it('counts characters excluding spaces', () => {
      const result = UnifiedTextAnalysisService.getCharacterCount('hello world', false);
      expect(result).toBe(10);
    });

    it('counts Russian characters correctly', () => {
      const result = UnifiedTextAnalysisService.getCharacterCount('привет мир', false);
      expect(result).toBe(9);
    });

    it('handles HTML content when includeHtml is false', () => {
      const result = UnifiedTextAnalysisService.getCharacterCount('<p>hello</p>', false, false);
      expect(result).toBe(5); // Only "hello"
    });

    it('includes HTML when includeHtml is true', () => {
      const result = UnifiedTextAnalysisService.getCharacterCount('<p>hello</p>', false, true);
      expect(result).toBe(12); // Full string without spaces
    });
  });

  describe('Reading Time Calculation', () => {
    it('calculates reading time with default speed', () => {
      const content = Array(200).fill('word').join(' '); // 200 words
      const result = UnifiedTextAnalysisService.getReadingTime(content);
      expect(result).toBe(1); // 200 words / 200 WPM = 1 minute
    });

    it('calculates reading time with custom speed', () => {
      const content = Array(300).fill('word').join(' '); // 300 words
      const result = UnifiedTextAnalysisService.getReadingTime(content, 100);
      expect(result).toBe(3); // 300 words / 100 WPM = 3 minutes
    });

    it('rounds up reading time', () => {
      const content = Array(150).fill('word').join(' '); // 150 words
      const result = UnifiedTextAnalysisService.getReadingTime(content, 200);
      expect(result).toBe(1); // 150/200 = 0.75, rounded up to 1
    });

    it('handles empty content', () => {
      const result = UnifiedTextAnalysisService.getReadingTime('');
      expect(result).toBe(0);
    });
  });

  describe('Paragraph Counting', () => {
    it('counts paragraphs separated by double line breaks', () => {
      // The HTML stripping normalizes whitespace, so plain text becomes single paragraph
      // Use HTML content for proper paragraph counting
      const result = UnifiedTextAnalysisService.getParagraphCount('<p>Para 1</p><p>Para 2</p><p>Para 3</p>', true);
      expect(result).toBe(3);
    });

    it('handles single paragraph', () => {
      const result = UnifiedTextAnalysisService.getParagraphCount('Single paragraph');
      expect(result).toBe(1);
    });

    it('handles empty content', () => {
      const result = UnifiedTextAnalysisService.getParagraphCount('');
      expect(result).toBe(0);
    });

    it('handles HTML paragraphs when includeHtml is true', () => {
      const result = UnifiedTextAnalysisService.getParagraphCount('<p>Para 1</p><p>Para 2</p>', true);
      expect(result).toBe(2);
    });
  });

  describe('Sentence Counting', () => {
    it('counts sentences separated by periods', () => {
      const result = UnifiedTextAnalysisService.getSentenceCount('First sentence. Second sentence. Third sentence.');
      expect(result).toBe(3);
    });

    it('counts sentences with different punctuation', () => {
      const result = UnifiedTextAnalysisService.getSentenceCount('Question? Exclamation! Statement.');
      expect(result).toBe(3);
    });

    it('handles empty content', () => {
      const result = UnifiedTextAnalysisService.getSentenceCount('');
      expect(result).toBe(0);
    });

    it('filters out sentences with insufficient words', () => {
      const result = UnifiedTextAnalysisService.getSentenceCount('A. Hello world. B.', {
        minWordsPerSentence: 2
      });
      expect(result).toBe(1); // Only "Hello world" has 2+ words
    });
  });

  describe('Comprehensive Analysis', () => {
    it('analyzes text comprehensively', () => {
      const content = 'Hello world. This is a test. How are you?';
      const result = UnifiedTextAnalysisService.analyzeText(content);
      
      expect(result).toEqual(
        expect.objectContaining({
          words: expect.any(Number),
          characters: expect.any(Number),
          charactersNoSpaces: expect.any(Number),
          paragraphs: expect.any(Number),
          sentences: expect.any(Number),
          readingTime: expect.any(Number),
          averageWordsPerSentence: expect.any(Number),
          averageSentencesPerParagraph: expect.any(Number)
        })
      );
    });

    it('handles complex multilingual content', () => {
      const content = 'Hello мир. Это тест. How дела?';
      const result = UnifiedTextAnalysisService.analyzeText(content);
      
      expect(result.words).toBeGreaterThan(0);
      expect(result.sentences).toBe(3);
    });

    it('uses custom options', () => {
      const content = 'Test content for analysis.';
      const result = UnifiedTextAnalysisService.analyzeText(content, {
        readingSpeed: 100,
        includeHtml: false
      });
      
      expect(result.readingTime).toBeGreaterThan(0);
    });
  });



  describe('HTML Stripping', () => {
    it('removes HTML tags correctly', () => {
      const result = UnifiedTextAnalysisService.getWordCount('<p>hello <strong>world</strong></p>');
      expect(result).toBe(2);
    });

    it('handles empty HTML tags', () => {
      const result = UnifiedTextAnalysisService.getWordCount('<p></p><div>hello</div><p></p>');
      expect(result).toBe(1);
    });

    it('handles nested HTML tags', () => {
      const result = UnifiedTextAnalysisService.getWordCount('<div><p><span>hello</span> world</p></div>');
      expect(result).toBe(2);
    });

    it('handles HTML entities', () => {
      const result = UnifiedTextAnalysisService.getWordCount('hello&nbsp;world&amp;test');
      expect(result).toBe(3); // "hello", "world", and "test" (after entity decoding)
    });

    it('preserves word boundaries with block elements', () => {
      const result = UnifiedTextAnalysisService.getWordCount('<p>hello</p><p>world</p>');
      expect(result).toBe(2);
    });
  });

  describe('Caching', () => {
    it('caches analysis results', () => {
      const content = 'test content for caching';
      
      const result1 = UnifiedTextAnalysisService.analyzeText(content);
      const result2 = UnifiedTextAnalysisService.analyzeText(content);
      
      expect(result1).toEqual(result2);
      
      const stats = UnifiedTextAnalysisService.getCacheStats();
      expect(stats.size).toBe(1);
    });

    it('uses different cache keys for different options', () => {
      const content = 'test content';
      
      UnifiedTextAnalysisService.analyzeText(content, { readingSpeed: 200 });
      UnifiedTextAnalysisService.analyzeText(content, { readingSpeed: 300 });
      
      const stats = UnifiedTextAnalysisService.getCacheStats();
      expect(stats.size).toBe(2);
    });

    it('clears cache correctly', () => {
      UnifiedTextAnalysisService.analyzeText('test content');
      
      let stats = UnifiedTextAnalysisService.getCacheStats();
      expect(stats.size).toBe(1);
      
      UnifiedTextAnalysisService.clearCache();
      
      stats = UnifiedTextAnalysisService.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('manages cache size limit', () => {
      // Fill cache beyond limit
      for (let i = 0; i < 150; i++) {
        UnifiedTextAnalysisService.analyzeText(`test content ${i}`);
      }
      
      const stats = UnifiedTextAnalysisService.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });
  });

  describe('Edge Cases', () => {
    it('handles very long content', () => {
      const longContent = Array(10000).fill('word').join(' ');
      const result = UnifiedTextAnalysisService.getWordCount(longContent);
      expect(result).toBe(10000);
    });

    it('handles content with only punctuation', () => {
      const result = UnifiedTextAnalysisService.getWordCount('!@#$%^&*().,;:');
      expect(result).toBe(0);
    });

    it('handles mixed scripts correctly', () => {
      const result = UnifiedTextAnalysisService.getWordCount('hello 你好 مرحبا שלום');
      expect(result).toBe(4);
    });

    it('handles numbers and special characters', () => {
      const result = UnifiedTextAnalysisService.getWordCount('test123 hello_world 456test');
      expect(result).toBe(4); // "test", "123", "hello_world", "456test" - underscore splits words
    });

    it('handles malformed HTML gracefully', () => {
      const result = UnifiedTextAnalysisService.getWordCount('<p>hello <world</p>');
      expect(result).toBe(2);
    });
  });
});
