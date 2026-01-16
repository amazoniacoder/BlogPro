/**
 * Plugin Registry - Manages plugin lifecycle
 */

import { IEditorPlugin, EditorInstance, PluginConfig, PluginMetadata } from './PluginInterface';
import { PluginSandbox, PluginPermissions, ResourceLimits } from '../security/PluginSandbox';
import { ErrorIsolationManager } from '../../core/errors/ErrorIsolationManager';

export class PluginRegistry {
  private static plugins = new Map<string, IEditorPlugin>();
  private static initialized = new Set<string>();
  private static editorInstance?: EditorInstance;
  private static errorManager = new ErrorIsolationManager();
  private static pluginSandboxes = new Map<string, PluginSandbox>();

  static setEditorInstance(editor: EditorInstance): void {
    this.editorInstance = editor;
  }

  static register(plugin: IEditorPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }
    
    this.plugins.set(plugin.name, plugin);
  }

  static isRegistered(name: string): boolean {
    return this.plugins.has(name);
  }

  static unregister(name: string): void {
    if (this.initialized.has(name)) {
      this.destroy(name);
    }
    this.plugins.delete(name);
  }

  static async initialize(name: string, config?: PluginConfig): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }

    if (this.initialized.has(name)) {
      return;
    }

    // Check if plugin is disabled due to errors
    if (this.errorManager.isPluginDisabled(name)) {
      console.warn(`Plugin '${name}' is disabled due to errors`);
      return;
    }

    if (!this.editorInstance) {
      throw new Error('Editor instance not set');
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.initialized.has(dep)) {
          throw new Error(`Plugin ${name} requires ${dep} to be initialized first`);
        }
      }
    }

    try {
      // For built-in plugins, use direct editor instance (no sandbox)
      const builtinPlugins = ['word-count', 'spell-check', 'auto-save', 'performance-monitor', 'documentation-manager', 'analytics', 'security'];
      
      if (builtinPlugins.includes(name)) {
        // Direct access for built-in plugins
        await plugin.initialize(this.editorInstance, config);
      } else {
        // Create sandbox for third-party plugins
        const sandbox = this.createPluginSandbox(name);
        const secureContext = sandbox.createSecureContext(this.editorInstance);
        await plugin.initialize(secureContext as unknown as EditorInstance, config);
      }
      this.initialized.add(name);
      
      console.log(`Plugin '${name}' initialized successfully with sandbox`);
      
    } catch (error) {
      // Handle plugin initialization error
      const action = await this.errorManager.handlePluginError(name, error as Error, {
        phase: 'initialization',
        config
      });
      
      if (action.action === 'disable') {
        console.error(`Plugin '${name}' disabled: ${action.reason}`);
      } else if (action.action === 'retry' && action.delay) {
        console.warn(`Plugin '${name}' will retry in ${action.delay}ms`);
        setTimeout(() => this.initialize(name, config), action.delay);
      }
      
      throw error;
    }
    
    // Notify components of plugin state change
    this.notifyPluginStateChange();
  }

  static async destroy(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) return;

    if (this.initialized.has(name)) {
      await plugin.destroy();
      this.initialized.delete(name);
      
      // Notify components of plugin state change
      this.notifyPluginStateChange();
    }
  }

  static getPlugin(name: string): IEditorPlugin | undefined {
    return this.plugins.get(name);
  }

  static isInitialized(name: string): boolean {
    return this.initialized.has(name);
  }

  static getRegisteredPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map(plugin => ({
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      dependencies: plugin.dependencies
    }));
  }

  static getInitializedPlugins(): string[] {
    return Array.from(this.initialized);
  }

  static async initializeAll(configs?: Record<string, PluginConfig>): Promise<void> {
    const plugins = Array.from(this.plugins.values());
    
    // Sort by dependencies (simple topological sort)
    const sorted = this.topologicalSort(plugins);
    
    for (const plugin of sorted) {
      if (!this.initialized.has(plugin.name)) {
        const config = configs?.[plugin.name];
        await this.initialize(plugin.name, config);
      }
    }
  }

  static async destroyAll(): Promise<void> {
    const initialized = Array.from(this.initialized);
    
    // Destroy in reverse order
    for (const name of initialized.reverse()) {
      await this.destroy(name);
    }
  }

  private static topologicalSort(plugins: IEditorPlugin[]): IEditorPlugin[] {
    const visited = new Set<string>();
    const result: IEditorPlugin[] = [];
    
    const visit = (plugin: IEditorPlugin) => {
      if (visited.has(plugin.name)) return;
      
      visited.add(plugin.name);
      
      // Visit dependencies first
      if (plugin.dependencies) {
        for (const depName of plugin.dependencies) {
          const dep = plugins.find(p => p.name === depName);
          if (dep) visit(dep);
        }
      }
      
      result.push(plugin);
    };
    
    for (const plugin of plugins) {
      visit(plugin);
    }
    
    return result;
  }
  
  /**
   * Create sandbox for plugin with appropriate permissions
   */
  private static createPluginSandbox(pluginName: string): PluginSandbox {
    // Define permissions based on plugin type
    const permissions: PluginPermissions = this.getPluginPermissions(pluginName);
    const resourceLimits: ResourceLimits = {
      memoryLimit: '10MB',
      cpuTime: '100ms',
      networkRequests: 10
    };

    const sandbox = new PluginSandbox(permissions, resourceLimits);
    this.pluginSandboxes.set(pluginName, sandbox);
    
    return sandbox;
  }

  /**
   * Get permissions for specific plugin
   */
  private static getPluginPermissions(pluginName: string): PluginPermissions {
    // Built-in plugins get more permissions
    const builtinPlugins = ['word-count', 'spell-check', 'auto-save', 'performance-monitor', 'analytics'];
    
    if (builtinPlugins.includes(pluginName)) {
      return {
        dom: true,
        network: true,
        storage: true,
        editor: ['read', 'write']
      };
    }

    // Third-party plugins get restricted permissions
    return {
      dom: false,
      network: false,
      storage: true,
      editor: ['read']
    };
  }

  /**
   * Get error manager instance
   */
  static getErrorManager(): ErrorIsolationManager {
    return this.errorManager;
  }

  /**
   * Get plugin sandbox
   */
  static getPluginSandbox(pluginName: string): PluginSandbox | undefined {
    return this.pluginSandboxes.get(pluginName);
  }

  private static notifyPluginStateChange(): void {
    try {
      const event = new CustomEvent('plugin-state-changed');
      window.dispatchEvent(event);
    } catch (error) {
      // Ignore errors in event dispatch
    }
  }
}
