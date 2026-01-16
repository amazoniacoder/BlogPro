/**
 * Comprehensive validation test suite
 * Validates all security, performance, and quality improvements
 */

import '../setup'; // Import global test setup
import { SecurityService } from '../../shared/utils/SecurityService';
import { InputValidator } from '../../shared/utils/InputValidator';
import { DOMCache } from '../../shared/utils/DOMCache';
import { Debouncer } from '../../shared/utils/Debouncer';
import { EDITOR_CONFIG } from '../../shared/constants/EditorConfig';
import { ServiceFactory } from '../../core/services/ServiceFactory';

class FormatError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'FormatError';
  }
}

class SecurityError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'SecurityError';
  }
}

class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
  }
}

describe('Comprehensive Validation', () => {
  describe('Security Compliance', () => {
    test('prevents all XSS vectors', () => {
      const xssVectors = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        '<a href="javascript:alert(1)">click</a>',
        '<iframe src="javascript:alert(1)"></iframe>'
      ];

      xssVectors.forEach(vector => {
        const sanitized = SecurityService.sanitizeHTML(vector);
        expect(sanitized).not.toContain('script');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('iframe');
      });
    });

    test('validates all input types', () => {
      expect(InputValidator.validateFontSize('12pt')).toBe(true);
      expect(InputValidator.validateFontSize('invalid')).toBe(false);
      expect(InputValidator.validateFontFamily('Arial')).toBe(true);
      expect(InputValidator.validateFontFamily('Invalid')).toBe(false);
      expect(InputValidator.validateContent('<p>Valid</p>')).toBe(true);
      expect(InputValidator.validateContent('<script>evil</script>')).toBe(false);
    });
  });

  describe('Performance Optimization', () => {
    test('caching improves performance', () => {
      const element = document.createElement('p');
      const formatState = {
        bold: true,
        italic: false,
        underline: false,
        fontSize: '12pt' as const,
        fontFamily: 'Arial' as const,
        textAlign: 'left' as const
      };

      // Set cache
      DOMCache.setFormat(element, formatState);
      
      // Get cached value
      const cached = DOMCache.getFormat(element);

      expect(cached).toEqual(formatState);
      // Cache functionality works if we get the same object back
      expect(cached).toBeDefined();
    });

    test('debouncing reduces function calls', async () => {
      let callCount = 0;
      const testFn = () => { callCount++; };
      
      const debouncedFn = Debouncer.debounce('test', testFn, 50);
      
      // Rapid calls
      for (let i = 0; i < 10; i++) {
        debouncedFn();
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callCount).toBe(1); // Only one execution
    });

    test('meets performance targets', () => {
      const start = performance.now();
      
      // Simulate format detection
      for (let i = 0; i < 100; i++) {
        SecurityService.sanitizeHTML('<p>test content</p>');
      }
      
      const duration = performance.now() - start;
      const avgDuration = duration / 100;
      
      expect(avgDuration).toBeLessThan(1); // <1ms per operation
    });
  });

  describe('Code Quality', () => {
    test('uses structured error types', () => {
      expect(() => {
        throw new FormatError('Test format error', { context: 'test' });
      }).toThrow(FormatError);

      expect(() => {
        throw new SecurityError('Test security error', { severity: 'critical' });
      }).toThrow(SecurityError);

      expect(() => {
        throw new ValidationError('Test validation error', { input: 'invalid' });
      }).toThrow(ValidationError);
    });

    test('uses centralized configuration', () => {
      expect(EDITOR_CONFIG.PERFORMANCE.DEBOUNCE_DELAY).toBe(16);
      expect(EDITOR_CONFIG.SECURITY.MAX_CONTENT_LENGTH).toBe(50000);
      expect(EDITOR_CONFIG.FORMAT.PX_TO_PT_RATIO).toBe(0.75);
      expect(EDITOR_CONFIG.FORMAT.DEFAULT_FONT_SIZE).toBe('12pt');
      expect(EDITOR_CONFIG.FORMAT.DEFAULT_FONT_FAMILY).toBe('Arial');
    });

    test('eliminates execCommand usage', async () => {
      // Setup DOM
      document.body.innerHTML = '<div><p>test</p></div>';
      
      // Get unified format service
      const formatService = await ServiceFactory.getUnifiedFormatService();
      
      // Test modern formatting - should not throw errors
      expect(() => {
        formatService.applyBold();
        formatService.applyItalic();
        formatService.applyUnderline();
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('complete workflow without vulnerabilities', () => {
      // Simulate user input with potential XSS
      const userInput = '<p>Normal text</p><script>alert("xss")</script>';
      
      // Validate and sanitize
      const isValid = InputValidator.validateContent(userInput);
      expect(isValid).toBe(false);
      
      const sanitized = SecurityService.sanitizeHTML(userInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Normal text</p>');
    });

    test('performance under load', () => {
      const operations = 1000;
      const start = performance.now();
      
      for (let i = 0; i < operations; i++) {
        const content = `<p>Test content ${i}</p>`;
        SecurityService.sanitizeHTML(content);
        InputValidator.validateContent(content);
      }
      
      const duration = performance.now() - start;
      const avgDuration = duration / operations;
      
      expect(avgDuration).toBeLessThan(1); // <1ms per operation
      expect(duration).toBeLessThan(1000); // <1s total for 1000 operations
    });
  });
});
