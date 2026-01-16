
/**
 * Diagnostic utilities to analyze formatting boundaries and DOM structure
 */

import { SecurityService } from './SecurityService';

export class FormatDiagnostics {
  /**
   * Analyze the current DOM structure and cursor position
   */
  static analyzeCursorPosition(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log('❌ No selection available');
      return;
    }

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    const offset = range.startOffset;

    console.log('🔍 CURSOR POSITION ANALYSIS:');
    console.log('- Container type:', container.nodeType === Node.TEXT_NODE ? 'TEXT_NODE' : 'ELEMENT_NODE');
    console.log('- Container content:', SecurityService.sanitizeLog(container.textContent));
    console.log('- Offset:', offset);
    console.log('- Parent element:', container.parentElement?.tagName);
    console.log('- Parent classes:', SecurityService.sanitizeLog(container.parentElement?.className));
    console.log('- Parent innerHTML:', SecurityService.sanitizeLog(container.parentElement?.innerHTML));
    
    // Check all ancestors
    let current = container.parentElement;
    let level = 0;
    console.log('📊 ANCESTOR CHAIN:');
    while (current && level < 10) {
      console.log(`  ${level}: <${current.tagName.toLowerCase()}${current.className ? ` class="${current.className}"` : ''}${current.getAttribute('style') ? ` style="${current.getAttribute('style')}"` : ''}>`);
      current = current.parentElement;
      level++;
    }
  }

  /**
   * Analyze formatting elements in the current paragraph
   */
  static analyzeFormattingElements(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    const paragraph = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement?.closest('p')
      : (container as Element).closest('p');

    if (!paragraph) {
      console.log('❌ No paragraph found');
      return;
    }

    console.log('🎨 FORMATTING ANALYSIS:');
    console.log('- Paragraph HTML:', SecurityService.sanitizeLog(paragraph.innerHTML));
    
    // Find all formatting elements
    const formatElements = paragraph.querySelectorAll('strong, em, u, b, i, span[style]');
    console.log('- Format elements found:', formatElements.length);
    
    formatElements.forEach((el, index) => {
      const sanitizedContent = SecurityService.sanitizeLog(el.textContent);
      const sanitizedStyle = SecurityService.sanitizeLog(el.getAttribute('style'));
      console.log(`  ${index}: <${el.tagName.toLowerCase()}${el.getAttribute('style') ? ` style="${sanitizedStyle}"` : ''}>${sanitizedContent}</${el.tagName.toLowerCase()}>`);
    });

    // Check if cursor is inside any formatting
    let current = container.parentElement;
    const formatAncestors: string[] = [];
    while (current && current !== paragraph) {
      if (current.matches('strong, em, u, b, i, span[style]')) {
        formatAncestors.push(current.tagName.toLowerCase());
      }
      current = current.parentElement;
    }
    
    console.log('- Cursor inside formats:', formatAncestors.join(', ') || 'none');
  }

  /**
   * Test space key behavior in real-time
   */
  static testSpaceKeyBehavior(): void {
    console.log('🧪 SPACE KEY TEST:');
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log('❌ No selection for testing');
      return;
    }

    console.log('BEFORE SPACE:');
    this.analyzeCursorPosition();
    
    // Simulate space insertion
    document.execCommand('insertText', false, ' ');
    
    console.log('AFTER SPACE:');
    this.analyzeCursorPosition();
    
    // Check if we're still in formatted element
    const newSelection = window.getSelection();
    if (newSelection && newSelection.rangeCount > 0) {
      const newRange = newSelection.getRangeAt(0);
      const newContainer = newRange.startContainer;
      const parent = newContainer.parentElement;
      
      if (parent?.matches('strong, em, u, b, i, span[style]')) {
        console.log('⚠️ STILL IN FORMATTED ELEMENT:', parent.tagName);
        console.log('- This is why formatting continues!');
      } else {
        console.log('✅ Outside formatted elements');
      }
    }
  }

  /**
   * Add diagnostic button to editor for testing
   */
  static addDiagnosticButton(): void {
    const button = document.createElement('button');
    button.textContent = '🔍 Diagnose';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '5px 10px';
    button.style.background = '#007acc';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '3px';
    button.style.cursor = 'pointer';
    
    button.onclick = () => {
      console.clear();
      console.log('🚀 FORMAT DIAGNOSTICS STARTED');
      this.analyzeCursorPosition();
      this.analyzeFormattingElements();
    };
    
    document.body.appendChild(button);
  }
}
