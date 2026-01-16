/**
 * Analytics Engine
 * 
 * Structured analytics system with batching and persistence.
 */

export interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  metadata: Record<string, any>;
}

export interface AnalyticsReport {
  timeRange: string;
  totalOperations: number;
  averageDuration: number;
  slowestOperations: PerformanceMetric[];
  memoryUsage: number;
}

export class AnalyticsEngine {
  private buffer: PerformanceMetric[] = [];
  private readonly BATCH_SIZE = 100;
  private flushTimer: number | null = null;

  record(metric: PerformanceMetric): void {
    this.buffer.push(metric);
    
    if (this.buffer.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = window.setTimeout(() => this.flush(), 5000);
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, this.BATCH_SIZE);
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    try {
      await this.persistBatch(batch);
    } catch (error) {
      console.warn('Failed to persist analytics batch:', error);
      // Fallback to localStorage
      this.fallbackToLocalStorage(batch);
    }
  }

  private async persistBatch(batch: PerformanceMetric[]): Promise<void> {
    // Try server first
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: batch })
      });
    } catch {
      // Fallback to IndexedDB
      await this.storeInIndexedDB(batch);
    }
  }

  private fallbackToLocalStorage(batch: PerformanceMetric[]): void {
    const existing = JSON.parse(localStorage.getItem('editor_analytics') || '[]');
    const updated = [...existing, ...batch].slice(-1000); // Keep last 1000
    localStorage.setItem('editor_analytics', JSON.stringify(updated));
  }

  private async storeInIndexedDB(batch: PerformanceMetric[]): Promise<void> {
    const db = await this.openIndexedDB();
    const transaction = db.transaction(['analytics'], 'readwrite');
    const store = transaction.objectStore('analytics');
    
    for (const metric of batch) {
      await store.add(metric);
    }
  }

  private openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EditorAnalytics', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('analytics')) {
          const store = db.createObjectStore('analytics', { keyPath: 'timestamp' });
          store.createIndex('operation', 'operation', { unique: false });
        }
      };
    });
  }

  getAnalytics(timeRange: string): AnalyticsReport {
    const data = JSON.parse(localStorage.getItem('editor_analytics') || '[]');
    const now = Date.now();
    const ranges = {
      'hour': 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - (ranges[timeRange as keyof typeof ranges] || ranges.day);
    const filtered = data.filter((m: PerformanceMetric) => m.timestamp >= cutoff);
    
    return {
      timeRange,
      totalOperations: filtered.length,
      averageDuration: filtered.reduce((sum: number, m: PerformanceMetric) => sum + m.duration, 0) / filtered.length || 0,
      slowestOperations: filtered.sort((a: PerformanceMetric, b: PerformanceMetric) => b.duration - a.duration).slice(0, 10),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
    };
  }

  async dispose(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}
