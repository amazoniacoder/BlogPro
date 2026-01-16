/**
 * Error Isolation Manager
 * 
 * Prevents plugin errors from cascading and crashing the entire editor.
 */

import { AnalyticsStorage } from '../analytics/AnalyticsStorage';

export interface ErrorAction {
  action: 'retry' | 'disable' | 'ignore';
  delay?: number;
  reason?: string;
}

export interface ErrorReport {
  pluginName: string;
  error: Error;
  timestamp: number;
  context?: Record<string, any>;
}

export class ErrorIsolationManager {
  private errorCounts = new Map<string, number>();
  private disabledPlugins = new Set<string>();
  private errorHistory: ErrorReport[] = [];
  private analytics = AnalyticsStorage.getInstance();
  
  private readonly MAX_ERRORS = 3;
  private readonly ERROR_WINDOW = 60000; // 1 minute
  private readonly MAX_HISTORY = 100;

  /**
   * Handle plugin error and determine action
   */
  async handlePluginError(pluginName: string, error: Error, context?: Record<string, any>): Promise<ErrorAction> {
    const errorReport: ErrorReport = {
      pluginName,
      error,
      timestamp: Date.now(),
      context
    };

    // Add to error history
    this.addToHistory(errorReport);

    // Record analytics event
    await this.analytics.recordEvent('error', {
      component: pluginName,
      errorMessage: error.message,
      errorStack: error.stack,
      context: context || {}
    });

    // Check if plugin is already disabled
    if (this.disabledPlugins.has(pluginName)) {
      return { action: 'ignore', reason: 'Plugin already disabled' };
    }

    // Count errors in time window
    const recentErrors = this.getRecentErrors(pluginName);
    const errorCount = recentErrors.length;

    console.warn(`Plugin '${pluginName}' error (${errorCount}/${this.MAX_ERRORS}):`, error.message);

    // Determine action based on error count
    if (errorCount >= this.MAX_ERRORS) {
      this.disabledPlugins.add(pluginName);
      console.error(`Plugin '${pluginName}' disabled due to repeated errors`);
      
      return { 
        action: 'disable', 
        reason: `Too many errors (${errorCount}/${this.MAX_ERRORS})` 
      };
    }

    // Progressive retry delays
    const delay = Math.min(1000 * Math.pow(2, errorCount - 1), 10000); // Max 10s
    
    return { 
      action: 'retry', 
      delay,
      reason: `Retry attempt ${errorCount}/${this.MAX_ERRORS}` 
    };
  }

  /**
   * Check if plugin is disabled
   */
  isPluginDisabled(pluginName: string): boolean {
    return this.disabledPlugins.has(pluginName);
  }

  /**
   * Re-enable a disabled plugin
   */
  enablePlugin(pluginName: string): void {
    this.disabledPlugins.delete(pluginName);
    this.errorCounts.delete(pluginName);
    console.log(`Plugin '${pluginName}' re-enabled`);
  }

  /**
   * Get recent errors for a plugin
   */
  private getRecentErrors(pluginName: string): ErrorReport[] {
    const cutoff = Date.now() - this.ERROR_WINDOW;
    return this.errorHistory.filter(
      report => report.pluginName === pluginName && report.timestamp > cutoff
    );
  }

  /**
   * Add error to history with size limit
   */
  private addToHistory(errorReport: ErrorReport): void {
    this.errorHistory.push(errorReport);
    
    // Maintain history size limit
    if (this.errorHistory.length > this.MAX_HISTORY) {
      this.errorHistory.shift();
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    disabledPlugins: string[];
    errorsByPlugin: Record<string, number>;
    recentErrors: ErrorReport[];
  } {
    const errorsByPlugin: Record<string, number> = {};
    const cutoff = Date.now() - this.ERROR_WINDOW;
    const recentErrors = this.errorHistory.filter(report => report.timestamp > cutoff);

    // Count errors by plugin
    for (const report of recentErrors) {
      errorsByPlugin[report.pluginName] = (errorsByPlugin[report.pluginName] || 0) + 1;
    }

    return {
      totalErrors: this.errorHistory.length,
      disabledPlugins: Array.from(this.disabledPlugins),
      errorsByPlugin,
      recentErrors
    };
  }

  /**
   * Clear error history and re-enable all plugins
   */
  reset(): void {
    this.errorCounts.clear();
    this.disabledPlugins.clear();
    this.errorHistory = [];
    console.log('Error isolation manager reset - all plugins re-enabled');
  }

  /**
   * Get disabled plugins list
   */
  getDisabledPlugins(): string[] {
    return Array.from(this.disabledPlugins);
  }
}
