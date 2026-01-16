/**
 * LifecycleManager Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LifecycleManager, Disposable } from '../../core/lifecycle/LifecycleManager';

describe('LifecycleManager', () => {
  let lifecycleManager: LifecycleManager;

  beforeEach(() => {
    LifecycleManager.reset();
    lifecycleManager = LifecycleManager.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = LifecycleManager.getInstance();
      const instance2 = LifecycleManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = LifecycleManager.getInstance();
      LifecycleManager.reset();
      const instance2 = LifecycleManager.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Resource Registration', () => {
    it('should register disposable resources', () => {
      const mockDisposable: Disposable = {
        dispose: vi.fn()
      };

      lifecycleManager.register(mockDisposable);
      
      expect(lifecycleManager.getRegisteredCount()).toBe(1);
    });

    it('should unregister disposable resources', () => {
      const mockDisposable: Disposable = {
        dispose: vi.fn()
      };

      lifecycleManager.register(mockDisposable);
      lifecycleManager.unregister(mockDisposable);
      
      expect(lifecycleManager.getRegisteredCount()).toBe(0);
    });

    it('should throw error when registering after disposal', async () => {
      const mockDisposable: Disposable = {
        dispose: vi.fn()
      };

      await lifecycleManager.dispose();
      
      expect(() => {
        lifecycleManager.register(mockDisposable);
      }).toThrow('LifecycleManager already disposed');
    });
  });

  describe('Resource Disposal', () => {
    it('should dispose all registered resources', async () => {
      const mockDisposable1: Disposable = {
        dispose: vi.fn()
      };
      const mockDisposable2: Disposable = {
        dispose: vi.fn()
      };

      lifecycleManager.register(mockDisposable1);
      lifecycleManager.register(mockDisposable2);

      await lifecycleManager.dispose();

      expect(mockDisposable1.dispose).toHaveBeenCalled();
      expect(mockDisposable2.dispose).toHaveBeenCalled();
      expect(lifecycleManager.getRegisteredCount()).toBe(0);
      expect(lifecycleManager.isDisposed()).toBe(true);
    });

    it('should handle async disposal', async () => {
      const mockAsyncDisposable: Disposable = {
        dispose: vi.fn().mockResolvedValue(undefined)
      };

      lifecycleManager.register(mockAsyncDisposable);

      await lifecycleManager.dispose();

      expect(mockAsyncDisposable.dispose).toHaveBeenCalled();
    });

    it('should handle disposal errors gracefully', async () => {
      const mockErrorDisposable: Disposable = {
        dispose: vi.fn().mockImplementation(() => {
          throw new Error('Disposal error');
        })
      };
      const mockGoodDisposable: Disposable = {
        dispose: vi.fn()
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      lifecycleManager.register(mockErrorDisposable);
      lifecycleManager.register(mockGoodDisposable);

      await lifecycleManager.dispose();

      expect(consoleSpy).toHaveBeenCalledWith('Error disposing resource:', expect.any(Error));
      expect(mockGoodDisposable.dispose).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should not dispose twice', async () => {
      const mockDisposable: Disposable = {
        dispose: vi.fn()
      };

      lifecycleManager.register(mockDisposable);

      await lifecycleManager.dispose();
      await lifecycleManager.dispose(); // Second call

      expect(mockDisposable.dispose).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Management', () => {
    it('should track disposed state', async () => {
      expect(lifecycleManager.isDisposed()).toBe(false);
      
      await lifecycleManager.dispose();
      
      expect(lifecycleManager.isDisposed()).toBe(true);
    });

    it('should track registered count', () => {
      const mockDisposable1: Disposable = { dispose: vi.fn() };
      const mockDisposable2: Disposable = { dispose: vi.fn() };

      expect(lifecycleManager.getRegisteredCount()).toBe(0);
      
      lifecycleManager.register(mockDisposable1);
      expect(lifecycleManager.getRegisteredCount()).toBe(1);
      
      lifecycleManager.register(mockDisposable2);
      expect(lifecycleManager.getRegisteredCount()).toBe(2);
      
      lifecycleManager.unregister(mockDisposable1);
      expect(lifecycleManager.getRegisteredCount()).toBe(1);
    });
  });
});
