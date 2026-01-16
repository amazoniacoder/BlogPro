import { useState, useEffect, useCallback } from 'react';
import { PluginRegistry } from '../../plugins/core/PluginRegistry';
import { PluginStatusService, PluginHealth } from '../services/PluginStatusService';

export interface PluginConfigItem {
  readonly name: string;
  readonly enabled: boolean;
  readonly config: Record<string, unknown>;
  readonly status: 'loading' | 'active' | 'error' | 'disabled';
}

export interface UsePluginConfigReturn {
  readonly plugins: PluginConfigItem[];
  readonly health: PluginHealth;
  readonly togglePlugin: (name: string) => Promise<void>;
  readonly updatePluginConfig: (name: string, config: Record<string, unknown>) => Promise<void>;
  readonly refreshPlugins: () => void;
}

export const usePluginConfig = (): UsePluginConfigReturn => {
  const [plugins, setPlugins] = useState<PluginConfigItem[]>([]);
  const [health, setHealth] = useState<PluginHealth>({
    totalPlugins: 0,
    activePlugins: 0,
    errorPlugins: 0,
    loadingPlugins: 0
  });

  const statusService = PluginStatusService.getInstance();

  const refreshPlugins = useCallback(() => {
    const registeredPlugins = PluginRegistry.getRegisteredPlugins();
    const initializedPlugins = PluginRegistry.getInitializedPlugins();
    
    const pluginItems: PluginConfigItem[] = registeredPlugins.map(plugin => {
      const status = statusService.getPluginStatus(plugin.name);
      return {
        name: plugin.name,
        enabled: initializedPlugins.includes(plugin.name),
        config: {},
        status: status?.status || 'disabled'
      };
    });
    
    setPlugins(pluginItems);
    setHealth(statusService.getHealth());
  }, [statusService]);

  const togglePlugin = useCallback(async (name: string): Promise<void> => {
    try {
      const isInitialized = PluginRegistry.isInitialized(name);
      
      if (isInitialized) {
        await PluginRegistry.destroy(name);
        statusService.updatePluginStatus(name, 'disabled');
      } else {
        statusService.updatePluginStatus(name, 'loading');
        await PluginRegistry.initialize(name);
        statusService.updatePluginStatus(name, 'active');
      }
      
      refreshPlugins();
    } catch (error) {
      statusService.updatePluginStatus(name, 'error', (error as Error).message);
      refreshPlugins();
    }
  }, [refreshPlugins, statusService]);

  const updatePluginConfig = useCallback(async (
    name: string, 
    config: Record<string, unknown>
  ): Promise<void> => {
    try {
      // Restart plugin with new config
      if (PluginRegistry.isInitialized(name)) {
        await PluginRegistry.destroy(name);
        await PluginRegistry.initialize(name, config);
        statusService.updatePluginStatus(name, 'active');
      }
      refreshPlugins();
    } catch (error) {
      statusService.updatePluginStatus(name, 'error', (error as Error).message);
      refreshPlugins();
    }
  }, [refreshPlugins, statusService]);

  useEffect(() => {
    refreshPlugins();
    const unsubscribe = statusService.subscribe(setHealth);
    return unsubscribe;
  }, [refreshPlugins, statusService]);

  return {
    plugins,
    health,
    togglePlugin,
    updatePluginConfig,
    refreshPlugins
  };
};
