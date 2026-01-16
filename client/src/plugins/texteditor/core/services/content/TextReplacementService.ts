/**
 * Text Replacement Service - Professional text replacement with DOM API integration
 */
import { ServiceFactory } from '../ServiceFactory';

export class TextReplacementService {
  /**
   * Replace highlighted spell error element with correction
   */
  static replaceSpellError(errorElement: HTMLElement, replacementText: string): boolean {
    return ServiceFactory.getDOMManipulationService()
      .replaceElementWithText(errorElement, replacementText);
  }

  /**
   * Replace text while preserving formatting context
   */
  static replaceTextInContext(
    targetNode: Node, 
    startOffset: number, 
    endOffset: number, 
    replacementText: string
  ): boolean {
    try {
      if (targetNode.nodeType !== Node.TEXT_NODE) return false;
      
      const textNode = targetNode as Text;
      const originalText = textNode.textContent || '';
      
      if (startOffset < 0 || endOffset > originalText.length || startOffset > endOffset) {
        return false;
      }
      
      const beforeText = originalText.substring(0, startOffset);
      const afterText = originalText.substring(endOffset);
      const newText = beforeText + replacementText + afterText;
      
      textNode.textContent = newText;
      
      return true;
    } catch (error) {
      console.error('TextReplacementService: Failed to replace text in context', error);
      return false;
    }
  }
}
