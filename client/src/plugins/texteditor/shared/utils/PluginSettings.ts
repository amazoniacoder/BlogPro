/**
 * Plugin Settings Storage
 * 
 * Manages persistent storage of plugin configurations and user preferences.
 * Uses localStorage with fallback handling and type safety.
 */

export interface PluginSettingsData {
  readonly enabled: boolean;
  readonly config: Record<string, any>;
  readonly lastModified: number;
}

export interface AllPluginSettings {
  [pluginName: string]: PluginSettingsData;
}

export class PluginSettings {
  private static readonly STORAGE_KEY = 'texteditor-plugin-settings';
  private static readonly VERSION_KEY = 'texteditor-plugin-settings-version';
  private static readonly CURRENT_VERSION = '1.0.0';

  /**
   * Save plugin settings
   */
  static save(pluginName: string, enabled: boolean, config: Record<string, any> = {}): void {
    try {
      const allSettings = this.loadAll();
      
      allSettings[pluginName] = {
        enabled,
        config,
        lastModified: Date.now()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSettings));
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
      
    } catch (error) {
      console.warn(`Failed to save settings for plugin ${pluginName}:`, error);
    }
  }

  /**
   * Load plugin settings
   */
  static load(pluginName: string): PluginSettingsData | null {
    try {
      const allSettings = this.loadAll();
      return allSettings[pluginName] || null;
    } catch (error) {
      console.warn(`Failed to load settings for plugin ${pluginName}:`, error);
      return null;
    }
  }

  /**
   * Load all plugin settings
   */
  static loadAll(): AllPluginSettings {
    try {
      this.checkVersion();
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return {};
      }
      
      const parsed = JSON.parse(stored);
      return this.validateSettings(parsed);
      
    } catch (error) {
      console.warn('Failed to load plugin settings, using defaults:', error);
      return {};
    }
  }

  /**
   * Check if plugin is enabled
   */
  static isEnabled(pluginName: string): boolean {
    const settings = this.load(pluginName);
    return settings?.enabled ?? true; // Default to enabled
  }

  /**
   * Get plugin configuration
   */
  static getConfig(pluginName: string): Record<string, any> {
    const settings = this.load(pluginName);
    return settings?.config ?? {};
  }

  /**
   * Toggle plugin enabled state
   */
  static toggle(pluginName: string): boolean {
    const currentSettings = this.load(pluginName);
    const newEnabled = !(currentSettings?.enabled ?? true);
    
    this.save(pluginName, newEnabled, currentSettings?.config ?? {});
    return newEnabled;
  }

  /**
   * Update plugin configuration
   */
  static updateConfig(pluginName: string, config: Record<string, any>): void {
    const currentSettings = this.load(pluginName);
    const enabled = currentSettings?.enabled ?? true;
    
    this.save(pluginName, enabled, { ...currentSettings?.config, ...config });
  }

  /**
   * Remove plugin settings
   */
  static remove(pluginName: string): void {
    try {
      const allSettings = this.loadAll();
      delete allSettings[pluginName];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allSettings));
    } catch (error) {
      console.warn(`Failed to remove settings for plugin ${pluginName}:`, error);
    }
  }

  /**
   * Clear all plugin settings
   */
  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.VERSION_KEY);
    } catch (error) {
      console.warn('Failed to clear plugin settings:', error);
    }
  }

  /**
   * Export settings for backup
   */
  static export(): string {
    const allSettings = this.loadAll();
    return JSON.stringify({
      version: this.CURRENT_VERSION,
      timestamp: Date.now(),
      settings: allSettings
    }, null, 2);
  }

  /**
   * Import settings from backup
   */
  static import(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.version && parsed.settings) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed.settings));
        localStorage.setItem(this.VERSION_KEY, parsed.version);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import plugin settings:', error);
      return false;
    }
  }

  /**
   * Check and migrate settings version if needed
   */
  private static checkVersion(): void {
    const storedVersion = localStorage.getItem(this.VERSION_KEY);
    
    if (!storedVersion || storedVersion !== this.CURRENT_VERSION) {
      // Future: Add migration logic here
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
    }
  }

  /**
   * Validate settings structure
   */
  private static validateSettings(settings: any): AllPluginSettings {
    if (!settings || typeof settings !== 'object') {
      return {};
    }
    
    const validated: AllPluginSettings = {};
    
    for (const [pluginName, data] of Object.entries(settings)) {
      if (this.isValidSettingsData(data)) {
        validated[pluginName] = data as PluginSettingsData;
      }
    }
    
    return validated;
  }

  /**
   * Validate individual plugin settings data
   */
  private static isValidSettingsData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.enabled === 'boolean' &&
      typeof data.config === 'object' &&
      typeof data.lastModified === 'number'
    );
  }
}
