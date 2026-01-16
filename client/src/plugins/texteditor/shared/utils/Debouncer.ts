/**
 * Debouncing utility for performance optimization
 * Provides type-safe debouncing with proper cleanup
 */

import { EDITOR_CONFIG } from '../constants/EditorConfig';

export class Debouncer {
  private static timers = new Map<string, number>();

  /**
   * Debounce function execution with type safety
   */
  static debounce<T extends unknown[]>(
    key: string,
    fn: (...args: T) => void,
    delay: number = EDITOR_CONFIG.PERFORMANCE.DEBOUNCE_DELAY
  ): (...args: T) => void {
    return (...args: T) => {
      // Clear existing timer
      const existingTimer = this.timers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timerId = window.setTimeout(() => {
        fn(...args);
        this.timers.delete(key);
      }, delay);

      this.timers.set(key, timerId);
    };
  }

  /**
   * Cancel debounced function
   */
  static cancel(key: string): void {
    const timerId = this.timers.get(key);
    if (timerId) {
      clearTimeout(timerId);
      this.timers.delete(key);
    }
  }

  /**
   * Clear all debounced functions
   */
  static clearAll(): void {
    this.timers.forEach(timerId => clearTimeout(timerId));
    this.timers.clear();
  }

  /**
   * Check if function is pending
   */
  static isPending(key: string): boolean {
    return this.timers.has(key);
  }
}
