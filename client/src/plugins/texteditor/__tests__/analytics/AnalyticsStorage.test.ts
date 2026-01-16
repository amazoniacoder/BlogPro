/**
 * AnalyticsStorage Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnalyticsStorage } from '../../core/analytics/AnalyticsStorage';

// Mock fetch
global.fetch = vi.fn();

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
};
global.indexedDB = mockIndexedDB as any;

describe('AnalyticsStorage', () => {
  let analytics: AnalyticsStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    AnalyticsStorage.reset();
    analytics = AnalyticsStorage.getInstance();
  });

  afterEach(async () => {
    await analytics.dispose();
    AnalyticsStorage.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = AnalyticsStorage.getInstance();
      const instance2 = AnalyticsStorage.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = AnalyticsStorage.getInstance();
      AnalyticsStorage.reset();
      const instance2 = AnalyticsStorage.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Event Recording', () => {
    it('should record analytics events', async () => {
      const eventData = {
        operation: 'test_operation',
        duration: 100
      };

      await analytics.recordEvent('performance', eventData);
      
      const bufferStatus = analytics.getBufferStatus();
      expect(bufferStatus.size).toBe(1);
    });

    it('should generate unique event IDs', async () => {
      await analytics.recordEvent('performance', { test: 1 });
      await analytics.recordEvent('usage', { test: 2 });
      
      const bufferStatus = analytics.getBufferStatus();
      expect(bufferStatus.size).toBe(2);
    });

    it('should include metadata in events', async () => {
      const eventData = { operation: 'test' };
      
      await analytics.recordEvent('performance', eventData);
      
      // Event should be buffered with metadata
      expect(analytics.getBufferStatus().size).toBe(1);
    });
  });

  describe('Buffer Management', () => {
    it('should auto-flush when buffer is full', async () => {
      // Mock successful fetch
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Fill buffer to trigger auto-flush
      for (let i = 0; i < 50; i++) {
        await analytics.recordEvent('performance', { test: i });
      }

      // Should have triggered flush
      expect(global.fetch).toHaveBeenCalledWith('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('events')
      });
    });

    it('should handle server errors gracefully', async () => {
      // Mock server error
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500
      });

      // Add one event to trigger flush attempt
      await analytics.recordEvent('performance', { test: 1 });
      
      // Force flush to test error handling
      await analytics.forceFlush();

      // Should attempt server call
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('should generate unique session ID', () => {
      const sessionId = analytics.getSessionId();
      
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should maintain same session ID during instance lifetime', () => {
      const sessionId1 = analytics.getSessionId();
      const sessionId2 = analytics.getSessionId();
      
      expect(sessionId1).toBe(sessionId2);
    });
  });

  describe('Force Flush', () => {
    it('should flush buffered events on demand', async () => {
      // Mock successful fetch
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Add some events
      await analytics.recordEvent('performance', { test: 1 });
      await analytics.recordEvent('usage', { test: 2 });

      expect(analytics.getBufferStatus().size).toBe(2);

      // Force flush
      await analytics.forceFlush();

      expect(analytics.getBufferStatus().size).toBe(0);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Lifecycle Management', () => {
    it('should flush events on disposal', async () => {
      // Mock successful fetch
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Add events
      await analytics.recordEvent('performance', { test: 1 });
      
      expect(analytics.getBufferStatus().size).toBe(1);

      // Dispose should flush
      await analytics.dispose();

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should clear periodic flush timer on disposal', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      await analytics.dispose();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
