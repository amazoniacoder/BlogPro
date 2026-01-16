/**
 * Documentation Manager Plugin Entry Point
 * Main plugin class implementing TextEditorPlugin interface
 * Registers footer button and manages plugin lifecycle
 */

import React from 'react';
import { 
  TextEditorPlugin, 
  PluginContext, 
  FooterButtonConfig,
  WindowConfig 
} from './types/TextEditorPlugin';
import { AdminManagerPage } from './components/pages/AdminManagerPage';

// Export production components only
export type { LibraryContext, LibraryType } from './types/LibraryContext';
export { LIBRARY_CONFIGS, getLibraryConfig } from './types/LibraryContext';
export { useLibraryContext } from './hooks/useLibraryContext';
export type { Section, Content } from './hooks/useLibraryContent';
export { useLibraryContent } from './hooks/useLibraryContent';
export { useTextEditorIntegration } from './hooks/useTextEditorIntegration';
export { useAdminPanel } from './hooks/useAdminPanel';
export { useSecurity } from './hooks/useSecurity';
export { useOptimizedDocumentation } from './hooks/useOptimizedDocumentation';
export { useOptimizedLibraryContent } from './hooks/useOptimizedLibraryContent';
export { LibrarySwitcher } from './components/LibrarySwitcher';
export { DocumentationManager } from './components/UpdatedDocumentationManager';
export { IntegratedTextEditor } from './components/IntegratedTextEditor';
export { ContentEditorModal } from './components/ContentEditorModal';
export { UnifiedAdminPanel } from './components/UnifiedAdminPanel';
export { EnhancedContextMenu } from './components/EnhancedContextMenu';
export { SecurityDashboard } from './components/SecurityDashboard';
export { PerformanceMonitor } from './components/PerformanceMonitor';
export { TextEditorDocsRoute, WebsiteDocsRoute, documentationRoutes } from './routes/PublicRoutes';
export { TextEditorDocsRoute as DeploymentTextEditorRoute, WebsiteDocsRoute as DeploymentWebsiteRoute, documentationRoutes as deploymentRoutes, deploymentConfig, getCurrentConfig } from './deployment/routeConfiguration';
export * from './utils/permissions';

export default class DocumentationManagerPlugin implements TextEditorPlugin {
  readonly name = 'documentation-manager';
  readonly version = '1.0.0';
  readonly description = 'Professional documentation management system for text editor docs directory';
  readonly author = 'BlogPro Team';

  private context?: PluginContext;
  private isActive = false;

  /**
   * Plugin activation - register UI elements and initialize services
   */
  async activate(context: PluginContext): Promise<void> {
    this.context = context;
    this.isActive = true;

    try {
      // Verify required permissions
      this.verifyPermissions();

      // Register footer button for documentation access
      this.registerFooterButton();

      // Register keyboard shortcut
      this.registerKeyboardShortcut();

      console.log(`[${this.name}] Plugin activated successfully`);
    } catch (error) {
      console.error(`[${this.name}] Failed to activate plugin:`, error);
      throw error;
    }
  }

  /**
   * Plugin deactivation - cleanup resources
   */
  async deactivate(): Promise<void> {
    this.isActive = false;
    this.context = undefined;
    console.log(`[${this.name}] Plugin deactivated`);
  }

  /**
   * Open documentation manager interface in new window
   */
  private async openDocumentationInterface(): Promise<void> {
    if (!this.context || !this.isActive) {
      console.warn(`[${this.name}] Plugin not active, cannot open interface`);
      return;
    }

    try {
      // Create wrapper component that provides context
      const WrappedComponent: React.ComponentType = () => {
        return React.createElement(AdminManagerPage);
      };

      const windowConfig: WindowConfig = {
        title: 'Documentation Manager - BlogPro Text Editor',
        width: 1200,
        height: 800,
        resizable: true,
        component: WrappedComponent
      };

      await this.context.openWindow(windowConfig);
      console.log(`[${this.name}] Documentation interface opened`);
    } catch (error) {
      console.error(`[${this.name}] Failed to open interface:`, error);
    }
  }

  /**
   * Register footer button for plugin access
   */
  private registerFooterButton(): void {
    if (!this.context) return;

    const buttonConfig: FooterButtonConfig = {
      id: 'documentation-manager-btn',
      label: 'Documentation',
      icon: '📚',
      tooltip: 'Open Documentation Manager (Ctrl+Shift+D)',
      onClick: () => this.openDocumentationInterface()
    };

    this.context.registerFooterButton(buttonConfig);
  }

  /**
   * Register keyboard shortcut for quick access
   */
  private registerKeyboardShortcut(): void {
    if (!this.context) return;

    this.context.registerShortcut('Ctrl+Shift+D', () => {
      this.openDocumentationInterface();
    });
  }

  /**
   * Verify plugin has required permissions
   */
  private verifyPermissions(): void {
    if (!this.context) {
      throw new Error('Plugin context not available');
    }

    const requiredPermissions = [
      'file-system-read',
      'file-system-write',
      'footer-menu',
      'keyboard-shortcuts',
      'new-window'
    ];

    // Note: In real implementation, would check context.user.hasPermission()
    // For now, we assume permissions are granted via plugin.json
    console.log(`[${this.name}] Required permissions: ${requiredPermissions.join(', ')}`);
  }

  /**
   * Get plugin status information
   */
  getStatus(): { active: boolean; version: string; context: boolean } {
    return {
      active: this.isActive,
      version: this.version,
      context: !!this.context
    };
  }
}
