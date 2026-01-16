/**
 * Plugin System Integration Tests
 * 
 * Tests the complete plugin system integration with the editor.
 */

import { PluginRegistry } from '../../plugins/core/PluginRegistry';
import { WordCountPlugin, SpellCheckPlugin, AutoSavePlugin, PerformancePlugin } from '../../plugins/builtin';
import { PluginSettings } from '../../shared/utils/PluginSettings';

// Test globals
declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var afterEach: any;
}

// Mock editor instance
const mockEditor = {
  getContent: () => '<p>Test content</p>',
  setContent: () => {},
  insertText: () => {},
  getSelection: () => null,
  focus: () => {},
  getElement: () => document.createElement('div'),
  addEventListener: () => {},
  removeEventListener: () => {}
};

describe('Plugin System Integration', () => {
  beforeEach(() => {
    // Clear plugin registry
    PluginRegistry.destroyAll();
    PluginSettings.clear();
    
    // Set mock editor
    PluginRegistry.setEditorInstance(mockEditor);
    
    // Clear DOM
    document.body.innerHTML = `
      <div class="contenteditable-editor">
        <div class="editor-header"></div>
        <div class="editor-content"></div>
        <div class="editor-footer"></div>
      </div>
    `;
  });

  afterEach(async () => {
    await PluginRegistry.destroyAll();
    PluginSettings.clear();
  });

  describe('Plugin Registration', () => {
    test('should register built-in plugins', () => {
      const wordCountPlugin = new WordCountPlugin();
      const spellCheckPlugin = new SpellCheckPlugin();
      const autoSavePlugin = new AutoSavePlugin();
      const performancePlugin = new PerformancePlugin();

      PluginRegistry.register(wordCountPlugin);
      PluginRegistry.register(spellCheckPlugin);
      PluginRegistry.register(autoSavePlugin);
      PluginRegistry.register(performancePlugin);

      const registered = PluginRegistry.getRegisteredPlugins();
      expect(registered).toHaveLength(4);
      
      const pluginNames = registered.map(p => p.name);
      expect(pluginNames).toContain('word-count');
      expect(pluginNames).toContain('spell-check');
      expect(pluginNames).toContain('auto-save');
      expect(pluginNames).toContain('performance-monitor');
    });

    test('should prevent duplicate plugin registration', () => {
      const plugin1 = new WordCountPlugin();
      const plugin2 = new WordCountPlugin();

      PluginRegistry.register(plugin1);
      
      expect(() => {
        PluginRegistry.register(plugin2);
      }).toThrow('Plugin word-count already registered');
    });
  });

  describe('Plugin Initialization', () => {
    test('should initialize plugins with configuration', async () => {
      const wordCountPlugin = new WordCountPlugin();
      PluginRegistry.register(wordCountPlugin);

      const config = {
        compact: true,
        showWords: true,
        showCharacters: false
      };

      await PluginRegistry.initialize('word-count', config);
      
      expect(PluginRegistry.isInitialized('word-count')).toBe(true);
    });

    test('should handle plugin initialization failure', async () => {
      const mockPlugin = {
        name: 'failing-plugin',
        version: '1.0.0',
        description: 'A plugin that fails to initialize',
        initialize: async () => {
          throw new Error('Initialization failed');
        },
        destroy: async () => {}
      };

      PluginRegistry.register(mockPlugin as any);

      await expect(
        PluginRegistry.initialize('failing-plugin')
      ).rejects.toThrow('Initialization failed');
    });
  });

  describe('Plugin Settings', () => {
    test('should save and load plugin settings', () => {
      const settings = {
        compact: false,
        showReadingTime: true,
        readingSpeed: 250
      };

      PluginSettings.save('word-count', true, settings);
      
      const loaded = PluginSettings.load('word-count');
      expect(loaded?.enabled).toBe(true);
      expect(loaded?.config).toEqual(settings);
    });

    test('should toggle plugin enabled state', () => {
      PluginSettings.save('word-count', true, {});
      expect(PluginSettings.isEnabled('word-count')).toBe(true);

      const newState = PluginSettings.toggle('word-count');
      expect(newState).toBe(false);
      expect(PluginSettings.isEnabled('word-count')).toBe(false);
    });

    test('should export and import settings', () => {
      PluginSettings.save('word-count', true, { compact: true });
      PluginSettings.save('spell-check', false, { autoDetect: false });

      const exported = PluginSettings.export();
      expect(exported).toContain('word-count');
      expect(exported).toContain('spell-check');

      PluginSettings.clear();
      expect(PluginSettings.loadAll()).toEqual({});

      const imported = PluginSettings.import(exported);
      expect(imported).toBe(true);
      
      expect(PluginSettings.isEnabled('word-count')).toBe(true);
      expect(PluginSettings.isEnabled('spell-check')).toBe(false);
    });
  });

  describe('Plugin Lifecycle', () => {
    test('should handle complete plugin lifecycle', async () => {
      const wordCountPlugin = new WordCountPlugin();
      PluginRegistry.register(wordCountPlugin);

      // Initialize
      await PluginRegistry.initialize('word-count', { compact: true });
      expect(PluginRegistry.isInitialized('word-count')).toBe(true);

      // Destroy
      await PluginRegistry.destroy('word-count');
      expect(PluginRegistry.isInitialized('word-count')).toBe(false);
    });

    test('should initialize all plugins', async () => {
      PluginRegistry.register(new WordCountPlugin());
      PluginRegistry.register(new SpellCheckPlugin());
      PluginRegistry.register(new AutoSavePlugin());

      await PluginRegistry.initializeAll({
        'word-count': { compact: true },
        'spell-check': { enabled: true },
        'auto-save': { interval: 60000 }
      });

      expect(PluginRegistry.isInitialized('word-count')).toBe(true);
      expect(PluginRegistry.isInitialized('spell-check')).toBe(true);
      expect(PluginRegistry.isInitialized('auto-save')).toBe(true);
    });

    test('should destroy all plugins', async () => {
      PluginRegistry.register(new WordCountPlugin());
      PluginRegistry.register(new SpellCheckPlugin());

      await PluginRegistry.initializeAll();
      
      expect(PluginRegistry.getInitializedPlugins()).toHaveLength(2);

      await PluginRegistry.destroyAll();
      
      expect(PluginRegistry.getInitializedPlugins()).toHaveLength(0);
    });
  });

  describe('Role-based Plugin Access', () => {
    test('should initialize performance plugin for admin only', async () => {
      const performancePlugin = new PerformancePlugin();
      PluginRegistry.register(performancePlugin);

      // Try to initialize as regular user
      await PluginRegistry.initialize('performance-monitor', { userRole: 'user' });
      
      // Plugin should not be active for regular users
      const container = document.querySelector('.plugin-performance');
      expect(container).toBeNull();

      // Destroy and try as admin
      await PluginRegistry.destroy('performance-monitor');
      await PluginRegistry.initialize('performance-monitor', { userRole: 'admin' });
      
      // Should work for admin (plugin creates container)
      expect(PluginRegistry.isInitialized('performance-monitor')).toBe(true);
    });
  });

  describe('Plugin Content Updates', () => {
    test('should update plugins on content change', async () => {
      const wordCountPlugin = new WordCountPlugin();
      PluginRegistry.register(wordCountPlugin);
      await PluginRegistry.initialize('word-count');

      // Simulate content change
      const newContent = '<p>New test content with more words</p>';
      
      // Get plugin and trigger content change
      const plugin = PluginRegistry.getPlugin('word-count');
      if (plugin && plugin.onContentChange) {
        plugin.onContentChange(newContent);
      }

      // Plugin should handle the content change without errors
      expect(PluginRegistry.isInitialized('word-count')).toBe(true);
    });
  });
});
