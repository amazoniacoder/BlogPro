/**
 * DOM Adapter Factory
 * 
 * Factory for creating appropriate DOM adapter instances.
 */

import { DOMAdapter } from './DOMAdapter';
import { BrowserDOMAdapter } from './BrowserDOMAdapter';
import { MockDOMAdapter } from './MockDOMAdapter';

export class DOMAdapterFactory {
  private static instance: DOMAdapter | null = null;
  private static testMode = false;

  /**
   * Get DOM adapter instance
   */
  static getInstance(): DOMAdapter {
    if (!this.instance) {
      this.instance = this.testMode 
        ? new MockDOMAdapter()
        : new BrowserDOMAdapter();
    }
    return this.instance;
  }

  /**
   * Set test mode (uses MockDOMAdapter)
   */
  static setTestMode(enabled: boolean): void {
    this.testMode = enabled;
    this.instance = null; // Force recreation
  }

  /**
   * Set custom adapter instance
   */
  static setInstance(adapter: DOMAdapter): void {
    this.instance = adapter;
  }

  /**
   * Reset factory (for testing)
   */
  static reset(): void {
    this.instance = null;
    this.testMode = false;
  }
}
