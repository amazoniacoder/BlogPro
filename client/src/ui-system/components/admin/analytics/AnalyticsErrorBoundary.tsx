import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class AnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Analytics Error Boundary caught an error:', error, errorInfo);
    
    // Log error to analytics service for monitoring
    this.logError(error, errorInfo);
  }

  private logError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `error-${Date.now()}`,
          pagePath: '/admin/analytics/error',
          pageTitle: 'Analytics Error',
          referrer: window.location.pathname,
          errorMessage: error.message,
          errorStack: error.stack?.substring(0, 500),
          componentStack: errorInfo.componentStack?.substring(0, 500)
        })
      });
    } catch (trackingError) {
      console.error('Failed to log error to analytics:', trackingError);
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="admin-analytics__error-boundary">
          <div className="admin-analytics__error-content">
            <h3 className="admin-analytics__error-title">Analytics Error</h3>
            <p className="admin-analytics__error-message">
              Something went wrong while loading analytics data.
            </p>
            <details className="admin-analytics__error-details">
              <summary>Error Details</summary>
              <pre className="admin-analytics__error-stack">
                {this.state.error?.message}
              </pre>
            </details>
            <div className="admin-analytics__error-actions">
              <button 
                className="admin-button admin-button--primary"
                onClick={this.handleRetry}
              >
                Retry
              </button>
              <button 
                className="admin-button admin-button--secondary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AnalyticsErrorBoundary;
