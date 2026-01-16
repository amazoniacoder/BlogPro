/**
 * Plugin Sandbox Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PluginSandbox, PluginPermissions, ResourceLimits } from '../../plugins/security/PluginSandbox';
import { EditorInstance } from '../../plugins/core/PluginInterface';

// Mock fetch
global.fetch = vi.fn();

describe('PluginSandbox', () => {
  let sandbox: PluginSandbox;
  let mockEditor: EditorInstance;
  let permissions: PluginPermissions;
  let resourceLimits: ResourceLimits;

  beforeEach(() => {
    vi.clearAllMocks();
    
    permissions = {
      dom: true,
      network: true,
      storage: true,
      editor: ['read', 'write']
    };
    
    resourceLimits = {
      memoryLimit: '10MB',
      cpuTime: '100ms',
      networkRequests: 5
    };
    
    sandbox = new PluginSandbox(permissions, resourceLimits);
    
    mockEditor = {
      getContent: vi.fn(() => 'test content'),
      setContent: vi.fn(),
      insertText: vi.fn(),
      getSelection: vi.fn(),
      focus: vi.fn(),
      getElement: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
  });

  describe('Secure Context Creation', () => {
    it('should create secure context with proper permissions', () => {
      const context = sandbox.createSecureContext(mockEditor);
      
      expect(context.permissions).toEqual(permissions);
      expect(context.editor).toBeDefined();
      expect(context.storage).toBeDefined();
      expect(context.network).toBeDefined();
    });

    it('should restrict editor access based on permissions', () => {
      const restrictedPermissions: PluginPermissions = {
        dom: false,
        network: false,
        storage: false,
        editor: ['read']
      };
      
      const restrictedSandbox = new PluginSandbox(restrictedPermissions, resourceLimits);
      const context = restrictedSandbox.createSecureContext(mockEditor);
      
      // Should have read access
      expect(context.editor.getContent).toBeDefined();
      expect(context.editor.getSelection).toBeDefined();
      
      // Should not have write access
      expect(context.editor.setContent).toBeUndefined();
      expect(context.editor.insertText).toBeUndefined();
    });

    it('should disable storage when not permitted', () => {
      const noStoragePermissions: PluginPermissions = {
        dom: true,
        network: true,
        storage: false,
        editor: ['read', 'write']
      };
      
      const noStorageSandbox = new PluginSandbox(noStoragePermissions, resourceLimits);
      const context = noStorageSandbox.createSecureContext(mockEditor);
      
      expect(context.storage).toBeNull();
    });

    it('should disable network when not permitted', () => {
      const noNetworkPermissions: PluginPermissions = {
        dom: true,
        network: false,
        storage: true,
        editor: ['read', 'write']
      };
      
      const noNetworkSandbox = new PluginSandbox(noNetworkPermissions, resourceLimits);
      const context = noNetworkSandbox.createSecureContext(mockEditor);
      
      expect(context.network).toBeNull();
    });
  });

  describe('Storage Proxy', () => {
    it('should prefix storage keys', () => {
      const context = sandbox.createSecureContext(mockEditor);
      const storage = context.storage!;
      
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      const getItemSpy = vi.spyOn(localStorage, 'getItem');
      
      storage.setItem('test', 'value');
      expect(setItemSpy).toHaveBeenCalledWith('plugin_test', 'value');
      
      storage.getItem('test');
      expect(getItemSpy).toHaveBeenCalledWith('plugin_test');
    });

    it('should enforce storage size limits', () => {
      const context = sandbox.createSecureContext(mockEditor);
      const storage = context.storage!;
      
      const largeValue = 'x'.repeat(1024 * 101); // 101KB
      
      expect(() => {
        storage.setItem('large', largeValue);
      }).toThrow('Plugin storage limit exceeded (100KB)');
    });
  });

  describe('Network Proxy', () => {
    it('should allow HTTPS requests to external domains', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });
      
      const context = sandbox.createSecureContext(mockEditor);
      const network = context.network!;
      
      await network.fetch('https://api.example.com/data');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      );
    });

    it('should block localhost requests', async () => {
      const context = sandbox.createSecureContext(mockEditor);
      const network = context.network!;
      
      await expect(
        network.fetch('http://localhost:3000/api')
      ).rejects.toThrow('Plugin network access denied');
    });

    it('should block HTTP requests', async () => {
      const context = sandbox.createSecureContext(mockEditor);
      const network = context.network!;
      
      await expect(
        network.fetch('http://example.com/api')
      ).rejects.toThrow('Plugin network access denied');
    });

    it('should enforce request limits', async () => {
      (global.fetch as any).mockResolvedValue({ ok: true });
      
      const context = sandbox.createSecureContext(mockEditor);
      const network = context.network!;
      
      // Make requests up to limit
      for (let i = 0; i < resourceLimits.networkRequests; i++) {
        await network.fetch('https://api.example.com/test');
      }
      
      // Next request should fail
      await expect(
        network.fetch('https://api.example.com/test')
      ).rejects.toThrow('Plugin network request limit exceeded');
    });
  });

  describe('Event Listener Restrictions', () => {
    it('should allow safe events', () => {
      const context = sandbox.createSecureContext(mockEditor);
      const handler = vi.fn();
      
      context.editor.addEventListener?.('input', handler);
      
      expect(mockEditor.addEventListener).toHaveBeenCalledWith('input', handler);
    });

    it('should block unsafe events', () => {
      const context = sandbox.createSecureContext(mockEditor);
      const handler = vi.fn();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      context.editor.addEventListener?.('click', handler);
      
      expect(mockEditor.addEventListener).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Plugin sandbox: Event 'click' not allowed");
      
      consoleSpy.mockRestore();
    });
  });

  describe('Resource Management', () => {
    it('should track resource usage', async () => {
      (global.fetch as any).mockResolvedValue({ ok: true });
      
      const context = sandbox.createSecureContext(mockEditor);
      const network = context.network!;
      
      await network.fetch('https://api.example.com/test1');
      await network.fetch('https://api.example.com/test2');
      
      const usage = sandbox.getResourceUsage();
      expect(usage.networkRequests).toBe(2);
      expect(usage.networkLimit).toBe(resourceLimits.networkRequests);
    });

    it('should reset resource counters', async () => {
      (global.fetch as any).mockResolvedValue({ ok: true });
      
      const context = sandbox.createSecureContext(mockEditor);
      const network = context.network!;
      
      await network.fetch('https://api.example.com/test');
      
      expect(sandbox.getResourceUsage().networkRequests).toBe(1);
      
      sandbox.resetResourceCounters();
      
      expect(sandbox.getResourceUsage().networkRequests).toBe(0);
    });
  });
});
