/**
 * DOM Adapter Interface
 * 
 * Abstraction layer for DOM operations to improve testability and reduce coupling.
 */

export interface DOMAdapter {
  // Selection operations
  getSelection(): Selection | null;
  createRange(): Range;
  
  // Element operations
  querySelector(selector: string): Element | null;
  createElement(tagName: string): Element;
  
  // Command operations
  execCommand(command: string, showUI?: boolean, value?: string): boolean;
  queryCommandState(command: string): boolean;
  queryCommandValue(command: string): string;
  
  // Event operations
  addEventListener(element: Element, event: string, handler: EventListener): void;
  removeEventListener(element: Element, event: string, handler: EventListener): void;
  
  // Focus operations
  focus(element: Element): void;
  blur(element: Element): void;
}

export interface DOMManipulator {
  insertNode(node: Node, range?: Range): void;
  removeNode(node: Node): void;
  replaceNode(oldNode: Node, newNode: Node): void;
  wrapSelection(tagName: string, className?: string): Element | null;
  unwrapElement(element: Element): void;
}
