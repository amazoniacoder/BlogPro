/**
 * ZeroDictionarySpellChecker tests
 * Tests the revolutionary zero-dictionary spell checking system
 */

import { ZeroDictionarySpellChecker } from '../../core/services/spellcheck/ZeroDictionarySpellChecker';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

// Mock fetch for API calls
global.fetch = vi.fn();

describe('ZeroDictionarySpellChecker', () => {
  let spellChecker: ZeroDictionarySpellChecker;

  beforeEach(() => {
    // Reset singleton for testing
    ZeroDictionarySpellChecker.resetInstance();
    spellChecker = ZeroDictionarySpellChecker.getInstance();
    vi.clearAllMocks();
  });

  describe('Revolutionary Zero-Dictionary Architecture', () => {
    test('should initialize without loading any dictionaries', () => {
      expect(spellChecker).toBeDefined();
      
      const stats = spellChecker.getStats();
      expect(stats.cache.size).toBe(0); // No dictionaries loaded
      expect(stats.cache.memoryUsage).toBeLessThan(1000); // Minimal memory usage
    });

    test('should validate single word via API', async () => {
      // Mock successful API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ word: 'привет', isValid: true })
      });

      const isValid = await spellChecker.checkWord('привет');
      
      expect(isValid).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/spellcheck/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: 'привет' })
      });
    });

    test('should batch validate multiple words', async () => {
      // Mock successful batch API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [true, true, false] })
      });

      const results = await spellChecker.checkWords(['привет', 'система', 'ошибка']);
      
      expect(results).toEqual([true, true, false]);
      expect(global.fetch).toHaveBeenCalledWith('/api/spellcheck/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: ['привет', 'система', 'ошибка'] })
      });
    });
  });

  describe('Result-Only Caching', () => {
    test('should cache validation results', async () => {
      // Mock API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ word: 'тест', isValid: true })
      });

      // First call - should hit API
      await spellChecker.checkWord('тест');
      
      // Second call - should use cache
      const isValid = await spellChecker.checkWord('тест');
      
      expect(isValid).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only one API call
      
      const stats = spellChecker.getStats();
      expect(stats.cache.size).toBe(1);
      expect(stats.performance.hitRate).toBeGreaterThan(0);
    });

    test('should maintain memory efficiency', async () => {
      // Mock API responses
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ word: 'test', isValid: true })
      });

      // Add many words to test memory limits
      for (let i = 0; i < 100; i++) {
        await spellChecker.checkWord(`слово${i}`);
      }

      const stats = spellChecker.getStats();
      expect(stats.cache.memoryUsage).toBeLessThan(50000); // <50KB for 100 results
    });
  });

  describe('Error Handling', () => {
    test('should handle API failures gracefully', async () => {
      // Mock API failure
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const isValid = await spellChecker.checkWord('тест');
      
      expect(isValid).toBe(true); // Graceful fallback
    });

    test('should handle invalid API responses', async () => {
      // Mock invalid response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const isValid = await spellChecker.checkWord('тест');
      
      expect(isValid).toBe(true); // Graceful fallback
    });
  });

  describe('Performance Analytics', () => {
    test('should provide comprehensive statistics', () => {
      const stats = spellChecker.getStats();
      
      expect(stats).toHaveProperty('cache');
      expect(stats.cache).toHaveProperty('size');
      expect(stats.cache).toHaveProperty('memoryUsage');
      
      expect(stats).toHaveProperty('performance');
      expect(stats.performance).toHaveProperty('requests');
      expect(stats.performance).toHaveProperty('hitRate');
      
      expect(stats).toHaveProperty('predictive');
      expect(stats.predictive).toHaveProperty('analytics');
    });

    test('should track cache hit rates', async () => {
      // Mock API response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ word: 'test', isValid: true })
      });

      // First call - cache miss
      await spellChecker.checkWord('слово');
      
      // Second call - cache hit
      await spellChecker.checkWord('слово');
      
      const stats = spellChecker.getStats();
      expect(stats.performance.hitRate).toBe(0.5); // 50% hit rate
    });
  });

  describe('Cache Management', () => {
    test('should clear cache', async () => {
      // Add some cached results
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ word: 'test', isValid: true })
      });

      await spellChecker.checkWord('тест');
      
      // Clear cache
      spellChecker.clearCache();
      
      const stats = spellChecker.getStats();
      expect(stats.cache.size).toBe(0);
    });
  });
});
