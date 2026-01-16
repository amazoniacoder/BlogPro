/**
 * BlogPro Update Notification Component
 * Component to display notifications for content updates
 */

import React, { useState, useEffect } from 'react';
import websocketService from '../../../services/websocket-service';
import { Icon } from '../../icons/components';
import './update-notification.css';

export interface UpdateNotificationProps {
  className?: string;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ className = '' }) => {
  const [notification, setNotification] = useState<{
    type: string;
    message: string;
  } | null>(null);
  
  useEffect(() => {
    // Handle blog updates
    const handleBlogCreated = (data: any) => {
      setNotification({
        type: 'blog_created',
        message: `New article: ${data.title}`
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };
    
    const handleBlogUpdated = (data: any) => {
      setNotification({
        type: 'blog_updated',
        message: `Article updated: ${data.title}`
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };
    
    // Subscribe to WebSocket events
    websocketService.subscribe('blog_created', handleBlogCreated);
    websocketService.subscribe('blog_updated', handleBlogUpdated);
    
    // Clean up subscriptions
    return () => {
      websocketService.unsubscribe('blog_created', handleBlogCreated);
      websocketService.unsubscribe('blog_updated', handleBlogUpdated);
    };
  }, []);
  
  if (!notification) return null;
  
  return (
    <div className={`update-notification update-notification--${notification.type} ${className}`}>
      <div className="update-notification__content">
        <span className="update-notification__message">{notification.message}</span>
        <button 
          className="update-notification__close"
          onClick={() => setNotification(null)}
          aria-label="Close notification"
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;
