/**
 * DIContainer Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DIContainer } from '../../core/di/DIContainer';

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  describe('Service Registration', () => {
    it('should register a service', () => {
      container.register('testService', {
        factory: () => ({ test: true }),
        singleton: true
      });

      expect(container.isRegistered('testService')).toBe(true);
    });

    it('should throw error when registering duplicate service', () => {
      container.register('testService', {
        factory: () => ({ test: true })
      });

      expect(() => {
        container.register('testService', {
          factory: () => ({ test: false })
        });
      }).toThrow("Service 'testService' is already registered");
    });
  });

  describe('Service Resolution', () => {
    it('should resolve a simple service', async () => {
      const testObject = { value: 42 };
      
      container.register('testService', {
        factory: () => testObject
      });

      const resolved = await container.resolve('testService');
      expect(resolved).toBe(testObject);
    });

    it('should resolve singleton service only once', async () => {
      let callCount = 0;
      
      container.register('singletonService', {
        factory: () => {
          callCount++;
          return { id: callCount };
        },
        singleton: true
      });

      const first = await container.resolve('singletonService');
      const second = await container.resolve('singletonService');

      expect(first).toBe(second);
      expect(callCount).toBe(1);
    });

    it('should create new instance for non-singleton services', async () => {
      let callCount = 0;
      
      container.register('transientService', {
        factory: () => {
          callCount++;
          return { id: callCount };
        },
        singleton: false
      });

      const first = await container.resolve('transientService');
      const second = await container.resolve('transientService');

      expect(first).not.toBe(second);
      expect(callCount).toBe(2);
    });

    it('should throw error for unregistered service', async () => {
      await expect(container.resolve('nonExistentService'))
        .rejects.toThrow("Service 'nonExistentService' not found");
    });
  });

  describe('Dependency Resolution', () => {
    it('should resolve dependencies', async () => {
      container.register('dependency', {
        factory: () => ({ name: 'dependency' }),
        singleton: true
      });

      container.register('service', {
        factory: async () => {
          const dep = await container.resolve('dependency');
          return { dependency: dep };
        },
        dependencies: ['dependency'],
        singleton: true
      });

      const resolved = await container.resolve('service') as any;
      expect(resolved.dependency.name).toBe('dependency');
    });

    it('should detect circular dependencies', async () => {
      container.register('serviceA', {
        factory: () => container.resolve('serviceB'),
        dependencies: ['serviceB']
      });

      container.register('serviceB', {
        factory: () => container.resolve('serviceA'),
        dependencies: ['serviceA']
      });

      await expect(container.resolve('serviceA'))
        .rejects.toThrow("Circular dependency detected for service 'serviceA'");
    });
  });

  describe('Lifecycle Management', () => {
    it('should dispose services with dispose method', async () => {
      let disposed = false;
      
      const service = {
        dispose: () => { disposed = true; }
      };

      container.register('disposableService', {
        factory: () => service,
        singleton: true
      });

      await container.resolve('disposableService');
      await container.dispose();

      expect(disposed).toBe(true);
    });

    it('should clear all services on dispose', async () => {
      container.register('testService', {
        factory: () => ({ test: true }),
        singleton: true
      });

      await container.resolve('testService');
      await container.dispose();

      expect(container.getRegisteredServices()).toHaveLength(0);
    });
  });

  describe('Utility Methods', () => {
    it('should return registered service names', () => {
      container.register('service1', { factory: () => ({}) });
      container.register('service2', { factory: () => ({}) });

      const services = container.getRegisteredServices();
      expect(services).toContain('service1');
      expect(services).toContain('service2');
      expect(services).toHaveLength(2);
    });

    it('should clear specific instance', async () => {
      let callCount = 0;
      
      container.register('testService', {
        factory: () => ({ id: ++callCount }),
        singleton: true
      });

      const first = await container.resolve('testService') as any;
      container.clearInstance('testService');
      const second = await container.resolve('testService') as any;

      expect(first.id).toBe(1);
      expect(second.id).toBe(2);
    });
  });
});
