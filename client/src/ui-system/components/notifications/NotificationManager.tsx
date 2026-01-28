/**
 * Notification Manager
 * Centralized notification management system
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import UnifiedNotification, { NotificationProps } from './UnifiedNotification';

interface NotificationItem extends NotificationProps {
  id: string;
}

interface NotificationContextType {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { t } = useTranslation(['common', 'errors']);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    addNotification({
      type: 'success',
      message,
      title: title || t('common:success', { defaultValue: 'Успешно' }),
      onClose: () => removeNotification
    });
  }, [addNotification, removeNotification, t]);

  const showError = useCallback((message: string, title?: string) => {
    addNotification({
      type: 'error',
      message,
      title: title || t('errors:error', { defaultValue: 'Ошибка' }),
      onClose: () => removeNotification
    });
  }, [addNotification, removeNotification, t]);

  const showWarning = useCallback((message: string, title?: string) => {
    addNotification({
      type: 'warning',
      message,
      title: title || t('common:warning', { defaultValue: 'Предупреждение' }),
      onClose: () => removeNotification
    });
  }, [addNotification, removeNotification, t]);

  const showInfo = useCallback((message: string, title?: string) => {
    addNotification({
      type: 'info',
      message,
      title: title || t('common:info', { defaultValue: 'Информация' }),
      onClose: () => removeNotification
    });
  }, [addNotification, removeNotification, t]);

  const contextValue: NotificationContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification: removeNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render notifications */}
      {notifications.map((notification) => (
        <React.Fragment key={notification.id}>
          {/* Overlay for modal effect */}
          <div className="notification-overlay notification-overlay--visible" />
          
          <UnifiedNotification
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        </React.Fragment>
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Convenience functions for direct use
export const showSuccessNotification = (message: string, title?: string) => {
  // This will be implemented as a global function
  console.log('Success:', title, message);
};

export const showErrorNotification = (message: string, title?: string) => {
  // This will be implemented as a global function
  console.log('Error:', title, message);
};