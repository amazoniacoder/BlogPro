/**
 * Security compliance test suite
 * Validates XSS prevention, input validation, and secure logging
 */

import { SecurityService } from '../../shared/utils/SecurityService';
import { InputValidator } from '../../shared/utils/InputValidator';

describe('Security Compliance', () => {
  describe('XSS Prevention', () => {
    test('prevents script injection', () => {
      const maliciousInput = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = SecurityService.sanitizeHTML(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    test('removes dangerous attributes', () => {
      const maliciousInput = '<p onclick="alert(\'xss\')" onload="malicious()">Content</p>';
      const sanitized = SecurityService.sanitizeHTML(maliciousInput);
      
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('onload');
      expect(sanitized).toContain('Content');
    });

    test('removes javascript: URLs', () => {
      const maliciousInput = '<a href="javascript:alert(\'xss\')">Link</a>';
      const sanitized = SecurityService.sanitizeHTML(maliciousInput);
      
      expect(sanitized).not.toContain('javascript:');
    });
  });

  describe('Log Injection Prevention', () => {
    test('sanitizes newlines in logs', () => {
      const maliciousLog = 'user input\n[FAKE] Admin logged in';
      const sanitized = SecurityService.sanitizeLog(maliciousLog);
      
      expect(sanitized).not.toContain('\n');
      expect(sanitized).toContain('user input [FAKE] Admin logged in');
    });

    test('limits log length', () => {
      const longInput = 'a'.repeat(500);
      const sanitized = SecurityService.sanitizeLog(longInput);
      
      expect(sanitized.length).toBeLessThanOrEqual(200);
    });
  });

  describe('Input Validation', () => {
    test('validates font sizes', () => {
      expect(InputValidator.validateFontSize('12pt')).toBe(true);
      expect(InputValidator.validateFontSize('14pt')).toBe(true);
      expect(InputValidator.validateFontSize('invalid')).toBe(false);
    });

    test('validates font families', () => {
      expect(InputValidator.validateFontFamily('Arial')).toBe(true);
      expect(InputValidator.validateFontFamily('Times New Roman')).toBe(true);
      expect(InputValidator.validateFontFamily('InvalidFont')).toBe(false);
    });

    test('validates content structure', () => {
      expect(InputValidator.validateContent('<p>Valid content</p>')).toBe(true);
      expect(InputValidator.validateContent('<script>alert("xss")</script>')).toBe(false);
      expect(InputValidator.validateContent('a'.repeat(60000))).toBe(false);
    });
  });
});
