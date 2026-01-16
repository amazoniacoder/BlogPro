/**
 * Font formatting service for font size and font family
 * Uses DOMManipulationService for common DOM operations
 */

import { FontSize, FontFamily } from '../../types/CoreTypes';
import { DOMManipulationService } from '../dom/DOMManipulationService';

export class FontFormatService {
  /**
   * Apply font size formatting
   */
  static applyFontSize(fontSize: FontSize): void {
    DOMManipulationService.applyStyleToSelection('font-size', fontSize);
  }

  /**
   * Apply font family formatting
   */
  static applyFontFamily(fontFamily: FontFamily): void {
    DOMManipulationService.applyStyleToSelection('font-family', fontFamily);
  }

  /**
   * Get font size from element
   */
  static getFontSize(element: Element): FontSize {
    const fontSize = DOMManipulationService.getStyleFromHierarchy(element, 'font-size', '12pt');
    return this.parseFontSize(fontSize);
  }

  /**
   * Get font family from element
   */
  static getFontFamily(element: Element): FontFamily {
    const fontFamily = DOMManipulationService.getStyleFromHierarchy(element, 'font-family', 'Verdana, sans-serif');
    return this.parseFontFamily(fontFamily);
  }



  /**
   * Parse font size string to FontSize type
   */
  private static parseFontSize(fontSize: string): FontSize {
    const numericValue = parseFloat(fontSize);
    
    if (fontSize.includes('px')) {
      const ptValue = Math.round(numericValue * 0.75);
      return this.mapSizeToFontSize(ptValue);
    } else if (fontSize.includes('pt')) {
      return this.mapSizeToFontSize(numericValue);
    } else if (fontSize.includes('em') || fontSize.includes('rem')) {
      const pxValue = numericValue * 16;
      const ptValue = Math.round(pxValue * 0.75);
      return this.mapSizeToFontSize(ptValue);
    } else {
      const ptValue = Math.round(numericValue * 0.75);
      return this.mapSizeToFontSize(ptValue);
    }
  }

  /**
   * Map numeric size to FontSize type
   */
  private static mapSizeToFontSize(size: number): FontSize {
    if (size <= 8) return '8pt';
    if (size <= 10) return '10pt';
    if (size <= 12) return '12pt';
    if (size <= 14) return '14pt';
    if (size <= 18) return '18pt';
    if (size <= 24) return '24pt';
    return '36pt';
  }



  /**
   * Parse font family string to FontFamily type
   */
  private static parseFontFamily(fontFamily: string): FontFamily {
    const clean = fontFamily.replace(/['\"]/g, '').toLowerCase().trim();
    const firstFont = clean.split(',')[0].trim();
    
    if (firstFont === 'arial' || firstFont === 'arial black') return 'Arial';
    if (firstFont === 'times new roman' || firstFont === 'times') return 'Times New Roman';
    if (firstFont === 'helvetica' || firstFont === 'helvetica neue') return 'Helvetica';
    if (firstFont === 'georgia') return 'Georgia';
    if (firstFont === 'verdana') return 'Verdana';
    if (firstFont === 'roboto') return 'Roboto';
    if (firstFont === 'courier new' || firstFont === 'courier') return 'Courier New';
    
    if (firstFont.includes('arial')) return 'Arial';
    if (firstFont.includes('times')) return 'Times New Roman';
    if (firstFont.includes('helvetica')) return 'Helvetica';
    if (firstFont.includes('georgia')) return 'Georgia';
    if (firstFont.includes('verdana')) return 'Verdana';
    if (firstFont.includes('roboto')) return 'Roboto';
    if (firstFont.includes('courier')) return 'Courier New';
    
    return 'Verdana'; // Default to Verdana
  }
}
