/**
 * DOM Adapter Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BrowserDOMAdapter } from '../../core/dom/BrowserDOMAdapter';
import { MockDOMAdapter } from '../../core/dom/MockDOMAdapter';
import { DOMAdapterFactory } from '../../core/dom/DOMAdapterFactory';

describe('DOM Abstraction Layer', () => {
  beforeEach(() => {
    DOMAdapterFactory.reset();
  });

  describe('BrowserDOMAdapter', () => {
    let adapter: BrowserDOMAdapter;

    beforeEach(() => {
      adapter = new BrowserDOMAdapter();
    });

    it('should create elements', () => {
      const element = adapter.createElement('div');
      expect(element.tagName.toLowerCase()).toBe('div');
    });

    it('should handle selection operations', () => {
      const selection = adapter.getSelection();
      expect(selection).toBeDefined();
    });

    it('should create ranges', () => {
      const range = adapter.createRange();
      expect(range).toBeInstanceOf(Range);
    });

    it('should wrap selection with element', () => {
      // Mock a simple selection scenario
      const wrapper = adapter.wrapSelection('strong');
      expect(wrapper?.tagName.toLowerCase()).toBe('strong');
    });
  });

  describe('MockDOMAdapter', () => {
    let adapter: MockDOMAdapter;

    beforeEach(() => {
      adapter = new MockDOMAdapter();
    });

    it('should return mock selection', () => {
      const mockSelection = {} as Selection;
      adapter.setMockSelection(mockSelection);
      
      expect(adapter.getSelection()).toBe(mockSelection);
    });

    it('should return mock elements', () => {
      const mockElement = document.createElement('div');
      adapter.setMockElement('.test', mockElement);
      
      expect(adapter.querySelector('.test')).toBe(mockElement);
    });

    it('should handle command states', () => {
      adapter.setCommandState('bold', true);
      expect(adapter.queryCommandState('bold')).toBe(true);
    });

    it('should handle command values', () => {
      adapter.setCommandValue('fontSize', '14px');
      expect(adapter.queryCommandValue('fontSize')).toBe('14px');
    });
  });

  describe('DOMAdapterFactory', () => {
    it('should return browser adapter by default', () => {
      const adapter = DOMAdapterFactory.getInstance();
      expect(adapter).toBeInstanceOf(BrowserDOMAdapter);
    });

    it('should return mock adapter in test mode', () => {
      DOMAdapterFactory.setTestMode(true);
      const adapter = DOMAdapterFactory.getInstance();
      expect(adapter).toBeInstanceOf(MockDOMAdapter);
    });

    it('should allow custom adapter instances', () => {
      const customAdapter = new MockDOMAdapter();
      DOMAdapterFactory.setInstance(customAdapter);
      
      expect(DOMAdapterFactory.getInstance()).toBe(customAdapter);
    });

    it('should reset properly', () => {
      DOMAdapterFactory.setTestMode(true);
      DOMAdapterFactory.reset();
      
      const adapter = DOMAdapterFactory.getInstance();
      expect(adapter).toBeInstanceOf(BrowserDOMAdapter);
    });
  });
});
