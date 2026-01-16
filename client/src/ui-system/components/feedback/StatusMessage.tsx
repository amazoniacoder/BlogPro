/**
 * BlogPro Status Message Component
 * Fixed position status messages for notifications
 */

import React, { useEffect } from 'react';

export interface StatusMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
  className?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  type,
  message,
  onDismiss,
  autoHide = true,
  duration = 5000,
  className = ''
}) => {
  useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  const statusClasses = [
    'status-message',
    `status-message--${type}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={statusClasses}>
      <div className="status-message__content">
        <div className="status-message__text">{message}</div>
        {onDismiss && (
          <button
            className="status-message__dismiss text-base"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusMessage;
