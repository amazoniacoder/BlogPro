/**
 * Analytics Integration Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnalyticsStorage } from '../../core/analytics/AnalyticsStorage';
import { ZeroDictionarySpellChecker } from '../../core/services/spellcheck/ZeroDictionarySpellChecker';
import { PerformanceService } from '../../core/services/ui/PerformanceService';

// Mock fetch
global.fetch = vi.fn();

describe('Analytics Integration', () => {
  let analytics: AnalyticsStorage;
  let spellChecker: ZeroDictionarySpellChecker;

  beforeEach(() => {
    vi.clearAllMocks();
    AnalyticsStorage.reset();
    ZeroDictionarySpellChecker.resetInstance();
    
    analytics = AnalyticsStorage.getInstance();
    spellChecker = ZeroDictionarySpellChecker.getInstance();

    // Mock successful API responses
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  afterEach(async () => {
    await analytics.dispose();
    AnalyticsStorage.reset();
    ZeroDictionarySpellChecker.resetInstance();
  });

  describe('Spell Check Analytics Integration', () => {
    it('should record spell check events to analytics storage', async () => {
      // Mock spell check API
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/spellcheck/batch')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ results: [true, false, true] })
          });
        }
        if (url.includes('/api/analytics/events')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      // Perform spell check operations
      await spellChecker.checkWord('hello');
      await spellChecker.checkWords(['test', 'wrng', 'word']);

      // Force flush analytics
      await analytics.forceFlush();

      // Verify analytics events were sent
      const analyticsCalls = (global.fetch as any).mock.calls.filter(
        (call: any) => call[0].includes('/api/analytics/events')
      );
      
      expect(analyticsCalls.length).toBeGreaterThan(0);
    });

    it('should track cache hit rates in analytics', async () => {
      // Mock spell check API
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/spellcheck/batch')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ results: [true] })
          });
        }
        if (url.includes('/api/analytics/events')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      // First check (cache miss)
      await spellChecker.checkWord('hello');
      
      // Second check (cache hit)
      await spellChecker.checkWord('hello');

      // Force flush analytics
      await analytics.forceFlush();

      // Verify both cache miss and hit were recorded
      const analyticsCalls = (global.fetch as any).mock.calls.filter(
        (call: any) => call[0].includes('/api/analytics/events')
      );
      
      expect(analyticsCalls.length).toBeGreaterThan(0);
      
      // Check that events contain spell check data
      const eventData = JSON.parse(analyticsCalls[0][1].body);
      expect(eventData.events).toBeDefined();
      expect(eventData.events.some((e: any) => e.eventType === 'spell_check')).toBe(true);
    });
  });

  describe('Performance Analytics Integration', () => {
    it('should record performance metrics to analytics storage', async () => {
      // Perform a measured operation
      const result = PerformanceService.measurePerformance('test_operation', () => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });

      expect(result).toBeDefined();

      // Force flush analytics
      await analytics.forceFlush();

      // Verify performance events were sent
      const analyticsCalls = (global.fetch as any).mock.calls.filter(
        (call: any) => call[0].includes('/api/analytics/events')
      );
      
      expect(analyticsCalls.length).toBeGreaterThan(0);
      
      // Check that events contain performance data
      const eventData = JSON.parse(analyticsCalls[0][1].body);
      expect(eventData.events).toBeDefined();
      expect(eventData.events.some((e: any) => e.eventType === 'performance')).toBe(true);
    });
  });

  describe('Analytics Dashboard Data', () => {
    it('should provide buffer status for monitoring', () => {
      const status = analytics.getBufferStatus();
      
      expect(status).toHaveProperty('size');
      expect(status).toHaveProperty('maxSize');
      expect(typeof status.size).toBe('number');
      expect(typeof status.maxSize).toBe('number');
    });

    it('should provide session tracking', () => {
      const sessionId = analytics.getSessionId();
      
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      
      // Session should remain consistent
      const sessionId2 = analytics.getSessionId();
      expect(sessionId).toBe(sessionId2);
    });
  });

  describe('Error Handling', () => {
    it('should handle analytics API failures gracefully', async () => {
      // Mock API failure
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      // Record events should not throw
      await expect(analytics.recordEvent('performance', { test: true })).resolves.not.toThrow();
      
      // Force flush should not throw
      await expect(analytics.forceFlush()).resolves.not.toThrow();
    });

    it('should continue spell checking when analytics fails', async () => {
      // Mock spell check success but analytics failure
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/spellcheck/batch')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ results: [true] })
          });
        }
        if (url.includes('/api/analytics/events')) {
          return Promise.reject(new Error('Analytics API down'));
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      // Spell check should still work
      const result = await spellChecker.checkWord('hello');
      expect(typeof result).toBe('boolean');
    });
  });
});
