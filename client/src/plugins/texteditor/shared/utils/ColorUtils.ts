/**
 * Color utility functions for text editor
 * Handles color validation, conversion, and manipulation
 */

export class ColorUtils {
  /**
   * Validate if a string is a valid hex color
   */
  static isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  /**
   * Validate if a string is a valid RGB color
   */
  static isValidRgbColor(color: string): boolean {
    return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color);
  }

  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!this.isValidHexColor(hex)) return null;
    
    const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert RGB to hex color
   */
  static rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Get contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      const rgb = this.hexToRgb(color);
      if (!rgb) return 0;
      
      const { r, g, b } = rgb;
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if color meets WCAG AA contrast requirements
   */
  static meetsContrastRequirement(foreground: string, background: string): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return ratio >= 4.5; // WCAG AA standard
  }

  /**
   * Normalize color to hex format
   */
  static normalizeColor(color: string): string {
    if (this.isValidHexColor(color)) {
      return color.toUpperCase();
    }
    
    // Handle RGB format
    const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return this.rgbToHex(parseInt(r), parseInt(g), parseInt(b));
    }
    
    // Handle named colors (basic set)
    const namedColors: Record<string, string> = {
      'black': '#000000',
      'white': '#FFFFFF',
      'red': '#FF0000',
      'green': '#008000',
      'blue': '#0000FF',
      'yellow': '#FFFF00',
      'cyan': '#00FFFF',
      'magenta': '#FF00FF',
      'gray': '#808080',
      'grey': '#808080'
    };
    
    const normalized = color.toLowerCase();
    return namedColors[normalized] || color;
  }

  /**
   * Get readable text color (black or white) for a background color
   */
  static getReadableTextColor(backgroundColor: string): string {
    const whiteContrast = this.getContrastRatio('#FFFFFF', backgroundColor);
    const blackContrast = this.getContrastRatio('#000000', backgroundColor);
    
    return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
  }

  /**
   * Lighten a color by a percentage
   */
  static lightenColor(color: string, percent: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    const { r, g, b } = rgb;
    const amount = Math.round(255 * (percent / 100));
    
    return this.rgbToHex(
      Math.min(255, r + amount),
      Math.min(255, g + amount),
      Math.min(255, b + amount)
    );
  }

  /**
   * Darken a color by a percentage
   */
  static darkenColor(color: string, percent: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    const { r, g, b } = rgb;
    const amount = Math.round(255 * (percent / 100));
    
    return this.rgbToHex(
      Math.max(0, r - amount),
      Math.max(0, g - amount),
      Math.max(0, b - amount)
    );
  }
}
