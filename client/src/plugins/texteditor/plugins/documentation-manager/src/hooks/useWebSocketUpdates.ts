/**
 * WebSocket Updates Hook
 * Real-time collaboration and content locking
 * Max 200 lines - strict TypeScript compliance
 */

import { useState, useEffect, useCallback } from 'react';
import { ContentLock } from '../types/SharedTypes';

interface WebSocketUpdateData {
  readonly contentId: string;
  readonly content?: string;
  readonly lock?: ContentLock;
  readonly userId?: string;
  readonly userName?: string;
}

interface UseWebSocketUpdatesReturn {
  readonly contentLocks: Map<string, ContentLock>;
  readonly lockContent: (contentId: string) => Promise<void>;
  readonly unlockContent: (contentId: string) => Promise<void>;
  readonly updateContent: (contentId: string, content: string) => void;
}

/**
 * Hook for managing real-time WebSocket updates and content locking
 */
export const useWebSocketUpdates = (libraryType: string): UseWebSocketUpdatesReturn => {
  const [contentLocks, setContentLocks] = useState<Map<string, ContentLock>>(new Map());
  const [socket, setSocket] = useState<WebSocket | null>(null);

  /**
   * Get current user info from token
   */
  const getCurrentUser = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId || 'anonymous',
        userName: payload.username || 'Anonymous User'
      };
    } catch {
      return null;
    }
  }, []);

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    // Create WebSocket connection
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/documentation`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected for documentation updates');
        setSocket(ws);
        
        // Join library room
        ws.send(JSON.stringify({
          type: 'join_library',
          libraryType,
          userId: user.userId,
          userName: user.userName
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketUpdateData & { type: string } = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [libraryType, getCurrentUser]);

  /**
   * Handle incoming WebSocket messages
   */
  const handleWebSocketMessage = useCallback((data: WebSocketUpdateData & { type: string }) => {
    switch (data.type) {
      case 'content_updated':
        if (data.contentId && data.content) {
          updateContentInDOM(data.contentId, data.content);
        }
        break;

      case 'content_locked':
        if (data.contentId && data.lock) {
          setContentLocks(prev => new Map(prev.set(data.contentId, data.lock!)));
        }
        break;

      case 'content_unlocked':
        if (data.contentId) {
          setContentLocks(prev => {
            const newMap = new Map(prev);
            newMap.delete(data.contentId);
            return newMap;
          });
        }
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);

  /**
   * Update content in DOM
   */
  const updateContentInDOM = useCallback((contentId: string, content: string) => {
    const element = document.querySelector(`[data-content-id="${contentId}"] .content-section__body`);
    if (element) {
      element.innerHTML = content;
      
      // Show update notification
      showUpdateNotification('Content updated by another user');
    }
  }, []);

  /**
   * Show update notification
   */
  const showUpdateNotification = useCallback((message: string) => {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'websocket-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 10000;
      font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }, []);

  /**
   * Lock content for editing
   */
  const lockContent = useCallback(async (contentId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user || !socket) return;

    socket.send(JSON.stringify({
      type: 'lock_content',
      contentId,
      userId: user.userId,
      userName: user.userName,
      libraryType
    }));
  }, [socket, libraryType, getCurrentUser]);

  /**
   * Unlock content after editing
   */
  const unlockContent = useCallback(async (contentId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user || !socket) return;

    socket.send(JSON.stringify({
      type: 'unlock_content',
      contentId,
      userId: user.userId,
      libraryType
    }));
  }, [socket, libraryType, getCurrentUser]);

  /**
   * Broadcast content update
   */
  const updateContent = useCallback((contentId: string, content: string): void => {
    const user = getCurrentUser();
    if (!user || !socket) return;

    socket.send(JSON.stringify({
      type: 'update_content',
      contentId,
      content,
      userId: user.userId,
      userName: user.userName,
      libraryType
    }));
  }, [socket, libraryType, getCurrentUser]);

  return {
    contentLocks,
    lockContent,
    unlockContent,
    updateContent
  };
};
