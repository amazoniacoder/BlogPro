import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  const startCpuUsage = process.cpuUsage();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const endCpuUsage = process.cpuUsage(startCpuUsage);
    
    const metrics: PerformanceMetrics = {
      responseTime: Number(endTime - startTime) / 1000000, // Convert to milliseconds
      memoryUsage: process.memoryUsage(),
      cpuUsage: endCpuUsage,
    };

    // Log slow requests (>1000ms)
    if (metrics.responseTime > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        responseTime: `${metrics.responseTime.toFixed(2)}ms`,
        statusCode: res.statusCode,
        memoryUsed: `${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        cpuUser: `${(metrics.cpuUsage.user / 1000).toFixed(2)}ms`,
      });
    }

    // Log performance metrics for monitoring
    logger.debug('Request performance', {
      method: req.method,
      url: req.originalUrl,
      responseTime: `${metrics.responseTime.toFixed(2)}ms`,
      statusCode: res.statusCode,
      heapUsed: metrics.memoryUsage.heapUsed,
      cpuUser: metrics.cpuUsage.user,
    });
  });

  next();
};