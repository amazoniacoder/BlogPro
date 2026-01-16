/**
 * Service Lifecycle Integration Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServiceFactory } from '../../core/services/ServiceFactory';
import { LifecycleManager } from '../../core/lifecycle/LifecycleManager';

describe('Service Lifecycle Integration', () => {
  beforeEach(async () => {
    await ServiceFactory.cleanup();
    LifecycleManager.reset();
  });

  it('should register services with lifecycle manager', async () => {
    const lifecycleManager = LifecycleManager.getInstance();
    
    // Initially no services registered
    expect(lifecycleManager.getRegisteredCount()).toBe(0);
    
    // Create services - they should auto-register
    await ServiceFactory.getUnifiedFormatService();
    await ServiceFactory.getUnifiedSpellCheckService();
    await ServiceFactory.getPerformanceService();
    
    // Services should be registered with lifecycle manager
    expect(lifecycleManager.getRegisteredCount()).toBe(3);
  });

  it('should dispose all services through ServiceFactory cleanup', async () => {
    const lifecycleManager = LifecycleManager.getInstance();
    
    // Create services
    const formatService = await ServiceFactory.getUnifiedFormatService();
    const spellService = await ServiceFactory.getUnifiedSpellCheckService();
    const perfService = await ServiceFactory.getPerformanceService();
    
    // Mock dispose methods
    const formatDisposeSpy = vi.spyOn(formatService as any, 'dispose');
    const spellDisposeSpy = vi.spyOn(spellService as any, 'dispose');
    const perfDisposeSpy = vi.spyOn(perfService as any, 'dispose');
    
    expect(lifecycleManager.getRegisteredCount()).toBe(3);
    
    // Cleanup should dispose all services
    await ServiceFactory.cleanup();
    
    expect(formatDisposeSpy).toHaveBeenCalled();
    expect(spellDisposeSpy).toHaveBeenCalled();
    expect(perfDisposeSpy).toHaveBeenCalled();
    expect(lifecycleManager.isDisposed()).toBe(true);
  });

  it('should handle service creation after cleanup', async () => {
    // Create and cleanup services
    await ServiceFactory.getUnifiedFormatService();
    await ServiceFactory.cleanup();
    
    const lifecycleManager = LifecycleManager.getInstance();
    expect(lifecycleManager.getRegisteredCount()).toBe(0);
    
    // Should be able to create new services after cleanup
    const newService = await ServiceFactory.getUnifiedFormatService();
    expect(newService).toBeDefined();
    expect(lifecycleManager.getRegisteredCount()).toBe(1);
  });

  it('should prevent memory leaks through proper disposal', async () => {
    const initialCount = LifecycleManager.getInstance().getRegisteredCount();
    
    // Create multiple service instances
    for (let i = 0; i < 5; i++) {
      await ServiceFactory.getUnifiedFormatService();
      await ServiceFactory.getPerformanceService();
    }
    
    // Should only have unique singleton instances
    const lifecycleManager = LifecycleManager.getInstance();
    expect(lifecycleManager.getRegisteredCount()).toBe(initialCount + 2);
    
    // Cleanup should dispose all
    await ServiceFactory.cleanup();
    expect(lifecycleManager.isDisposed()).toBe(true);
  });
});
