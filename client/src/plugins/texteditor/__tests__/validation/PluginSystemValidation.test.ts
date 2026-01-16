/**
 * Plugin System Validation Tests
 * 
 * Final validation tests to ensure plugin system is production-ready.
 */

import { PluginRegistry } from '../../plugins/core/PluginRegistry';
import { WordCountPlugin, SpellCheckPlugin, AutoSavePlugin, PerformancePlugin } from '../../plugins/builtin';
import { PluginSettings } from '../../shared/utils/PluginSettings';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var afterEach: any;
}

const mockEditor = {
  getContent: () => '<p>Test content for validation</p>',
  setContent: () => {},
  insertText: () => {},
  getSelection: () => null,
  focus: () => {},
  getElement: () => document.createElement('div'),
  addEventListener: () => {},
  removeEventListener: () => {}
};

describe('Plugin System Production Validation', () => {
  beforeEach(() => {
    PluginRegistry.destroyAll();
    PluginSettings.clear();
    PluginRegistry.setEditorInstance(mockEditor);
    
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

  describe('Production Readiness', () => {
    test('should handle complete editor lifecycle', async () => {
      // Register all built-in plugins
      PluginRegistry.register(new WordCountPlugin());
      PluginRegistry.register(new SpellCheckPlugin());
      PluginRegistry.register(new AutoSavePlugin());
      PluginRegistry.register(new PerformancePlugin());

      // Initialize with realistic configuration
      await PluginRegistry.initialize('word-count', {
        compact: true,
        showWords: true,
        showCharacters: true,
        showReadingTime: true
      });

      await PluginRegistry.initialize('spell-check', {
        enabled: true,
        autoDetect: true
      });

      await PluginRegistry.initialize('auto-save', {
        enabled: true,
        interval: 300000,
        onSave: async () => {
          return Promise.resolve();
        }
      });

      // Verify all plugins are active
      expect(PluginRegistry.isInitialized('word-count')).toBe(true);
      expect(PluginRegistry.isInitialized('spell-check')).toBe(true);
      expect(PluginRegistry.isInitialized('auto-save')).toBe(true);

      // Simulate content changes
      const plugins = ['word-count', 'spell-check', 'auto-save'];
      plugins.forEach(pluginName => {
        const plugin = PluginRegistry.getPlugin(pluginName);
        if (plugin?.onContentChange) {
          plugin.onContentChange('<p>Updated content</p>');
        }
      });

      // Clean shutdown
      await PluginRegistry.destroyAll();
      expect(PluginRegistry.getInitializedPlugins()).toHaveLength(0);
    });

    test('should maintain functionality after multiple plugin toggles', async () => {
      PluginRegistry.register(new WordCountPlugin());
      
      // Initialize -> Destroy -> Initialize cycle
      for (let i = 0; i < 3; i++) {
        await PluginRegistry.initialize('word-count', { compact: true });
        expect(PluginRegistry.isInitialized('word-count')).toBe(true);
        
        await PluginRegistry.destroy('word-count');
        expect(PluginRegistry.isInitialized('word-count')).toBe(false);
      }

      // Final initialization should work
      await PluginRegistry.initialize('word-count', { compact: true });
      expect(PluginRegistry.isInitialized('word-count')).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    test('should recover from plugin initialization failures', async () => {
      const failingPlugin = {
        name: 'failing-plugin',
        version: '1.0.0',
        description: 'Plugin that fails',
        initialize: async () => {
          throw new Error('Initialization failed');
        },
        destroy: async () => {}
      };

      PluginRegistry.register(failingPlugin as any);
      PluginRegistry.register(new WordCountPlugin());

      // Failing plugin should not affect others
      try {
        await PluginRegistry.initialize('failing-plugin');
      } catch (error) {
        // Expected to fail
      }

      // Other plugins should still work
      await PluginRegistry.initialize('word-count', { compact: true });
      expect(PluginRegistry.isInitialized('word-count')).toBe(true);
      expect(PluginRegistry.isInitialized('failing-plugin')).toBe(false);
    });

    test('should handle missing DOM elements gracefully', async () => {
      // Clear DOM to simulate missing elements
      document.body.innerHTML = '';

      PluginRegistry.register(new WordCountPlugin());
      
      // Should not throw error even with missing DOM
      await expect(
        PluginRegistry.initialize('word-count', { compact: true })
      ).resolves.not.toThrow();
    });
  });

  describe('Settings Validation', () => {
    test('should persist settings across browser sessions', () => {
      // Save settings
      PluginSettings.save('word-count', true, {
        compact: false,
        showReadingTime: true,
        readingSpeed: 250
      });

      // Simulate browser restart
      const exported = PluginSettings.export();
      PluginSettings.clear();

      // Import settings
      const imported = PluginSettings.import(exported);
      expect(imported).toBe(true);

      // Verify settings are restored
      expect(PluginSettings.isEnabled('word-count')).toBe(true);
      
      const wordCountConfig = PluginSettings.getConfig('word-count');
      expect(wordCountConfig.compact).toBe(false);
      expect(wordCountConfig.readingSpeed).toBe(250);
    });

    test('should handle corrupted settings gracefully', () => {
      // Try to import invalid JSON
      const invalidJson = '{ invalid json }';
      const result = PluginSettings.import(invalidJson);
      expect(result).toBe(false);

      // Settings should remain empty
      expect(PluginSettings.loadAll()).toEqual({});

      // Should still be able to save new settings
      PluginSettings.save('word-count', true, { compact: true });
      expect(PluginSettings.isEnabled('word-count')).toBe(true);
    });
  });
});
