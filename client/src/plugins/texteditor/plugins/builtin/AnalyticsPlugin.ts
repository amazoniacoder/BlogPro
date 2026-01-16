/**
 * Analytics Plugin
 * 
 * Provides analytics dashboard access for admin users.
 */

import { IEditorPlugin, PluginConfig, EditorInstance } from '../core/PluginInterface';

export class AnalyticsPlugin implements IEditorPlugin {
  name = 'analytics';
  version = '1.0.0';
  description = 'Analytics dashboard for text editor performance monitoring';
  
  private config: PluginConfig = {};

  async initialize(_editor: EditorInstance, config?: PluginConfig): Promise<void> {
    this.config = config || {};

    // Analytics now handled by AdminAnalyticsMenu component in modal system
    return;
  }



  async destroy(): Promise<void> {
    // Analytics now handled by AdminAnalyticsMenu component
    return;
  }

  getConfig(): PluginConfig {
    return this.config;
  }

  updateConfig(config: Partial<PluginConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
