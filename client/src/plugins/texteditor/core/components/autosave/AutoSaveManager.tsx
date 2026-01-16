import React, { useEffect, useRef, useState } from 'react';
import AutoSaveIndicator, { AutoSaveStatus } from '../AutoSaveIndicator';
import './AutoSaveManager.css';

interface AutoSaveManagerProps {
  content: string;
  onSave?: (content: string) => Promise<void>;
  interval?: number;
  className?: string;
  postId?: number; // Blog post ID for database saving
  postMetadata?: {
    title?: string;
    description?: string;
    status?: 'draft' | 'published';
  };
}

export const AutoSaveManager: React.FC<AutoSaveManagerProps> = ({
  content,
  onSave,
  interval = 300000,
  className = '',
  postId,
  postMetadata
}) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>({ status: 'idle' });
  const autoSaveService = useRef<any>(null);

  useEffect(() => {
    const initializeAutoSave = async () => {
      try {
        // Create auto-save service with blog post integration
        const serviceClass = await import('../../services/AutoSaveService');
        
        // Create save callback that uses BlogContentSaveService if no custom onSave provided
        const saveCallback = onSave || (async (content: string) => {
          const { BlogContentSaveService } = await import('../../services/BlogContentSaveService');
          const saveService = new BlogContentSaveService(postId);
          await saveService.saveContent(content, postMetadata);
        });
        
        autoSaveService.current = new serviceClass.AutoSaveService(saveCallback, postId);
        
        // Set blog post metadata if available
        if (postId && autoSaveService.current.setBlogPostId) {
          autoSaveService.current.setBlogPostId(postId);
        }
        
        if (postMetadata?.status && autoSaveService.current.setPublished) {
          autoSaveService.current.setPublished(postMetadata.status === 'published');
        }
        
        // Set up status change listener
        const unsubscribe = autoSaveService.current.onStatusChange(setAutoSaveStatus);
        
        // Initialize with current content
        autoSaveService.current.initialize(content);
        
        return () => {
          unsubscribe();
          autoSaveService.current?.dispose();
        };
      } catch (error) {
        console.error('Failed to initialize auto-save service:', error);
      }
    };
    
    initializeAutoSave();
  }, [interval, onSave]);

  // Auto-save on content changes
  useEffect(() => {
    if (autoSaveService.current && content) {
      autoSaveService.current.updateContent(content);
    }
  }, [content]);
  const handleResolveConflict = async (resolution: 'local' | 'server' | 'merge') => {
    if (autoSaveService.current && autoSaveService.current.resolveConflict) {
      await autoSaveService.current.resolveConflict(resolution);
    }
  };

  return (
    <div className={`auto-save-manager ${className}`}>
      <AutoSaveIndicator
        status={autoSaveStatus}
        onResolveConflict={handleResolveConflict}
        saveInterval={interval}
        className="auto-save-manager__indicator"
      />
    </div>
  );
};
