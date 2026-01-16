import { describe, it, expect } from 'vitest';
import { InputSanitizer } from '../../utils/sanitization';
import { CSRFProtection } from '../../middleware/csrfProtection';

describe('Analytics Security Tests', () => {
  describe('Input Sanitization', () => {
    it('should sanitize malicious strings', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = InputSanitizer.sanitizeString(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should sanitize path traversal attempts', () => {
      const maliciousPath = '../../../etc/passwd';
      const sanitized = InputSanitizer.sanitizePath(maliciousPath);
      expect(sanitized).not.toContain('../');
    });

    it('should validate IP addresses', () => {
      expect(InputSanitizer.sanitizeIP('192.168.1.1')).toBe('192.168.1.1');
      expect(InputSanitizer.sanitizeIP('invalid-ip')).toBeNull();
      expect(InputSanitizer.sanitizeIP('999.999.999.999')).toBeNull();
    });

    it('should sanitize user agents', () => {
      const maliciousUA = 'Mozilla/5.0 <script>alert(1)</script>';
      const sanitized = InputSanitizer.sanitizeUserAgent(maliciousUA);
      expect(sanitized).not.toContain('<script>');
    });

    it('should validate tracking data', () => {
      const validData = {
        sessionId: 'valid-session-123',
        pagePath: '/valid/path',
        pageTitle: 'Valid Title'
      };

      const sanitized = InputSanitizer.sanitizeTrackingData(validData);
      expect(sanitized.sessionId).toBe('valid-session-123');
      expect(sanitized.pagePath).toBe('/valid/path');
    });

    it('should reject invalid tracking data', () => {
      const invalidData = {
        sessionId: '',
        pagePath: ''
      };

      expect(() => InputSanitizer.sanitizeTrackingData(invalidData))
        .toThrow();
    });
  });

  describe('CSRF Protection', () => {
    it('should generate valid CSRF tokens', () => {
      const token = CSRFProtection.generateToken('test-session');
      expect(token).toHaveLength(64);
      expect(typeof token).toBe('string');
    });

    it('should validate correct CSRF tokens', () => {
      const sessionId = 'test-session';
      const token = CSRFProtection.generateToken(sessionId);
      expect(CSRFProtection.validateToken(sessionId, token)).toBe(true);
    });

    it('should reject invalid CSRF tokens', () => {
      const sessionId = 'test-session';
      const invalidToken = 'invalid-token';
      expect(CSRFProtection.validateToken(sessionId, invalidToken)).toBe(false);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in tracking data', () => {
      const sqlInjection = "'; DROP TABLE analytics_page_views; --";
      const sanitized = InputSanitizer.sanitizeString(sqlInjection);
      expect(sanitized).not.toContain('DROP TABLE');
      expect(sanitized).not.toContain('--');
    });
  });
});