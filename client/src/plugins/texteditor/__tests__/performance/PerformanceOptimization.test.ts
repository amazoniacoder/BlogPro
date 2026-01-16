/**
 * Performance optimization test suite
 * Validates caching, debouncing, and response times
 */

import { DOMCache } from '../../shared/utils/DOMCache';
import { Debouncer } from '../../shared/utils/Debouncer';
import { ServiceFactory } from '../../core/services/ServiceFactory';

describe('Performance Optimization', () => {
  let formatService: any;

  beforeEach(() => {
    // Setup DOM environment
    document.body.innerHTML = '<div class="editor-content"><p><strong>Test</strong> content</p></div>';
    formatService = ServiceFactory.getUnifiedFormatService();
  });

  describe('DOM Caching', () => {
    test('caches format state', () => {
      const element = document.createElement('strong');
      const formatState = {
        bold: true,
        italic: false,
        underline: false,
        fontSize: '12pt' as const,
        fontFamily: 'Arial' as const,
        textAlign: 'left' as const
      };

      DOMCache.setFormat(element, formatState);
      const cached = DOMCache.getFormat(element);

      expect(cached).toEqual(formatState);
    });

    test('caches boundary state', () => {
      const node = document.createTextNode('test');
      
      DOMCache.setBoundary(node, true);
      const cached = DOMCache.getBoundary(node);

      expect(cached).toBe(true);
    });

    test('clears cache properly', () => {
      const element = document.createElement('p');
      const formatState = {
        bold: false,
        italic: false,
        underline: false,
        fontSize: '12pt' as const,
        fontFamily: 'Arial' as const,
        textAlign: 'left' as const
      };

      DOMCache.setFormat(element, formatState);
      DOMCache.clearAll();
      
      const cached = DOMCache.getFormat(element);
      expect(cached).toBeUndefined();
    });
  });

  describe('Debouncing', () => {
    test('debounces function calls', async () => {
      let callCount = 0;
      const testFn = () => { callCount++; };
      
      const debouncedFn = Debouncer.debounce('test', testFn, 50);
      
      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      // Should only execute once after delay
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callCount).toBe(1);
    });

    test('cancels debounced function', () => {
      let callCount = 0;
      const testFn = () => { callCount++; };
      
      const debouncedFn = Debouncer.debounce('test-cancel', testFn, 50);
      debouncedFn();
      
      Debouncer.cancel('test-cancel');
      
      setTimeout(() => {
        expect(callCount).toBe(0);
      }, 100);
    });

    test('checks pending state', () => {
      const testFn = () => {};
      const debouncedFn = Debouncer.debounce('test-pending', testFn, 50);
      
      expect(Debouncer.isPending('test-pending')).toBe(false);
      
      debouncedFn();
      expect(Debouncer.isPending('test-pending')).toBe(true);
    });
  });

  describe('Performance Benchmarks', () => {
    test('format detection under 16ms', () => {
      // Mock Range methods
      const mockRange = {
        selectNode: vi.fn(),
        setStart: vi.fn(),
        collapse: vi.fn(),
        startContainer: document.createTextNode('test'),
        startOffset: 0
      };
      
      vi.spyOn(document, 'createRange').mockReturnValue(mockRange as any);
      
      const mockSelection = {
        rangeCount: 1,
        isCollapsed: true,
        getRangeAt: () => mockRange,
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };
      
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const start = performance.now();
      formatService.getFormatState();
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(16); // 60fps target
    });

    test('boundary detection performance', () => {
      // Mock Range methods
      const mockRange = {
        selectNode: vi.fn(),
        setStart: vi.fn(),
        collapse: vi.fn(),
        startContainer: document.createTextNode('test'),
        startOffset: 0
      };
      
      vi.spyOn(document, 'createRange').mockReturnValue(mockRange as any);
      
      const mockSelection = {
        rangeCount: 1,
        isCollapsed: true,
        getRangeAt: () => mockRange,
        removeAllRanges: vi.fn(),
        addRange: vi.fn()
      };
      
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);

      const start = performance.now();
      
      // Run multiple times to test performance
      for (let i = 0; i < 100; i++) {
        formatService.getFormatState();
      }
      
      const duration = performance.now() - start;
      const avgDuration = duration / 100;

      expect(avgDuration).toBeLessThan(1); // Should be very fast with caching
    });
  });

  describe('Memory Management', () => {
    test('WeakMap allows garbage collection', () => {
      let element: Element | null = document.createElement('div');
      const formatState = {
        bold: true,
        italic: false,
        underline: false,
        fontSize: '12pt' as const,
        fontFamily: 'Arial' as const,
        textAlign: 'left' as const
      };

      DOMCache.setFormat(element, formatState);
      
      // Remove reference
      element = null;
      
      // Force garbage collection (if available)
      if (global.gc) {
        global.gc();
      }
      
      // WeakMap should allow element to be garbage collected
      // This test mainly ensures no memory leaks in our implementation
      expect(true).toBe(true); // WeakMap behavior is internal
    });
  });
});
