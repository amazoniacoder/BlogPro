/**
 * BlogPro Error Display Component
 * Reusable component for displaying errors consistently
 */

import React from 'react';
import { Icon } from '../../icons/components';
import './error-display.css';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ErrorDisplayProps {
  error: ApiError | null;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onDismiss,
  className = ''
}) => {
  if (!error) return null;

  return (
    <div className={`error-display ${className}`}>
      <div className="error-display__content">
        <div className="error-display__icon">
          <Icon name="alert-circle" size={24} />
        </div>
        <div className="error-display__message">
          <h4 className="error-display__title">{error.code || 'Error'}</h4>
          <p className="error-display__text">{error.message}</p>
        </div>
        {onDismiss && (
          <button className="error-display__dismiss" onClick={onDismiss}>
            <Icon name="x" size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
