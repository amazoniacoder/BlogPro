/**
 * Analytics Storage Service
 * 
 * Database-backed analytics system replacing localStorage approach.
 */

import { Disposable, LifecycleManager } from '../lifecycle/LifecycleManager';

export interface AnalyticsEvent {
  id: string;
  sessionId: string;
  userId?: string;
  eventType: 'performance' | 'usage' | 'error' | 'spell_check';
  timestamp: number;
  data: Record<string, any>;
  metadata: {
    userAgent: string;
    editorVersion: string;
    pluginVersions: Record<string, string>;
  };
}

export class AnalyticsStorage implements Disposable {
  private buffer: AnalyticsEvent[] = [];
  private sessionId: string;
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;
  private static instance: AnalyticsStorage | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.startPeriodicFlush();
    
    // Register with lifecycle manager
    const lifecycleManager = LifecycleManager.getInstance();
    lifecycleManager.register(this);
  }

  static getInstance(): AnalyticsStorage {
    if (!this.instance) {
      this.instance = new AnalyticsStorage();
    }
    return this.instance;
  }

  /**
   * Record an analytics event
   */
  async recordEvent(eventType: AnalyticsEvent['eventType'], data: Record<string, any>): Promise<void> {
    const event: AnalyticsEvent = {
      id: this.generateId(),
      sessionId: this.sessionId,
      eventType,
      timestamp: Date.now(),
      data,
      metadata: {
        userAgent: navigator.userAgent,
        editorVersion: '2.1.0',
        pluginVersions: this.getPluginVersions()
      }
    };

    this.buffer.push(event);

    // Auto-flush when buffer is full
    if (this.buffer.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  /**
   * Flush buffered events to server
   */
  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const events = [...this.buffer];
    this.buffer = [];

    try {
      // Send to server analytics endpoint
      const response = await fetch('/api/editor-analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      console.log(`📊 Analytics: Sent ${events.length} events to server`);
    } catch (error) {
      console.warn('Analytics: Server unavailable, storing offline:', error);
      // Fallback to IndexedDB for offline storage
      await this.storeOffline(events);
    }
  }

  /**
   * Store events offline using IndexedDB
   */
  private async storeOffline(events: AnalyticsEvent[]): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['analytics'], 'readwrite');
      const store = transaction.objectStore('analytics');

      for (const event of events) {
        await new Promise<void>((resolve, reject) => {
          const request = store.add(event);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      console.log(`💾 Analytics: Stored ${events.length} events offline`);
    } catch (error) {
      console.error('Analytics: Failed to store offline:', error);
    }
  }

  /**
   * Open IndexedDB for offline storage
   */
  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TextEditorAnalytics', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('analytics')) {
          const store = db.createObjectStore('analytics', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('eventType', 'eventType');
        }
      };
    });
  }

  /**
   * Start periodic flush timer
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        console.warn('Analytics: Periodic flush failed:', error);
      });
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique event ID
   */
  private generateId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get plugin versions for metadata
   */
  private getPluginVersions(): Record<string, string> {
    // This would be populated by the plugin system
    return {
      'word-count': '1.0.0',
      'spell-check': '1.0.0',
      'auto-save': '1.0.0',
      'performance-monitor': '1.0.0'
    };
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get buffer status
   */
  getBufferStatus(): { size: number; maxSize: number } {
    return {
      size: this.buffer.length,
      maxSize: this.BATCH_SIZE
    };
  }

  /**
   * Force flush all buffered events
   */
  async forceFlush(): Promise<void> {
    await this.flush();
  }

  /**
   * Dispose method for lifecycle management
   */
  async dispose(): Promise<void> {
    // Clear flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    // Flush remaining events
    await this.flush();

    // Unregister from lifecycle manager
    const lifecycleManager = LifecycleManager.getInstance();
    lifecycleManager.unregister(this);
  }

  /**
   * Reset singleton instance (for testing)
   */
  static reset(): void {
    if (this.instance) {
      this.instance.dispose();
      this.instance = null;
    }
  }
}
