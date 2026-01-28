/**
 * Unified Notification Component
 * Centralized notification system with consistent styling
 */

import React, { useEffect, useState } from 'react';
import { Icon } from '../../icons/components';

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  autoClose?: boolean;
}

export const UnifiedNotification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  autoClose = true
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, autoClose, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check';
      case 'error': return 'x';
      case 'warning': return 'alert-circle';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  return (
    <div className={`notification notification--${type} ${isVisible ? 'notification--visible' : 'notification--hidden'}`}>
      <div className="notification__content">
        <div className="notification__icon">
          <Icon name={getIcon()} size={20} />
        </div>
        <div className="notification__text">
          {title && <div className="notification__title">{title}</div>}
          <div className="notification__message">{message}</div>
        </div>
        <button 
          className="notification__close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
};

export default UnifiedNotification;