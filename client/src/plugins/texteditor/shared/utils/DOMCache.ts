/**
 * DOM caching service for performance optimization
 * Uses WeakMap for memory-efficient caching
 */

import { FormatState } from '../constants/EditorConfig';

export class DOMCache {
  private static formatCache = new WeakMap<Element, FormatState>();
  private static boundaryCache = new WeakMap<Node, boolean>();
  private static computedStyleCache = new WeakMap<Element, CSSStyleDeclaration>();

  /**
   * Get cached format state for element
   */
  static getFormat(element: Element): FormatState | undefined {
    return this.formatCache.get(element);
  }

  /**
   * Cache format state for element
   */
  static setFormat(element: Element, format: FormatState): void {
    this.formatCache.set(element, format);
  }

  /**
   * Get cached boundary state for node
   */
  static getBoundary(node: Node): boolean | undefined {
    return this.boundaryCache.get(node);
  }

  /**
   * Cache boundary state for node
   */
  static setBoundary(node: Node, isBoundary: boolean): void {
    this.boundaryCache.set(node, isBoundary);
  }

  /**
   * Get cached computed style for element
   */
  static getComputedStyle(element: Element): CSSStyleDeclaration | undefined {
    return this.computedStyleCache.get(element);
  }

  /**
   * Cache computed style for element
   */
  static setComputedStyle(element: Element, style: CSSStyleDeclaration): void {
    this.computedStyleCache.set(element, style);
  }

  /**
   * Clear all caches (call on content change)
   */
  static clearAll(): void {
    // WeakMaps automatically clean up when elements are removed from DOM
    // But we can create new instances for immediate cleanup
    this.formatCache = new WeakMap();
    this.boundaryCache = new WeakMap();
    this.computedStyleCache = new WeakMap();
  }

  /**
   * Get cache statistics (development only)
   */
  static getStats(): { formatCacheSize: number; boundaryCacheSize: number; styleCacheSize: number } {
    // WeakMaps don't expose size, so this is for debugging only
    return {
      formatCacheSize: 0, // WeakMap size not accessible
      boundaryCacheSize: 0,
      styleCacheSize: 0
    };
  }
}
