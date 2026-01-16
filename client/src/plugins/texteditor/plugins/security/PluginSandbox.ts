/**
 * Plugin Sandbox System
 * 
 * Provides secure, isolated execution environment for plugins.
 */

import { EditorInstance } from '../core/PluginInterface';

export interface PluginPermissions {
  dom: boolean;
  network: boolean;
  storage: boolean;
  editor: ('read' | 'write')[];
}

export interface ResourceLimits {
  memoryLimit: string; // e.g., '10MB'
  cpuTime: string;     // e.g., '100ms'
  networkRequests: number;
}

export interface SecurePluginContext {
  editor: Partial<EditorInstance>;
  storage: Storage | null;
  network: {
    fetch: typeof fetch;
  } | null;
  permissions: PluginPermissions;
}

export class PluginSandbox {
  private permissions: PluginPermissions;
  private resourceLimits: ResourceLimits;
  private networkRequestCount = 0;

  constructor(permissions: PluginPermissions, resourceLimits: ResourceLimits) {
    this.permissions = permissions;
    this.resourceLimits = resourceLimits;
  }

  /**
   * Create secure context for plugin execution
   */
  createSecureContext(originalEditor: EditorInstance): SecurePluginContext {
    return {
      editor: this.createEditorProxy(originalEditor),
      storage: this.permissions.storage ? this.createStorageProxy() : null,
      network: this.permissions.network ? this.createNetworkProxy() : null,
      permissions: { ...this.permissions }
    };
  }

  /**
   * Create limited editor proxy based on permissions
   */
  private createEditorProxy(editor: EditorInstance): Partial<EditorInstance> {
    const proxy: Partial<EditorInstance> = {};

    // Always allow read operations
    if (this.permissions.editor.includes('read')) {
      proxy.getContent = () => editor.getContent();
      proxy.getSelection = () => editor.getSelection();
      proxy.getElement = () => editor.getElement?.() || null;
    }

    // Only allow write operations if permitted
    if (this.permissions.editor.includes('write')) {
      proxy.setContent = (content: string) => editor.setContent(content);
      proxy.insertText = (text: string) => editor.insertText(text);
      proxy.focus = () => editor.focus();
    }

    // Event listeners are always restricted
    proxy.addEventListener = (event: string, handler: Function) => {
      // Only allow safe events
      const safeEvents = ['input', 'change', 'focus', 'blur'];
      if (safeEvents.includes(event)) {
        editor.addEventListener?.(event, handler);
      } else {
        console.warn(`Plugin sandbox: Event '${event}' not allowed`);
      }
    };

    proxy.removeEventListener = (event: string, handler: Function) => {
      editor.removeEventListener?.(event, handler);
    };

    return proxy;
  }

  /**
   * Create limited storage proxy
   */
  private createStorageProxy(): Storage {
    const prefix = 'plugin_';
    
    return {
      getItem: (key: string) => {
        return localStorage.getItem(prefix + key);
      },
      setItem: (key: string, value: string) => {
        // Limit storage size per plugin
        if (value.length > 1024 * 100) { // 100KB limit
          throw new Error('Plugin storage limit exceeded (100KB)');
        }
        localStorage.setItem(prefix + key, value);
      },
      removeItem: (key: string) => {
        localStorage.removeItem(prefix + key);
      },
      clear: () => {
        // Only clear plugin-prefixed items
        const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
        keys.forEach(key => localStorage.removeItem(key));
      },
      key: (index: number) => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
        return keys[index] || null;
      },
      get length() {
        return Object.keys(localStorage).filter(k => k.startsWith(prefix)).length;
      }
    };
  }

  /**
   * Create limited network proxy
   */
  private createNetworkProxy(): { fetch: typeof fetch } {
    return {
      fetch: async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        // Check request limits
        if (this.networkRequestCount >= this.resourceLimits.networkRequests) {
          throw new Error('Plugin network request limit exceeded');
        }

        this.networkRequestCount++;

        // Validate URL
        const url = typeof input === 'string' ? input : input.toString();
        if (!this.isAllowedURL(url)) {
          throw new Error(`Plugin network access denied for URL: ${url}`);
        }

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        try {
          const response = await fetch(input, {
            ...init,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      }
    };
  }

  /**
   * Check if URL is allowed for plugin network access
   */
  private isAllowedURL(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Block localhost and private IPs
      if (parsedUrl.hostname === 'localhost' || 
          parsedUrl.hostname === '127.0.0.1' ||
          parsedUrl.hostname.startsWith('192.168.') ||
          parsedUrl.hostname.startsWith('10.') ||
          parsedUrl.hostname.startsWith('172.')) {
        return false;
      }

      // Only allow HTTPS
      if (parsedUrl.protocol !== 'https:') {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reset resource counters
   */
  resetResourceCounters(): void {
    this.networkRequestCount = 0;
  }

  /**
   * Get current resource usage
   */
  getResourceUsage(): {
    networkRequests: number;
    networkLimit: number;
  } {
    return {
      networkRequests: this.networkRequestCount,
      networkLimit: this.resourceLimits.networkRequests
    };
  }
}
