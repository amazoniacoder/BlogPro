/**
 * Plugin Status Service
 * Manages plugin lifecycle status and health monitoring
 */

export interface PluginStatus {
  readonly name: string;
  readonly status: 'loading' | 'active' | 'error' | 'disabled';
  readonly error?: string;
  readonly lastUpdate: number;
}

export interface PluginHealth {
  readonly totalPlugins: number;
  readonly activePlugins: number;
  readonly errorPlugins: number;
  readonly loadingPlugins: number;
}

export class PluginStatusService {
  private static instance: PluginStatusService;
  private pluginStatuses = new Map<string, PluginStatus>();
  private listeners = new Set<(health: PluginHealth) => void>();

  static getInstance(): PluginStatusService {
    if (!this.instance) {
      this.instance = new PluginStatusService();
    }
    return this.instance;
  }

  updatePluginStatus(name: string, status: PluginStatus['status'], error?: string): void {
    this.pluginStatuses.set(name, {
      name,
      status,
      error,
      lastUpdate: Date.now()
    });
    this.notifyListeners();
  }

  getPluginStatus(name: string): PluginStatus | undefined {
    return this.pluginStatuses.get(name);
  }

  getAllStatuses(): PluginStatus[] {
    return Array.from(this.pluginStatuses.values());
  }

  getHealth(): PluginHealth {
    const statuses = this.getAllStatuses();
    return {
      totalPlugins: statuses.length,
      activePlugins: statuses.filter(s => s.status === 'active').length,
      errorPlugins: statuses.filter(s => s.status === 'error').length,
      loadingPlugins: statuses.filter(s => s.status === 'loading').length
    };
  }

  subscribe(listener: (health: PluginHealth) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const health = this.getHealth();
    this.listeners.forEach(listener => listener(health));
  }

  destroy(): void {
    this.pluginStatuses.clear();
    this.listeners.clear();
  }
}
