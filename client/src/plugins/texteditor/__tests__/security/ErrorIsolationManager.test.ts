/**
 * Error Isolation Manager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorIsolationManager } from '../../core/errors/ErrorIsolationManager';
import { AnalyticsStorage } from '../../core/analytics/AnalyticsStorage';

// Mock AnalyticsStorage
vi.mock('../../core/analytics/AnalyticsStorage', () => ({
  AnalyticsStorage: {
    getInstance: vi.fn(() => ({
      recordEvent: vi.fn()
    }))
  }
}));

describe('ErrorIsolationManager', () => {
  let errorManager: ErrorIsolationManager;

  beforeEach(() => {
    errorManager = new ErrorIsolationManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Handling', () => {
    it('should handle first error with retry action', async () => {
      const error = new Error('Test error');
      const action = await errorManager.handlePluginError('test-plugin', error);
      
      expect(action.action).toBe('retry');
      expect(action.delay).toBe(1000); // First retry delay
      expect(action.reason).toContain('Retry attempt 1/3');
    });

    it('should increase delay with each error', async () => {
      const error = new Error('Test error');
      
      const action1 = await errorManager.handlePluginError('test-plugin', error);
      expect(action1.delay).toBe(1000);
      
      const action2 = await errorManager.handlePluginError('test-plugin', error);
      expect(action2.delay).toBe(2000);
      
      const action3 = await errorManager.handlePluginError('test-plugin', error);
      expect(action3.delay).toBe(4000);
    });

    it('should disable plugin after max errors', async () => {
      const error = new Error('Test error');
      
      // First 3 errors should retry
      await errorManager.handlePluginError('test-plugin', error);
      await errorManager.handlePluginError('test-plugin', error);
      const action3 = await errorManager.handlePluginError('test-plugin', error);
      
      expect(action3.action).toBe('disable');
      expect(action3.reason).toContain('Too many errors (3/3)');
      expect(errorManager.isPluginDisabled('test-plugin')).toBe(true);
    });

    it('should ignore errors from already disabled plugins', async () => {
      const error = new Error('Test error');
      
      // Disable plugin with 3 errors
      await errorManager.handlePluginError('test-plugin', error);
      await errorManager.handlePluginError('test-plugin', error);
      await errorManager.handlePluginError('test-plugin', error);
      
      // Next error should be ignored
      const action = await errorManager.handlePluginError('test-plugin', error);
      expect(action.action).toBe('ignore');
      expect(action.reason).toBe('Plugin already disabled');
    });

    it('should record analytics events for errors', async () => {
      const mockAnalytics = AnalyticsStorage.getInstance();
      const error = new Error('Test error');
      const context = { phase: 'initialization' };
      
      await errorManager.handlePluginError('test-plugin', error, context);
      
      expect(mockAnalytics.recordEvent).toHaveBeenCalledWith('error', {
        component: 'test-plugin',
        errorMessage: 'Test error',
        errorStack: error.stack,
        context
      });
    });
  });

  describe('Plugin Management', () => {
    it('should track disabled plugins', async () => {
      const error = new Error('Test error');
      
      expect(errorManager.isPluginDisabled('test-plugin')).toBe(false);
      
      // Disable plugin with errors
      await errorManager.handlePluginError('test-plugin', error);
      await errorManager.handlePluginError('test-plugin', error);
      await errorManager.handlePluginError('test-plugin', error);
      
      expect(errorManager.isPluginDisabled('test-plugin')).toBe(true);
      expect(errorManager.getDisabledPlugins()).toContain('test-plugin');
    });

    it('should re-enable disabled plugins', async () => {
      const error = new Error('Test error');
      
      // Disable plugin
      await errorManager.handlePluginError('test-plugin', error);
      await errorManager.handlePluginError('test-plugin', error);
      await errorManager.handlePluginError('test-plugin', error);
      
      expect(errorManager.isPluginDisabled('test-plugin')).toBe(true);
      
      // Re-enable plugin
      errorManager.enablePlugin('test-plugin');
      
      expect(errorManager.isPluginDisabled('test-plugin')).toBe(false);
      expect(errorManager.getDisabledPlugins()).not.toContain('test-plugin');
    });
  });

  describe('Error Statistics', () => {
    it('should provide error statistics', async () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      
      await errorManager.handlePluginError('plugin1', error1);
      await errorManager.handlePluginError('plugin2', error2);
      await errorManager.handlePluginError('plugin1', error1);
      
      const stats = errorManager.getErrorStats();
      
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByPlugin['plugin1']).toBe(2);
      expect(stats.errorsByPlugin['plugin2']).toBe(1);
      expect(stats.recentErrors).toHaveLength(3);
    });

    it('should filter recent errors by time window', async () => {
      const error = new Error('Test error');
      
      // Mock old timestamp
      const oldTimestamp = Date.now() - 120000; // 2 minutes ago
      vi.spyOn(Date, 'now').mockReturnValueOnce(oldTimestamp);
      
      await errorManager.handlePluginError('old-plugin', error);
      
      // Restore normal timestamp
      vi.restoreAllMocks();
      
      await errorManager.handlePluginError('new-plugin', error);
      
      const stats = errorManager.getErrorStats();
      
      // Should only count recent errors in errorsByPlugin
      expect(stats.errorsByPlugin['old-plugin']).toBeUndefined();
      expect(stats.errorsByPlugin['new-plugin']).toBe(1);
      expect(stats.totalErrors).toBe(2); // Total includes all errors
    });

    it('should maintain error history size limit', async () => {
      const error = new Error('Test error');
      
      // Add more than max history (100 errors)
      for (let i = 0; i < 105; i++) {
        await errorManager.handlePluginError(`plugin-${i}`, error);
      }
      
      const stats = errorManager.getErrorStats();
      expect(stats.totalErrors).toBe(100); // Should be capped at max
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all errors and re-enable plugins', async () => {
      const error = new Error('Test error');
      
      // Create some errors and disable plugins
      await errorManager.handlePluginError('plugin1', error);
      await errorManager.handlePluginError('plugin1', error);
      await errorManager.handlePluginError('plugin1', error);
      
      await errorManager.handlePluginError('plugin2', error);
      
      expect(errorManager.isPluginDisabled('plugin1')).toBe(true);
      expect(errorManager.getErrorStats().totalErrors).toBeGreaterThan(0);
      
      // Reset
      errorManager.reset();
      
      expect(errorManager.isPluginDisabled('plugin1')).toBe(false);
      expect(errorManager.getDisabledPlugins()).toHaveLength(0);
      expect(errorManager.getErrorStats().totalErrors).toBe(0);
    });
  });
});
