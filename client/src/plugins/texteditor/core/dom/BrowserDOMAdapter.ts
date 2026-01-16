/**
 * Browser DOM Adapter
 * 
 * Production implementation of DOM operations using browser APIs.
 */

import { DOMAdapter, DOMManipulator } from './DOMAdapter';

export class BrowserDOMAdapter implements DOMAdapter, DOMManipulator {
  // Selection operations
  getSelection(): Selection | null {
    return window.getSelection();
  }

  createRange(): Range {
    return document.createRange();
  }

  // Element operations
  querySelector(selector: string): Element | null {
    return document.querySelector(selector);
  }

  createElement(tagName: string): Element {
    return document.createElement(tagName);
  }

  // Command operations
  execCommand(command: string, showUI = false, value?: string): boolean {
    return document.execCommand(command, showUI, value);
  }

  queryCommandState(command: string): boolean {
    return document.queryCommandState(command);
  }

  queryCommandValue(command: string): string {
    return document.queryCommandValue(command);
  }

  // Event operations
  addEventListener(element: Element, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
  }

  removeEventListener(element: Element, event: string, handler: EventListener): void {
    element.removeEventListener(event, handler);
  }

  // Focus operations
  focus(element: Element): void {
    (element as HTMLElement).focus();
  }

  blur(element: Element): void {
    (element as HTMLElement).blur();
  }

  // DOM Manipulation
  insertNode(node: Node, range?: Range): void {
    const targetRange = range || this.getSelection()?.getRangeAt(0);
    if (targetRange) {
      targetRange.insertNode(node);
    }
  }

  removeNode(node: Node): void {
    node.parentNode?.removeChild(node);
  }

  replaceNode(oldNode: Node, newNode: Node): void {
    oldNode.parentNode?.replaceChild(newNode, oldNode);
  }

  wrapSelection(tagName: string, className?: string): Element | null {
    const selection = this.getSelection();
    if (!selection?.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const wrapper = this.createElement(tagName);
    
    if (className) {
      wrapper.className = className;
    }

    try {
      range.surroundContents(wrapper);
      return wrapper;
    } catch {
      // Fallback for complex selections
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
      return wrapper;
    }
  }

  unwrapElement(element: Element): void {
    const parent = element.parentNode;
    if (!parent) return;

    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
  }
}
