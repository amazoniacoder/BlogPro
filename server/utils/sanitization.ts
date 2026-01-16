import { z } from 'zod';

// Enhanced input sanitization utilities
export class InputSanitizer {
  // Sanitize string input with enhanced comment-specific protection
  static sanitizeString(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:(?!image\/)[^;]*;/gi, '') // Remove non-image data URLs
      .replace(/vbscript:/gi, '') // Remove vbscript
      .replace(/<iframe\b[^>]*>/gi, '') // Remove iframe tags
      .replace(/<object\b[^>]*>/gi, '') // Remove object tags
      .replace(/<embed\b[^>]*>/gi, ''); // Remove embed tags
  }
  
  // Sanitize URL/path input
  static sanitizePath(input: string): string {
    if (typeof input !== 'string') return '/';
    
    return input
      .trim()
      .substring(0, 500)
      .replace(/[^\w\-._~:/?#[\]@!$&'()*+,;=%]/g, '') // Allow only URL-safe characters
      .replace(/\.{2,}/g, '.') // Prevent directory traversal
      .replace(/^\/+/, '/'); // Normalize leading slashes
  }
  
  // Sanitize IP address
  static sanitizeIP(input: string): string | null {
    if (typeof input !== 'string') return null;
    
    // IPv4 regex
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // IPv6 regex (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    const cleaned = input.trim();
    
    if (ipv4Regex.test(cleaned) || ipv6Regex.test(cleaned)) {
      return cleaned;
    }
    
    return null;
  }
  
  // Sanitize user agent
  static sanitizeUserAgent(input: string): string {
    if (typeof input !== 'string') return 'Unknown';
    
    return input
      .trim()
      .substring(0, 1000)
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
      .replace(/<[^>]*>/g, ''); // Remove HTML tags
  }
  
  // Validate and sanitize comment data
  static sanitizeCommentData(data: any): any {
    const schema = z.object({
      postId: z.number().positive(),
      content: z.string().min(1).max(2000).transform(val => this.sanitizeString(val, 2000)),
      parentId: z.number().positive().optional().nullable()
    });
    
    return schema.parse(data);
  }
  
  // Validate and sanitize analytics tracking data
  static sanitizeTrackingData(data: any): any {
    const schema = z.object({
      sessionId: z.string().min(1).max(255).transform(val => this.sanitizeString(val, 255)),
      pagePath: z.string().min(1).max(500).transform(val => this.sanitizePath(val)),
      pageTitle: z.string().optional().transform(val => val ? this.sanitizeString(val, 500) : undefined),
      referrer: z.string().optional().transform(val => val ? this.sanitizeString(val, 500) : undefined),
      userAgent: z.string().optional().transform(val => val ? this.sanitizeUserAgent(val) : undefined),
      deviceType: z.string().optional().transform(val => val ? this.sanitizeString(val, 50) : undefined),
      browser: z.string().optional().transform(val => val ? this.sanitizeString(val, 100) : undefined),
      os: z.string().optional().transform(val => val ? this.sanitizeString(val, 100) : undefined),
      screenResolution: z.string().optional().transform(val => val ? this.sanitizeString(val, 20) : undefined)
    });
    
    return schema.parse(data);
  }
}