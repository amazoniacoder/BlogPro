import { Request, Response, NextFunction } from 'express';
import { createSuccessResponse, createErrorResponse, validateResponseFormat } from '../utils/responseHelpers';

// Middleware to ensure all responses follow the standard format
export const responseStandardizationMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // If data is already in standard format, use it as-is
    if (validateResponseFormat(data)) {
      return originalJson.call(this, data);
    }
    
    // If it's an error response without standard format
    if (res.statusCode >= 400) {
      const errorMessage = typeof data === 'string' ? data : data?.message || 'An error occurred';
      const errorData = createErrorResponse(errorMessage, 'Request failed');
      return originalJson.call(this, errorData);
    }
    
    // If it's a success response without standard format
    const successData = createSuccessResponse(data, 'Request successful');
    return originalJson.call(this, successData);
  };
  
  next();
};

// Middleware to add response timing
export const responseTimingMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  const originalJson = res.json;
  res.json = function(data: any) {
    const responseTime = Date.now() - startTime;
    
    // Add response time to headers
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    // Add response time to data if it's in standard format
    if (validateResponseFormat(data)) {
      data.responseTime = `${responseTime}ms`;
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Middleware to add request ID for tracing
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Add to request for logging
  (req as any).requestId = requestId;
  
  // Add to response headers
  res.setHeader('X-Request-ID', requestId);
  
  const originalJson = res.json;
  res.json = function(data: any) {
    // Add request ID to response if it's in standard format
    if (validateResponseFormat(data)) {
      data.requestId = requestId;
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};