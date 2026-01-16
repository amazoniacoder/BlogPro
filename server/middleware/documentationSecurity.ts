/**
 * Documentation Security Middleware
 * Security measures for documentation API endpoints
 */

import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Rate limiting for content updates
export const contentUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 updates per window per IP
  message: {
    error: 'Too many content updates',
    message: 'Please try again later',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for content creation
export const contentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 creations per hour per IP
  message: {
    error: 'Too many content creations',
    message: 'Please try again later',
    retryAfter: 3600
  }
});

// Input validation for content updates
export const validateContentUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { content, title, library_type, excerpt } = req.body;
  const errors: string[] = [];

  // Validate content
  if (!content || typeof content !== 'string') {
    errors.push('Content is required');
  } else if (content.length < 1 || content.length > 50000) {
    errors.push('Content must be between 1 and 50,000 characters');
  }

  // Validate title (optional)
  if (title && (typeof title !== 'string' || title.length > 500)) {
    errors.push('Title must be less than 500 characters');
  }

  // Validate library_type
  if (!library_type || !['texteditor', 'website'].includes(library_type)) {
    errors.push('Invalid library type');
  }

  // Validate excerpt (optional)
  if (excerpt && (typeof excerpt !== 'string' || excerpt.length > 1000)) {
    errors.push('Excerpt must be less than 1000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      errors
    });
  }

  next();
};

// Input validation for section updates
export const validateSectionUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, library_type } = req.body;
  const errors: string[] = [];

  // Validate name
  if (!name || typeof name !== 'string') {
    errors.push('Section name is required');
  } else if (name.length < 1 || name.length > 255) {
    errors.push('Section name must be between 1 and 255 characters');
  }

  // Validate description (optional)
  if (description && (typeof description !== 'string' || description.length > 1000)) {
    errors.push('Description must be less than 1000 characters');
  }

  // Validate library_type
  if (!library_type || !['texteditor', 'website'].includes(library_type)) {
    errors.push('Invalid library type');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      errors
    });
  }

  next();
};

// Role-based access control
export const requireEditorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  
  if (!userRole || (userRole !== 'admin' && userRole !== 'editor')) {
    return res.status(403).json({ 
      error: 'Insufficient permissions',
      message: 'Editor or admin access required',
      requiredRole: ['admin', 'editor'],
      currentRole: userRole || 'none'
    });
  }
  
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  
  if (userRole !== 'admin') {
    return res.status(403).json({ 
      error: 'Insufficient permissions',
      message: 'Admin access required',
      requiredRole: 'admin',
      currentRole: userRole || 'none'
    });
  }
  
  next();
};

// Library access validation
export const validateLibraryAccess = (req: Request, res: Response, next: NextFunction) => {
  const { libraryType } = req.params;
  
  // Validate library type
  if (!['texteditor', 'website'].includes(libraryType)) {
    return res.status(400).json({
      error: 'Invalid library type',
      message: 'Library type must be "texteditor" or "website"',
      provided: libraryType
    });
  }
  
  // Check if user has access to this library
  // For now, all authenticated users can access both libraries
  // This can be extended for more granular permissions
  
  next();
};

// Content ownership validation
export const validateContentOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const { contentId } = req.params;
  const userRole = req.user?.role;
  const userId = req.user?.id;
  
  // Admins can edit any content
  if (userRole === 'admin') {
    return next();
  }
  
  // For editors, check if they created the content or if it's unowned
  try {
    const { pool } = await import('../db/db');
    const result = await pool.query(
      'SELECT created_by FROM documentation_content WHERE id = $1',
      [contentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Content not found',
        contentId
      });
    }
    
    const createdBy = result.rows[0].created_by;
    
    // Allow if content is unowned or user is the creator
    if (!createdBy || createdBy === userId) {
      return next();
    }
    
    return res.status(403).json({
      error: 'Insufficient permissions',
      message: 'You can only edit content you created',
      contentId
    });
    
  } catch (error) {
    console.error('Error validating content ownership:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate permissions'
    });
  }
};

// Security headers middleware
export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy for documentation content
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:;"
  );
  
  next();
};

// Request logging for security monitoring
export const securityLogger = (req: Request, _res: Response, next: NextFunction) => {
  const userRole = req.user?.role || 'anonymous';
  const userId = req.user?.id || 'unknown';
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[SECURITY] ${new Date().toISOString()} - ${req.method} ${req.path} - User: ${userId} (${userRole}) - IP: ${ip}`);
  
  next();
};