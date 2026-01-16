import { logger } from './logger';

interface SystemMetrics {
  timestamp: string;
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  uptime: number;
}

class MetricsCollector {
  private metrics: SystemMetrics[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private readonly maxMetrics = 100; // Keep last 100 metrics

  start(intervalMinutes: number = 1) {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, intervalMinutes * 60 * 1000);

    logger.info('Metrics collector started', { interval: `${intervalMinutes}m` });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Metrics collector stopped');
    }
  }

  private collectMetrics() {
    const metric: SystemMetrics = {
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
    };

    this.metrics.push(metric);

    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log high memory usage
    const heapUsedMB = metric.memory.heapUsed / 1024 / 1024;
    if (heapUsedMB > 100) {
      logger.warn('High memory usage detected', {
        heapUsed: `${heapUsedMB.toFixed(2)}MB`,
        heapTotal: `${(metric.memory.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      });
    }
  }

  getMetrics(): SystemMetrics[] {
    return [...this.metrics];
  }

  getLatestMetrics(): SystemMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }
}

export const metricsCollector = new MetricsCollector();