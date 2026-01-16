import React, { createContext, useContext, ReactNode } from 'react';

interface ErrorHandler {
  reportError: (error: Error, context?: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorHandler | null>(null);

interface ErrorProviderProps {
  children: ReactNode;
  onError?: (error: Error, context?: string) => void;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children, onError }) => {
  const errorHandler: ErrorHandler = {
    reportError: (error: Error, context?: string) => {

      onError?.(error, context);
    },
    clearErrors: () => {
      // Implementation for clearing errors
    }
  };

  return (
    <ErrorContext.Provider value={errorHandler}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorHandler = (): ErrorHandler => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorProvider');
  }
  return context;
};
