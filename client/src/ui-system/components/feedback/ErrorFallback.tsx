/**
 * BlogPro Error Fallback Component
 * Fallback UI for error boundaries
 */

import { useEffect } from 'react';
import { Button } from '../button';
import './error-fallback.css';

export interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
  className?: string;
}

export const ErrorFallback = ({ error, resetError, message, className = '' }: ErrorFallbackProps) => {
  useEffect(() => {
    if (error) {
      console.error('Error caught by fallback:', error);
    }
  }, [error]);

  return (
    <div className={`error-fallback ${className}`}>
      <div className="error-fallback__content">
        <h2 className="error-fallback__title">Oops! Something went wrong</h2>
        <p className="error-fallback__message">
          {message || 'An unexpected error occurred. Please try again.'}
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="error-fallback__details">
            <summary className="error-fallback__summary">Error details (development only)</summary>
            <pre className="error-fallback__stack">{error.message}</pre>
          </details>
        )}
        {resetError && (
          <Button onClick={resetError} variant="primary" className="error-fallback__button">
            Try again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
