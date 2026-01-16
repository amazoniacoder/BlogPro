/**
 * Plugin Manager - Integrates plugin system with editor
 */

import { PluginRegistry } from '../../plugins/core/PluginRegistry';
import { EditorInstance, PluginConfig } from '../../plugins/core/PluginInterface';

export class PluginManager {
  private editorInstance?: EditorInstance;
  private contentChangeHandlers = new Set<Function>();
  private selectionChangeHandlers = new Set<Function>();

  constructor(editorRef: React.RefObject<HTMLDivElement>) {
    this.createEditorInstance(editorRef);
  }

  private createEditorInstance(editorRef: React.RefObject<HTMLDivElement>): void {
    this.editorInstance = {
      getContent: () => editorRef.current?.innerHTML || '',
      
      setContent: (content: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
        }
      },
      
      insertText: (text: string) => {
        document.execCommand('insertText', false, text);
      },
      
      getSelection: () => window.getSelection(),
      
      focus: () => {
        editorRef.current?.focus();
      },
      
      addEventListener: (event: string, handler: Function) => {
        if (event === 'contentchange') {
          this.contentChangeHandlers.add(handler);
        } else if (event === 'selectionchange') {
          this.selectionChangeHandlers.add(handler);
        }
      },
      
      removeEventListener: (event: string, handler: Function) => {
        if (event === 'contentchange') {
          this.contentChangeHandlers.delete(handler);
        } else if (event === 'selectionchange') {
          this.selectionChangeHandlers.delete(handler);
        }
      }
    };

    PluginRegistry.setEditorInstance(this.editorInstance);
  }

  async loadPlugin(pluginName: string, config?: PluginConfig): Promise<void> {
    await PluginRegistry.initialize(pluginName, config);
  }

  async unloadPlugin(pluginName: string): Promise<void> {
    await PluginRegistry.destroy(pluginName);
  }

  onContentChange(content: string): void {
    // Notify plugins
    const plugins = PluginRegistry.getInitializedPlugins();
    for (const pluginName of plugins) {
      const plugin = PluginRegistry.getPlugin(pluginName);
      plugin?.onContentChange?.(content);
    }
    
    // Notify custom handlers
    this.contentChangeHandlers.forEach(handler => handler(content));
  }

  onSelectionChange(selection: Selection | null): void {
    // Notify plugins
    const plugins = PluginRegistry.getInitializedPlugins();
    for (const pluginName of plugins) {
      const plugin = PluginRegistry.getPlugin(pluginName);
      plugin?.onSelectionChange?.(selection);
    }
    
    // Notify custom handlers
    this.selectionChangeHandlers.forEach(handler => handler(selection));
  }

  onFocus(): void {
    const plugins = PluginRegistry.getInitializedPlugins();
    for (const pluginName of plugins) {
      const plugin = PluginRegistry.getPlugin(pluginName);
      plugin?.onFocus?.();
    }
  }

  onBlur(): void {
    const plugins = PluginRegistry.getInitializedPlugins();
    for (const pluginName of plugins) {
      const plugin = PluginRegistry.getPlugin(pluginName);
      plugin?.onBlur?.();
    }
  }

  async destroy(): Promise<void> {
    await PluginRegistry.destroyAll();
    this.contentChangeHandlers.clear();
    this.selectionChangeHandlers.clear();
  }
}
