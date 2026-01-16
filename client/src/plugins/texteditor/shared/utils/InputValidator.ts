/**
 * Type-safe input validation utilities
 */

import { FONT_SIZES, FONT_FAMILIES } from '../constants/EditorConfig';

type FontSize = typeof FONT_SIZES[number];
type FontFamily = typeof FONT_FAMILIES[number];

export class InputValidator {
  /**
   * Type guard for FontSize validation
   */
  static validateFontSize(size: string): size is FontSize {
    return FONT_SIZES.includes(size as FontSize);
  }

  /**
   * Type guard for FontFamily validation
   */
  static validateFontFamily(family: string): family is FontFamily {
    return FONT_FAMILIES.includes(family as FontFamily);
  }

  /**
   * Validate content structure and length
   */
  static validateContent(content: string): boolean {
    return content.length <= 50000 && 
           !/<script/i.test(content) &&
           !content.includes('javascript:') &&
           !content.includes('data:text/html');
  }

  /**
   * Validate HTML structure for editor content
   */
  static validateHTMLStructure(html: string): boolean {
    // Check for balanced tags
    const openTags = (html.match(/<[^\/][^>]*>/g) || []).length;
    const closeTags = (html.match(/<\/[^>]*>/g) || []).length;
    const selfClosing = (html.match(/<[^>]*\/>/g) || []).length;
    
    return openTags === closeTags + selfClosing;
  }
}
