/**
 * APM Service
 * Application Performance Monitoring integration
 */

export interface APMConfig {
  readonly enabled: boolean;
  readonly endpoint?: string;
  readonly apiKey?: string;
  readonly serviceName: string;
  readonly environment: 'development' | 'staging' | 'production';
}

export interface APMMetric {
  readonly name: string;
  readonly value: number;
  readonly timestamp: number;
  readonly tags?: Record<string, string>;
}

export interface APMError {
  readonly message: string;
  readonly stack?: string;
  readonly context: string;
  readonly timestamp: number;
  readonly userId?: string;
}

export class APMService {
  private static instance: APMService;
  private config: APMConfig;
  private metricsQueue: APMMetric[] = [];
  private errorsQueue: APMError[] = [];
  private flushInterval?: NodeJS.Timeout;

  private constructor(config: APMConfig) {
    this.config = config;
    this.startFlushInterval();
  }

  static initialize(config: APMConfig): APMService {
    if (!this.instance) {
      this.instance = new APMService(config);
    }
    return this.instance;
  }

  static getInstance(): APMService | null {
    return this.instance || null;
  }

  trackOperation(name: string, duration: number, tags?: Record<string, string>): void {
    if (!this.config.enabled) return;

    this.metricsQueue.push({
      name: `editor.operation.${name}`,
      value: duration,
      timestamp: Date.now(),
      tags: {
        service: this.config.serviceName,
        environment: this.config.environment,
        ...tags
      }
    });
  }

  trackRenderTime(duration: number): void {
    if (!this.config.enabled) return;

    this.metricsQueue.push({
      name: 'editor.render.duration',
      value: duration,
      timestamp: Date.now(),
      tags: {
        service: this.config.serviceName,
        environment: this.config.environment
      }
    });
  }

  trackMemoryUsage(usage: number): void {
    if (!this.config.enabled) return;

    this.metricsQueue.push({
      name: 'editor.memory.usage',
      value: usage,
      timestamp: Date.now(),
      tags: {
        service: this.config.serviceName,
        environment: this.config.environment
      }
    });
  }

  trackError(error: Error, context: string, userId?: string): void {
    if (!this.config.enabled) return;

    this.errorsQueue.push({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      userId
    });

    // Immediate flush for errors in production
    if (this.config.environment === 'production') {
      this.flushErrors();
    }
  }

  trackUserInteraction(action: string, element: string): void {
    if (!this.config.enabled) return;

    this.metricsQueue.push({
      name: 'editor.user.interaction',
      value: 1,
      timestamp: Date.now(),
      tags: {
        action,
        element,
        service: this.config.serviceName,
        environment: this.config.environment
      }
    });
  }

  trackFeatureUsage(feature: string, metadata?: Record<string, string>): void {
    if (!this.config.enabled) return;

    this.metricsQueue.push({
      name: 'editor.feature.usage',
      value: 1,
      timestamp: Date.now(),
      tags: {
        feature,
        service: this.config.serviceName,
        environment: this.config.environment,
        ...metadata
      }
    });
  }

  private startFlushInterval(): void {
    if (!this.config.enabled) return;

    // Flush metrics every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
      this.flushErrors();
    }, 30000);
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsQueue.length === 0) return;

    const metrics = [...this.metricsQueue];
    this.metricsQueue = [];

    try {
      await this.sendToAPM('/metrics', { metrics });
    } catch (error) {
      console.error('Failed to send metrics to APM:', error);
      // Re-queue metrics on failure (with limit)
      if (this.metricsQueue.length < 1000) {
        this.metricsQueue.unshift(...metrics.slice(-100));
      }
    }
  }

  private async flushErrors(): Promise<void> {
    if (this.errorsQueue.length === 0) return;

    const errors = [...this.errorsQueue];
    this.errorsQueue = [];

    try {
      await this.sendToAPM('/errors', { errors });
    } catch (error) {
      console.error('Failed to send errors to APM:', error);
      // Re-queue errors on failure (with limit)
      if (this.errorsQueue.length < 100) {
        this.errorsQueue.unshift(...errors.slice(-10));
      }
    }
  }

  private async sendToAPM(endpoint: string, data: any): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey || this.config.environment === 'development') {
      // Silently skip APM in development or when not configured
      return;
    }

    // Skip if endpoint is example/placeholder URL
    if (this.config.endpoint.includes('example.com') || this.config.endpoint.includes('localhost')) {
      return;
    }

    try {
      const response = await fetch(`${this.config.endpoint}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Service-Name': this.config.serviceName
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`APM request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      // Silently ignore network errors in development
      if (this.config.environment !== 'production') {
        return;
      }
      throw error;
    }
  }

  getQueueStats(): { metricsCount: number; errorsCount: number } {
    return {
      metricsCount: this.metricsQueue.length,
      errorsCount: this.errorsQueue.length
    };
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Final flush
    this.flushMetrics();
    this.flushErrors();
    
    this.metricsQueue = [];
    this.errorsQueue = [];
  }
}
