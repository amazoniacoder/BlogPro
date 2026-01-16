/**
 * ContentEditableEditor (Refactored)
 * 
 * Clean, decomposed editor with proper separation of concerns.
 */

import React, { useState } from 'react';
import { EditorContainer } from './EditorContainer';
import { EditorErrorBoundary } from './boundaries/EditorErrorBoundary';
import { ErrorProvider } from './boundaries/ErrorContext';
import { useRealTimeUpdates } from '../../plugins/documentation-manager/src/hooks/useRealTimeUpdates';

export interface EditorProps {
  readonly initialContent?: string;
  readonly onChange?: (content: string) => void;
  readonly onSave?: (content: string) => Promise<void>;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly className?: string;
  readonly 'data-testid'?: string;
  readonly userRole?: string;
  readonly postId?: number; // Blog post ID for database integration
  readonly autoLoad?: boolean; // Auto-load content from database
}

export const ContentEditableEditor: React.FC<EditorProps> = (props) => {
  const [editorError, setEditorError] = useState<string | null>(null);
  const [hasRealTimeUpdates, setHasRealTimeUpdates] = useState(false);
  
  // Enable real-time updates for documentation content
  const { isConnected } = useRealTimeUpdates({
    onContentUpdate: (update) => {
      if (update.data.id === props.postId?.toString()) {
        setHasRealTimeUpdates(true);
        console.log('📄 Real-time content update received for current document');
      }
    },
    enabled: !!props.postId
  });
  
  return (
    <ErrorProvider onError={() => {}}>
      <EditorErrorBoundary onError={(error) => setEditorError(error.message)}>
        {/* Real-time update notification */}
        {hasRealTimeUpdates && (
          <div className="editor-realtime-notification">
            <span>📡</span>
            <p>This document was updated by another user.</p>
            <button onClick={() => setHasRealTimeUpdates(false)}>Dismiss</button>
            <button onClick={() => window.location.reload()}>Reload</button>
          </div>
        )}
        
        {/* WebSocket connection status */}
        {props.postId && (
          <div className={`editor-connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span>{isConnected ? '🟢' : '🔴'}</span>
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        )}
        
        {editorError && (
          <div className="editor-critical-error">
            <p>Critical editor error: {editorError}</p>
            <button onClick={() => setEditorError(null)}>Reset Editor</button>
          </div>
        )}
        <EditorContainer {...props} />
      </EditorErrorBoundary>
    </ErrorProvider>
  );
};
