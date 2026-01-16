import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF token generation and validation
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();
  
  // Generate CSRF token
  static generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    
    this.tokens.set(sessionId, { token, expires });
    
    // Cleanup expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }
  
  // Validate CSRF token
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored || stored.expires < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }
  
  // Cleanup expired tokens
  private static cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (data.expires < now) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

// CSRF middleware for analytics endpoints
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests and tracking endpoint
  if (req.method === 'GET' || req.path === '/api/analytics/track') {
    return next();
  }
  
  const sessionId = req.sessionID || req.ip || 'anonymous';
  const token = req.headers['x-csrf-token'] as string;
  
  if (!token || !CSRFProtection.validateToken(sessionId, token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
};

// Endpoint to get CSRF token
export const getCsrfToken = (req: Request, res: Response) => {
  const sessionId = req.sessionID || req.ip || 'anonymous';
  const token = CSRFProtection.generateToken(sessionId);
  
  res.json({ csrfToken: token });
};