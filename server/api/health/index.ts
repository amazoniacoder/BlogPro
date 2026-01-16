import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { checkDatabaseConnection } from '../../db/db';
import { checkRedisConnection } from '../../db/redis';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         responseTime:
 *                           type: string
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         responseTime:
 *                           type: string
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', asyncHandler(async (_, res) => {
  const startTime = Date.now();
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'unknown', responseTime: '0ms' },
      redis: { status: 'unknown', responseTime: '0ms' }
    }
  };

  // Check database
  const dbStart = Date.now();
  const dbHealthy = await checkDatabaseConnection();
  healthCheck.services.database = {
    status: dbHealthy ? 'healthy' : 'unhealthy',
    responseTime: `${Date.now() - dbStart}ms`
  };

  // Check Redis
  const redisStart = Date.now();
  const redisHealthy = await checkRedisConnection();
  healthCheck.services.redis = {
    status: redisHealthy ? 'healthy' : 'unhealthy',
    responseTime: `${Date.now() - redisStart}ms`
  };

  // Overall health status
  const isHealthy = dbHealthy && redisHealthy;
  healthCheck.status = isHealthy ? 'healthy' : 'unhealthy';

  const statusCode = isHealthy ? 200 : 503;
  
  logger.info('Health check performed', {
    status: healthCheck.status,
    database: healthCheck.services.database.status,
    redis: healthCheck.services.redis.status,
    totalTime: `${Date.now() - startTime}ms`
  });

  res.status(statusCode).json(healthCheck);
}));

router.get('/ready', asyncHandler(async (_, res) => {
  const dbHealthy = await checkDatabaseConnection();
  
  if (dbHealthy) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready', reason: 'database unavailable' });
  }
}));

router.get('/live', (_, res) => {
  res.status(200).json({ status: 'alive' });
});

export default router;