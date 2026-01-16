/**
 * Lifecycle Manager
 * 
 * Centralized management of disposable resources to prevent memory leaks.
 */

export interface Disposable {
  dispose(): void | Promise<void>;
}

export class LifecycleManager {
  private disposables = new Set<Disposable>();
  private disposed = false;
  private static instance: LifecycleManager | null = null;

  /**
   * Get singleton instance
   */
  static getInstance(): LifecycleManager {
    if (!this.instance) {
      this.instance = new LifecycleManager();
    }
    return this.instance;
  }

  /**
   * Register a disposable resource
   */
  register(disposable: Disposable): void {
    if (this.disposed) {
      throw new Error('LifecycleManager already disposed');
    }
    this.disposables.add(disposable);
  }

  /**
   * Unregister a disposable resource
   */
  unregister(disposable: Disposable): void {
    this.disposables.delete(disposable);
  }

  /**
   * Dispose all registered resources
   */
  async dispose(): Promise<void> {
    if (this.disposed) return;

    const promises: Promise<void>[] = [];
    
    for (const disposable of this.disposables) {
      try {
        const result = disposable.dispose();
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        console.warn('Error disposing resource:', error);
      }
    }

    // Wait for all async disposals to complete
    await Promise.allSettled(promises);
    
    this.disposables.clear();
    this.disposed = true;
  }

  /**
   * Check if manager is disposed
   */
  isDisposed(): boolean {
    return this.disposed;
  }

  /**
   * Get count of registered disposables
   */
  getRegisteredCount(): number {
    return this.disposables.size;
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
