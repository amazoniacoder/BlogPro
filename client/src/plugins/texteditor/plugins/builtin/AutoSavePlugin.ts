/**
 * AutoSave Plugin
 * 
 * Converts existing AutoSaveManager component into a plugin.
 * Provides automatic content saving functionality.
 */

import { ComponentPlugin, ComponentPluginConfig } from '../core/ComponentPlugin';
import { AutoSaveManager } from '../../core/components/autosave/AutoSaveManager';

export interface AutoSavePluginConfig extends ComponentPluginConfig {
  readonly interval?: number;
  readonly onSave?: (content: string) => Promise<void>;
  readonly enabled?: boolean;
}

export class AutoSavePlugin extends ComponentPlugin {
  readonly name = 'auto-save';
  readonly version = '1.0.0';
  readonly description = 'Автоматическое сохранение контента с настраиваемыми интервалами';

  protected config: AutoSavePluginConfig = {
    interval: 300000, // 5 minutes default
    enabled: true,
    mountPoint: '.editor-header-right'
  };

  protected async onInitialize(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    this.mountPoint = this.config.mountPoint || '.editor-header-right';

    await this.renderComponent(AutoSaveManager, {
      content: this.getEditor().getContent(),
      onSave: this.config.onSave,
      interval: this.config.interval,
      className: 'editor-autosave plugin-auto-save'
    });
  }

  onContentChange(content: string): void {
    if (this.isRendered() && this.config.enabled) {
      this.updateComponent(AutoSaveManager, {
        content,
        onSave: this.config.onSave,
        interval: this.config.interval,
        className: 'editor-autosave plugin-auto-save'
      });
    }
  }

  /**
   * Trigger manual save
   */
  async manualSave(): Promise<void> {
    if (this.config.onSave) {
      try {
        const content = this.getEditor().getContent();
        await this.config.onSave(content);
      } catch (error) {
        console.error('Manual save failed:', error);
        throw error;
      }
    }
  }

  /**
   * Update save interval
   */
  updateInterval(interval: number): void {
    this.config = { ...this.config, interval };
    
    if (this.isRendered()) {
      this.updateComponent(AutoSaveManager, {
        content: this.getEditor().getContent(),
        onSave: this.config.onSave,
        interval: this.config.interval,
        className: 'editor-autosave plugin-auto-save'
      });
    }
  }

  /**
   * Enable auto-save
   */
  enable(): void {
    this.config = { ...this.config, enabled: true };
    
    if (!this.isRendered()) {
      this.onInitialize();
    }
  }

  /**
   * Disable auto-save
   */
  disable(): void {
    this.config = { ...this.config, enabled: false };
    
    if (this.isRendered()) {
      this.onDestroy();
    }
  }

  /**
   * Update plugin configuration
   */
  updateConfig(newConfig: Partial<AutoSavePluginConfig>): void {
    const wasEnabled = this.config.enabled;
    this.config = { ...this.config, ...newConfig };
    
    // Handle enable/disable state changes
    if (newConfig.enabled !== undefined && newConfig.enabled !== wasEnabled) {
      if (newConfig.enabled) {
        this.enable();
      } else {
        this.disable();
      }
      return;
    }
    
    // Update existing component if rendered
    if (this.isRendered() && this.config.enabled) {
      this.updateComponent(AutoSaveManager, {
        content: this.getEditor().getContent(),
        onSave: this.config.onSave,
        interval: this.config.interval,
        className: 'editor-autosave plugin-auto-save'
      });
    }
  }

  /**
   * Get current auto-save status
   */
  isEnabled(): boolean {
    return this.config.enabled ?? true;
  }

  /**
   * Get current save interval
   */
  getInterval(): number {
    return this.config.interval ?? 300000;
  }
}
