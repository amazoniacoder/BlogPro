/**
 * BlogPro Toast Provider
 * Context provider for toast notification management
 */

import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import Toast, { ToastProps } from './Toast';
import { translateToastMessage } from '../../../utils/toast-translations';

interface ToastItem extends ToastProps {
  id: number;
}

export interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info', duration = 3000) => {
    const id = Date.now();
    const translatedMessage = translateToastMessage(message);
    setToasts(prev => [...prev, { id, children: translatedMessage, variant: type, duration, onClose: () => removeToast(id) }]);
  }, [removeToast]);

  const showSuccess = useCallback((message: string, duration = 3000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration = 3000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration = 3000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            duration={toast.duration}
            onClose={toast.onClose}
          >
            {toast.children}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
