/**
 * Text Editor Plugin - Main Export
 * 
 * Production-ready text editor with plugin system.
 */

// Main editor component
export { ContentEditableEditor } from './core/components/ContentEditableEditor';
export type { EditorProps } from './core/components/ContentEditableEditor';

// Plugin system
export { PluginRegistry } from './plugins/core/PluginRegistry';
export { ComponentPlugin } from './plugins/core/ComponentPlugin';
export type { 
  IEditorPlugin, 
  PluginConfig, 
  PluginMetadata, 
  EditorInstance 
} from './plugins/core/PluginInterface';

// Built-in plugins
export {
  WordCountPlugin,
  SpellCheckPlugin,
  AutoSavePlugin,
  PerformancePlugin
} from './plugins/builtin';

export type {
  WordCountPluginConfig,
  SpellCheckPluginConfig,
  AutoSavePluginConfig,
  PerformancePluginConfig
} from './plugins/builtin';

// Plugin management
export { PluginSettings } from './shared/utils/PluginSettings';
export { PluginControlPanel } from './core/components/admin/PluginControlPanel';

// Core types
export type { FormatState } from './core/types/CoreTypes';

// Version
export const VERSION = '2.2.0';
