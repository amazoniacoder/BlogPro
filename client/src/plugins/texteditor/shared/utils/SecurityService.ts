/**
 * Security service for XSS prevention and input sanitization
 * Implements minimal, type-safe security measures
 */

import { EDITOR_CONFIG } from '../constants/EditorConfig';

class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
  }
}

interface SanitizeOptions {
  readonly allowedTags: readonly string[];
  readonly stripScripts: boolean;
}

export class SecurityService {
  private static readonly DEFAULT_OPTIONS: SanitizeOptions = EDITOR_CONFIG.SECURITY.SANITIZATION_OPTIONS;

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHTML(input: string, options: SanitizeOptions = this.DEFAULT_OPTIONS): string {
    if (!input) return '';
    
    let sanitized = input;
    
    // Remove script tags and their content
    if (options.stripScripts) {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    // Remove dangerous attributes and javascript: URLs
    sanitized = sanitized.replace(/\s(on\w+|javascript:|data:)\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    
    // Remove dangerous tags
    const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'meta', 'link'];
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized;
  }

  /**
   * Sanitize input for logging to prevent log injection
   */
  static sanitizeLog(input: unknown): string {
    return String(input)
      .replace(/[\n\r]/g, ' ')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .slice(0, 200);
  }

  /**
   * Validate content length and basic structure
   */
  static validateContent(content: string): boolean {
    if (content.length > EDITOR_CONFIG.SECURITY.MAX_CONTENT_LENGTH) {
      throw new ValidationError('Content exceeds maximum length', {
        length: content.length,
        maxLength: EDITOR_CONFIG.SECURITY.MAX_CONTENT_LENGTH
      });
    }
    
    return content.length <= EDITOR_CONFIG.SECURITY.MAX_CONTENT_LENGTH && 
           !/<script/i.test(content) &&
           !content.includes('javascript:');
  }
}
