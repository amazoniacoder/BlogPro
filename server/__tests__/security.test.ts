import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { securityHeadersMiddleware } from '../middleware/security';

describe('Security Headers', () => {
  const app = express();
  app.use(securityHeadersMiddleware);
  app.get('/test', (_req, res) => res.json({ message: 'test' }));

  it('should set security headers', async () => {
    const response = await request(app).get('/test');
    
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-xss-protection']).toBe('0');
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('should set HSTS header', async () => {
    const response = await request(app).get('/test');
    
    expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
    expect(response.headers['strict-transport-security']).toContain('includeSubDomains');
  });
});