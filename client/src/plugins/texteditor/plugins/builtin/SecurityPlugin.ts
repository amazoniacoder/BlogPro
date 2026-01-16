/**
 * Security Plugin
 * 
 * Provides security dashboard access for admin users.
 */

import { IEditorPlugin, PluginConfig, EditorInstance } from '../core/PluginInterface';

export class SecurityPlugin implements IEditorPlugin {
  name = 'security';
  version = '1.0.0';
  description = 'Plugin security monitoring and error isolation dashboard';
  
  private config: PluginConfig = {};
  private dashboardWindow: Window | null = null;

  async initialize(_editor: EditorInstance, config?: PluginConfig): Promise<void> {
    this.config = config || {};

    // Only show for admin users
    if (this.config.userRole !== 'admin') {
      return;
    }

    this.createSecurityButton();
  }

  private createSecurityButton(): void {
    const mountPoint = document.querySelector(this.config.mountPoint || '.editor-footer-controls');
    if (!mountPoint) return;

    const button = document.createElement('button');
    button.className = 'security-button plugin-button';
    button.innerHTML = '🔒 Security';
    button.title = 'Open Security Dashboard (Admin)';
    button.onclick = () => {
      // Trigger modal instead of new window
      const event = new CustomEvent('openPluginModal', { detail: { plugin: 'security' } });
      document.dispatchEvent(event);
    };

    mountPoint.appendChild(button);
  }



  async destroy(): Promise<void> {
    // Close dashboard window if open
    if (this.dashboardWindow && !this.dashboardWindow.closed) {
      this.dashboardWindow.close();
    }

    // Remove button
    const button = document.querySelector('.security-button');
    if (button) {
      button.remove();
    }
  }

  getConfig(): PluginConfig {
    return this.config;
  }

  updateConfig(config: Partial<PluginConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
