/**
 * Plugin Architecture Tests
 */

import { PluginRegistry } from '../../plugins/core/PluginRegistry';
import { BasePlugin, EditorInstance } from '../../plugins/core/PluginInterface';
import { WorkerManager } from '../../core/services/workers/WorkerManager';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
}

class TestPlugin extends BasePlugin {
  readonly name = 'test-plugin';
  readonly version = '1.0.0';
  
  initialized = false;
  destroyed = false;

  protected async onInitialize(): Promise<void> {
    this.initialized = true;
  }

  protected async onDestroy(): Promise<void> {
    this.destroyed = true;
  }
}

describe('Plugin Architecture', () => {
  let mockEditor: EditorInstance;

  beforeEach(() => {
    // Clear registry
    PluginRegistry.destroyAll();
    
    mockEditor = {
      getContent: () => 'test content',
      setContent: () => {},
      insertText: () => {},
      getSelection: () => null,
      focus: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    };
    
    PluginRegistry.setEditorInstance(mockEditor);
  });

  describe('Plugin Registration', () => {
    test('should register plugin', () => {
      const plugin = new TestPlugin();
      PluginRegistry.register(plugin);
      
      const registered = PluginRegistry.getPlugin('test-plugin');
      expect(registered).toBe(plugin);
    });

    test('should prevent duplicate registration', () => {
      const plugin1 = new TestPlugin();
      const plugin2 = new TestPlugin();
      
      PluginRegistry.register(plugin1);
      
      expect(() => {
        PluginRegistry.register(plugin2);
      }).toThrow('Plugin test-plugin already registered');
    });
  });

  describe('Plugin Lifecycle', () => {
    test('should initialize plugin', async () => {
      const plugin = new TestPlugin();
      PluginRegistry.register(plugin);
      
      await PluginRegistry.initialize('test-plugin');
      
      expect(plugin.initialized).toBe(true);
      expect(PluginRegistry.isInitialized('test-plugin')).toBe(true);
    });

    test('should destroy plugin', async () => {
      const plugin = new TestPlugin();
      PluginRegistry.register(plugin);
      
      await PluginRegistry.initialize('test-plugin');
      await PluginRegistry.destroy('test-plugin');
      
      expect(plugin.destroyed).toBe(true);
      expect(PluginRegistry.isInitialized('test-plugin')).toBe(false);
    });
  });

  describe('Worker Manager', () => {
    test('should create worker manager', () => {
      const workerManager = new WorkerManager();
      expect(workerManager).toBeDefined();
    });

    test('should handle cleanup', () => {
      const workerManager = new WorkerManager();
      expect(() => workerManager.destroy()).not.toThrow();
    });
  });
});
