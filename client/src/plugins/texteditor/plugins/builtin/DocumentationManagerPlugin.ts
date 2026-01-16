/**
 * Documentation Manager Plugin
 * Provides access to documentation management interface
 * Max 400 lines, strict TypeScript compliance
 */

import { BasePlugin, PluginConfig } from '../core/PluginInterface';

export interface DocumentationManagerConfig extends PluginConfig {
  readonly mountPoint?: string;
  readonly userRole?: string;
  readonly enabled?: boolean;
}

export class DocumentationManagerPlugin extends BasePlugin {
  readonly name = 'documentation-manager';
  readonly version = '1.0.0';
  readonly description = 'Professional documentation management system for text editor docs directory';

  private buttonElement?: HTMLButtonElement;
  private isEnabled = true;

  protected async onInitialize(): Promise<void> {
    const config = this.config as DocumentationManagerConfig;
    
    // Check if user has permission to use documentation manager
    if (config?.userRole !== 'admin') {
      this.isEnabled = false;
      return;
    }

    this.isEnabled = config?.enabled !== false;
    
    if (this.isEnabled) {
      this.createFooterButton();
      this.registerKeyboardShortcut();
    }
  }

  protected async onDestroy(): Promise<void> {
    this.removeFooterButton();
    this.removeKeyboardShortcut();
  }

  /**
   * Create documentation manager button in editor footer
   */
  private createFooterButton(): void {
    const config = this.config as DocumentationManagerConfig;
    const mountPoint = config?.mountPoint || '.editor-footer-controls';
    const container = document.querySelector(mountPoint);
    
    if (!container) {
      console.warn(`[DocumentationManager] Mount point ${mountPoint} not found`);
      return;
    }

    // Create button element
    this.buttonElement = document.createElement('button');
    this.buttonElement.className = 'documentation-manager-button plugin-button';
    this.buttonElement.title = 'Менеджер документации (Ctrl+Shift+D)';
    this.buttonElement.innerHTML = 'Документация';
    
    // Add click handler
    this.buttonElement.addEventListener('click', this.handleButtonClick.bind(this));
    
    // Insert button into footer
    container.appendChild(this.buttonElement);
  }

  /**
   * Remove documentation manager button from footer
   */
  private removeFooterButton(): void {
    if (this.buttonElement && this.buttonElement.parentNode) {
      this.buttonElement.removeEventListener('click', this.handleButtonClick.bind(this));
      this.buttonElement.parentNode.removeChild(this.buttonElement);
      this.buttonElement = undefined;
    }
  }

  /**
   * Register keyboard shortcut for documentation manager
   */
  private registerKeyboardShortcut(): void {
    document.addEventListener('keydown', this.handleKeyboardShortcut.bind(this));
  }

  /**
   * Remove keyboard shortcut listener
   */
  private removeKeyboardShortcut(): void {
    document.removeEventListener('keydown', this.handleKeyboardShortcut.bind(this));
  }

  /**
   * Handle button click to open documentation manager
   */
  private handleButtonClick(): void {
    this.openDocumentationManager();
  }

  /**
   * Handle keyboard shortcut (Ctrl+Shift+D)
   */
  private handleKeyboardShortcut(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      this.openDocumentationManager();
    }
  }

  /**
   * Open documentation manager interface in new tab
   */
  private openDocumentationManager(): void {
    if (!this.isEnabled) {
      console.warn('[DocumentationManager] Plugin is disabled');
      return;
    }

    try {
      // Open React documentation manager plugin
      const documentationUrl = '/plugins/texteditor/documentation-manager';
      
      const newTab = window.open(documentationUrl, '_blank');
      
      if (newTab) {
        newTab.focus();
        console.log('[DocumentationManager] React plugin interface opened successfully');
      } else {
        console.error('[DocumentationManager] Failed to open tab - popup blocked?');
        this.showPopupBlockedMessage();
      }
    } catch (error) {
      console.error('[DocumentationManager] Failed to open interface:', error);
      this.showErrorMessage('Failed to open Documentation Manager');
    }
  }

  /**
   * Show popup blocked message
   */
  private showPopupBlockedMessage(): void {
    const message = 'Documentation Manager tab was blocked. Please allow popups for this site.';
    this.showNotification(message, 'warning');
  }

  /**
   * Show error message
   */
  private showErrorMessage(message: string): void {
    this.showNotification(message, 'error');
  }

  /**
   * Show notification to user
   */
  private showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `documentation-manager-notification notification-${type}`;
    notification.textContent = message;
    
    // Style notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      backgroundColor: type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3',
      color: 'white',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: '10000',
      fontSize: '14px',
      maxWidth: '300px'
    });
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Get plugin status
   */
  getStatus(): { enabled: boolean; hasButton: boolean; userRole: string } {
    const config = this.config as DocumentationManagerConfig;
    return {
      enabled: this.isEnabled,
      hasButton: !!this.buttonElement,
      userRole: config?.userRole || 'user'
    };
  }

  /**
   * Enable plugin
   */
  async enable(): Promise<void> {
    if (!this.isEnabled) {
      this.isEnabled = true;
      this.createFooterButton();
      this.registerKeyboardShortcut();
    }
  }

  /**
   * Disable plugin
   */
  async disable(): Promise<void> {
    if (this.isEnabled) {
      this.isEnabled = false;
      this.removeFooterButton();
      this.removeKeyboardShortcut();
    }
  }
}
