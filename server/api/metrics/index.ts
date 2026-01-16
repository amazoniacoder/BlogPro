import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { cacheManager } from '../../utils/cacheManager';


const router = Router();

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Application performance metrics
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Performance metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 memory:
 *                   type: object
 *                   properties:
 *                     heapUsed:
 *                       type: number
 *                     heapTotal:
 *                       type: number
 *                     external:
 *                       type: number
 *                 cpu:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: number
 *                     system:
 *                       type: number
 */
router.get('/', asyncHandler(async (_, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
    },
    cpu: {
      user: Math.round(cpuUsage.user / 1000), // ms
      system: Math.round(cpuUsage.system / 1000), // ms
    },
    nodeVersion: process.version,
    platform: process.platform,
    cache: cacheManager.getStats(),
  };

  logger.info('Metrics requested', {
    heapUsed: metrics.memory.heapUsed,
    uptime: metrics.uptime,
  });

  res.json(metrics);
}));

export default router;