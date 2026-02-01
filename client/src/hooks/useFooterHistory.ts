import { useState, useEffect } from 'react';
import type { FooterHistory } from '../../../shared/types/footer';

const API_BASE = '/api';

export const useFooterHistory = (configId?: number) => {
  const [history, setHistory] = useState<FooterHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!configId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/footer-history/${configId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setHistory(result.data);
      } else {
        throw new Error(result.message || 'Ошибка загрузки истории');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки истории';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToHistory = async (configId: number, config: any, changeDescription: string) => {
    try {
      const response = await fetch(`${API_BASE}/footer-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          footerConfigId: configId,
          config,
          changeDescription
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Обновляем локальную историю
        await loadHistory();
      } else {
        throw new Error(result.message || 'Ошибка сохранения в историю');
      }
    } catch (err) {
      console.error('Error saving to history:', err);
    }
  };

  const deleteHistoryItem = async (historyId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/footer-history/${historyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Обновляем локальную историю
        setHistory(prev => prev.filter(item => item.id !== historyId));
      } else {
        throw new Error(result.message || 'Ошибка удаления записи истории');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления записи истории';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!configId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/footer-history/clear/${configId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setHistory([]);
      } else {
        throw new Error(result.message || 'Ошибка очистки истории');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка очистки истории';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (configId) {
      loadHistory();
    }
  }, [configId]);

  return {
    history,
    isLoading,
    error,
    loadHistory,
    saveToHistory,
    deleteHistoryItem,
    clearHistory
  };
};