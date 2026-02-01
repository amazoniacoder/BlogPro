import { useEffect } from 'react';
import websocketService from '../websocket-service';
import { FOOTER_EVENTS } from './footerEvents';
import type { FooterConfig } from '../../../../shared/types/footer';

interface FooterWebSocketCallbacks {
  onConfigUpdated?: (config: FooterConfig) => void;
  onPreviewUpdated?: (config: FooterConfig) => void;
  onBlockUpdated?: (blockId: string, blockData: any) => void;
}

export const useFooterWebSocket = (callbacks: FooterWebSocketCallbacks) => {
  const connected = websocketService.isConnected();

  useEffect(() => {
    if (!connected) return;

    const handleConfigUpdated = (data: any) => {
      callbacks.onConfigUpdated?.(data.config || data);
    };

    const handlePreviewUpdated = (data: any) => {
      callbacks.onPreviewUpdated?.(data.config || data);
    };

    const handleBlockUpdated = (data: any) => {
      callbacks.onBlockUpdated?.(data.blockId, data.blockData);
    };

    // Subscribe to footer events
    websocketService.subscribe(FOOTER_EVENTS.CONFIG_UPDATED, handleConfigUpdated);
    websocketService.subscribe(FOOTER_EVENTS.PREVIEW_UPDATED, handlePreviewUpdated);
    websocketService.subscribe(FOOTER_EVENTS.BLOCK_UPDATED, handleBlockUpdated);

    return () => {
      // Unsubscribe on cleanup
      websocketService.unsubscribe(FOOTER_EVENTS.CONFIG_UPDATED, handleConfigUpdated);
      websocketService.unsubscribe(FOOTER_EVENTS.PREVIEW_UPDATED, handlePreviewUpdated);
      websocketService.unsubscribe(FOOTER_EVENTS.BLOCK_UPDATED, handleBlockUpdated);
    };
  }, [connected, callbacks]);

  return { connected };
};