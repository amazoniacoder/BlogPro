/**
 * Notification Manager
 * Centralized notification management system with modal and toast support
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import UnifiedNotification, { NotificationProps } from './UnifiedNotification';

interface NotificationItem extends NotificationProps {
  id: string;
}

interface NotificationContextType {
  showSuccess: (message: string, title?: string, modal?: boolean) => void;
  showError: (message: string, title?: string, modal?: boolean) => void;
  showWarning: (message: string, title?: string, modal?: boolean) => void;
  showInfo: (message: string, title?: string, modal?: boolean) => void;
  hideNotification: (id: string) => void;
  // Convenience methods for specific use cases
  showModalSuccess: (message: string, title?: string) => void;
  showModalError: (message: string, title?: string) => void;
  showToastSuccess: (message: string, title?: string) => void;
  showToastError: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { t } = useTranslation(['common', 'errors']);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => {
      // For modal notifications, replace existing ones
      if (notification.modal) {
        return [newNotification];
      }
      // For toast notifications, stack them (max 3)
      return [...prev.filter(n => !n.modal), newNotification].slice(-3);
    });
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, title?: string, modal = false) => {
    addNotification({
      type: 'success',
      message,
      title: title || t('common:success', { defaultValue: 'Успешно' }),
      modal,
      duration: modal ? 0 : 4000, // Modal notifications don't auto-close
      autoClose: !modal,
      onClose: () => removeNotification
    });
  }, [addNotification, removeNotification, t]);

  const showError = useCallback((message: string, title?: string, modal = false) => {
    addNotification({
      type: 'error',
      message,
      title: title || t('errors:error', { defaultValue: 'Ошибка' }),
      modal,
      duration: modal ? 0 : 5000, // Errors stay longer
      autoClose: !modal,
      onClose: () => removeNotification
    });
  }, [addNotification, removeNotification, t]);

  const showWarning = useCallback((message: string, title?: string, modal = false) => {
    addNotification({
      type: 'warning',
      message,
      title: title || t('common:warning', { defaultValue: 'Предупреждение' }),
      modal,
      duration: modal ? 0 : 4000,
      autoClose: !modal,
      onClose: () => removeNotification
    });
  }, [addNotification, removeNotification, t]);

  const showInfo = useCallback((message: string, title?: string, modal = false) => {
    addNotification({
      type: 'info',
      message,
      title: title || t('common:info', { defaultValue: 'Информация' }),
      modal,
      duration: modal ? 0 : 3000,
      autoClose: !modal,
      onClose: () => removeNotification
    });
  }, [addNotification, removeNotification, t]);

  // Convenience methods
  const showModalSuccess = useCallback((message: string, title?: string) => {
    showSuccess(message, title, true);
  }, [showSuccess]);

  const showModalError = useCallback((message: string, title?: string) => {
    showError(message, title, true);
  }, [showError]);

  const showToastSuccess = useCallback((message: string, title?: string) => {
    showSuccess(message, title, false);
  }, [showSuccess]);

  const showToastError = useCallback((message: string, title?: string) => {
    showError(message, title, false);
  }, [showError]);

  const contextValue: NotificationContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification: removeNotification,
    showModalSuccess,
    showModalError,
    showToastSuccess,
    showToastError
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render notifications */}
      {notifications.map((notification) => (
        <UnifiedNotification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
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

// Global notification functions for use outside React components
let globalNotificationContext: NotificationContextType | null = null;

export const setGlobalNotificationContext = (context: NotificationContextType) => {
  globalNotificationContext = context;
};

export const showSuccessNotification = (message: string, title?: string, modal = false) => {
  if (globalNotificationContext) {
    globalNotificationContext.showSuccess(message, title, modal);
  } else {
    console.log('Success:', title, message);
  }
};

export const showErrorNotification = (message: string, title?: string, modal = false) => {
  if (globalNotificationContext) {
    globalNotificationContext.showError(message, title, modal);
  } else {
    console.log('Error:', title, message);
  }
};

// Hook to register global context
export const useGlobalNotifications = () => {
  const context = useNotifications();
  
  React.useEffect(() => {
    setGlobalNotificationContext(context);
    return () => setGlobalNotificationContext(null);
  }, [context]);
  
  return context;
};