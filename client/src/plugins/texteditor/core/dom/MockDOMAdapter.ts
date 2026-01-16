/**
 * Mock DOM Adapter
 * 
 * Testing implementation of DOM operations for unit tests.
 */

import { DOMAdapter, DOMManipulator } from './DOMAdapter';

export class MockDOMAdapter implements DOMAdapter, DOMManipulator {
  private mockSelection: Selection | null = null;
  private mockElements = new Map<string, Element>();
  private commandStates = new Map<string, boolean>();
  private commandValues = new Map<string, string>();

  // Test utilities
  setMockSelection(selection: Selection | null): void {
    this.mockSelection = selection;
  }

  setMockElement(selector: string, element: Element): void {
    this.mockElements.set(selector, element);
  }

  setCommandState(command: string, state: boolean): void {
    this.commandStates.set(command, state);
  }

  setCommandValue(command: string, value: string): void {
    this.commandValues.set(command, value);
  }

  // Selection operations
  getSelection(): Selection | null {
    return this.mockSelection;
  }

  createRange(): Range {
    return new Range();
  }

  // Element operations
  querySelector(selector: string): Element | null {
    return this.mockElements.get(selector) || null;
  }

  createElement(tagName: string): Element {
    return document.createElement(tagName);
  }

  // Command operations
  execCommand(_command: string, _showUI = false, _value?: string): boolean {
    return true; // Mock always succeeds
  }

  queryCommandState(command: string): boolean {
    return this.commandStates.get(command) || false;
  }

  queryCommandValue(command: string): string {
    return this.commandValues.get(command) || '';
  }

  // Event operations
  addEventListener(_element: Element, _event: string, _handler: EventListener): void {
    // Mock implementation - no actual event binding
  }

  removeEventListener(_element: Element, _event: string, _handler: EventListener): void {
    // Mock implementation - no actual event removal
  }

  // Focus operations
  focus(_element: Element): void {
    // Mock implementation
  }

  blur(_element: Element): void {
    // Mock implementation
  }

  // DOM Manipulation
  insertNode(_node: Node, _range?: Range): void {
    // Mock implementation
  }

  removeNode(_node: Node): void {
    // Mock implementation
  }

  replaceNode(_oldNode: Node, _newNode: Node): void {
    // Mock implementation
  }

  wrapSelection(tagName: string, _className?: string): Element | null {
    return this.createElement(tagName);
  }

  unwrapElement(_element: Element): void {
    // Mock implementation
  }
}
