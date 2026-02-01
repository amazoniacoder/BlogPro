import { useState, useEffect } from 'react';
import type { FooterConfig } from '../../../shared/types/footer';

import { footerApi } from '../services/api/footer';
import { useFooterWebSocket } from '../services/websocket/useFooterWebSocket';

export const useFooterEditor = () => {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // WebSocket integration
  useFooterWebSocket({
    onConfigUpdated: (updatedConfig) => {
      setConfig(updatedConfig);
    },
    onPreviewUpdated: () => {
      // Handle preview updates
    }
  });

  const saveConfig = async () => {
    if (!config) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = config.id 
        ? await footerApi.updateConfig(config.id, config)
        : await footerApi.createConfig(config);

      setConfig(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка сохранения конфигурации';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const previewConfig = async () => {
    if (!config) return;
    
    try {
      await footerApi.previewConfig(config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка предварительного просмотра';
      setError(errorMessage);
      throw err;
    }
  };

  const loadConfig = async (configId?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = configId 
        ? await footerApi.getAllConfigs().then(configs => configs.find(c => c.id === configId))
        : await footerApi.getActiveConfig();
        
      if (!result) {
        // Создаем дефолтную конфигурацию если не найдена
        const defaultConfig: FooterConfig = {
          version: 1,
          isActive: true,
          layout: {
            type: 'grid',
            columns: 3,
            gap: '2rem',
            maxWidth: '1200px'
          },
          blocks: [],
          styles: {
            theme: 'light',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            linkColor: '#0066cc',
            borderColor: '#e0e0e0',
            padding: '2rem',
            margin: '0'
          },
          responsive: {
            mobile: {},
            tablet: {}
          },
          visibility: {
            showOnScroll: false,
            hideOnPages: [],
            showOnlyOnPages: []
          }
        };
        setConfig(defaultConfig);
        return;
      }
      
      setConfig(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки конфигурации';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConfig = async (configId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await footerApi.deleteConfig(configId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления конфигурации';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    setConfig,
    saveConfig,
    previewConfig,
    loadConfig,
    deleteConfig,
    isLoading,
    error
  };
};