import React from 'react';

interface PluginErrorBoundaryProps {
  readonly children: React.ReactNode;
  readonly pluginName: string;
  readonly onPluginError?: (pluginName: string, error: Error) => void;
  readonly fallback?: React.ReactNode;
}

interface PluginErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class PluginErrorBoundary extends React.Component<
  PluginErrorBoundaryProps, 
  PluginErrorBoundaryState
> {
  constructor(props: PluginErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PluginErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    this.props.onPluginError?.(this.props.pluginName, error);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="plugin-error">
          <span>Plugin {this.props.pluginName} failed</span>
          <button onClick={this.handleReset} className="plugin-retry">
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
