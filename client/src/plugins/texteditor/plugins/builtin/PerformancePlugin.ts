/**
 * Performance Monitor Plugin
 * 
 * Converts existing AdminAnalyticsMenu component into a plugin.
 * Provides performance monitoring and analytics (Admin only).
 */

import { ComponentPlugin, ComponentPluginConfig } from '../core/ComponentPlugin';
import { AdminAnalyticsMenu } from '../../core/components/analytics/AdminAnalyticsMenu';

export interface PerformancePluginConfig extends ComponentPluginConfig {
  readonly userRole?: string;
  readonly showButton?: boolean;
  readonly autoOpen?: boolean;
}

export class PerformancePlugin extends ComponentPlugin {
  readonly name = 'performance-monitor';
  readonly version = '1.0.0';
  readonly description = 'Мониторинг производительности и панель аналитики (только для администратора)';

  protected config: PerformancePluginConfig = {
    userRole: 'user',
    showButton: true,
    autoOpen: false,
    mountPoint: '.editor-footer'
  };

  protected async onInitialize(): Promise<void> {
    // Only initialize for admin users
    if (this.config.userRole !== 'admin') {

      return;
    }

    this.mountPoint = this.config.mountPoint || '.editor-footer';

    await this.renderComponent(AdminAnalyticsMenu, {
      className: 'editor-analytics-menu plugin-performance',
      userRole: this.config.userRole,
      onOpenDashboard: this.handleDashboardOpen.bind(this)
    });
  }

  /**
   * Handle dashboard open event
   */
  private handleDashboardOpen(): void {
    // Plugin-specific dashboard open logic can be added here

  }

  /**
   * Check if user has admin access
   */
  private hasAdminAccess(): boolean {
    return this.config.userRole === 'admin';
  }

  /**
   * Update user role and re-initialize if needed
   */
  updateUserRole(userRole: string): void {
    const wasAdmin = this.hasAdminAccess();
    this.config = { ...this.config, userRole };
    const isAdmin = this.hasAdminAccess();

    // Handle role change
    if (wasAdmin && !isAdmin) {
      // Lost admin access - destroy plugin
      this.onDestroy();
    } else if (!wasAdmin && isAdmin) {
      // Gained admin access - initialize plugin
      this.onInitialize();
    } else if (isAdmin && this.isRendered()) {
      // Still admin - update component
      this.updateComponent(AdminAnalyticsMenu, {
        className: 'editor-analytics-menu plugin-performance',
        userRole: this.config.userRole,
        onOpenDashboard: this.handleDashboardOpen.bind(this)
      });
    }
  }

  /**
   * Update plugin configuration
   */
  updateConfig(newConfig: Partial<PerformancePluginConfig>): void {
    const oldUserRole = this.config.userRole;
    this.config = { ...this.config, ...newConfig };

    // Handle user role changes
    if (newConfig.userRole && newConfig.userRole !== oldUserRole) {
      this.updateUserRole(newConfig.userRole);
      return;
    }

    // Update existing component if rendered and user is admin
    if (this.isRendered() && this.hasAdminAccess()) {
      this.updateComponent(AdminAnalyticsMenu, {
        className: 'editor-analytics-menu plugin-performance',
        userRole: this.config.userRole,
        onOpenDashboard: this.handleDashboardOpen.bind(this)
      });
    }
  }

  /**
   * Check if plugin is available for current user
   */
  isAvailable(): boolean {
    return this.hasAdminAccess();
  }

  /**
   * Get current user role
   */
  getUserRole(): string {
    return this.config.userRole || 'user';
  }

  /**
   * Force refresh performance data
   */
  refreshPerformanceData(): void {
    if (this.isRendered() && this.hasAdminAccess()) {
      // Trigger component refresh by updating with same props
      this.updateComponent(AdminAnalyticsMenu, {
        className: 'editor-analytics-menu plugin-performance',
        userRole: this.config.userRole,
        onOpenDashboard: this.handleDashboardOpen.bind(this)
      });
    }
  }
}
