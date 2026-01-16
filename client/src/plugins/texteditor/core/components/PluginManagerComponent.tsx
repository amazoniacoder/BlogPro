/**
 * Plugin Manager Component
 * 
 * Handles plugin initialization and management UI.
 */

import React, { useState, useEffect, useRef } from 'react';
import { PluginManager } from '../services/PluginManager';
import { PluginRegistry } from '../../plugins/core/PluginRegistry';
import { PluginErrorBoundary } from './boundaries/PluginErrorBoundary';
import { PluginStatusIndicator } from './PluginStatusIndicator';
import { PluginControlPanel } from './admin/PluginControlPanel';

// Plugin imports
import { 
  WordCountPlugin, 
  SpellCheckPlugin, 
  AutoSavePlugin, 
  PerformancePlugin, 
  DocumentationManagerPlugin,
  AnalyticsPlugin,
  SecurityPlugin 
} from '../../plugins/builtin';

export interface PluginManagerComponentProps {
  editorRef: React.RefObject<HTMLDivElement>;
  currentContent: string;
  onContentChange: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  userRole: string;
  spellCheckEnabled: boolean;
  onError: (error: string) => void;
}

export const PluginManagerComponent: React.FC<PluginManagerComponentProps> = ({
  editorRef,
  currentContent,
  onContentChange,
  onSave,
  userRole,
  spellCheckEnabled,
  onError
}) => {
  const [showPluginPanel, setShowPluginPanel] = useState(false);
  const [pluginManager] = useState(() => new PluginManager(editorRef));
  const pluginsInitialized = useRef(false);

  // Initialize plugins
  useEffect(() => {
    const initializePlugins = async () => {
      if (pluginsInitialized.current) return;
      
      try {
        // Set editor instance for plugins
        PluginRegistry.setEditorInstance({
          getContent: () => editorRef.current?.innerHTML || '',
          setContent: onContentChange,
          insertText: (text: string) => {
            if (editorRef.current) {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(text));
                range.collapse(false);
              }
            }
          },
          getSelection: () => window.getSelection(),
          focus: () => editorRef.current?.focus() || undefined,
          getElement: () => editorRef.current,
          addEventListener: (event: string, handler: Function) => {
            editorRef.current?.addEventListener(event, handler as EventListener);
          },
          removeEventListener: (event: string, handler: Function) => {
            editorRef.current?.removeEventListener(event, handler as EventListener);
          }
        });

        // Register built-in plugins
        if (!PluginRegistry.isRegistered('word-count')) {
          PluginRegistry.register(new WordCountPlugin());
        }
        if (!PluginRegistry.isRegistered('spell-check')) {
          PluginRegistry.register(new SpellCheckPlugin());
        }
        if (!PluginRegistry.isRegistered('auto-save')) {
          PluginRegistry.register(new AutoSavePlugin());
        }
        if (!PluginRegistry.isRegistered('performance-monitor')) {
          PluginRegistry.register(new PerformancePlugin());
        }
        if (!PluginRegistry.isRegistered('documentation-manager')) {
          PluginRegistry.register(new DocumentationManagerPlugin());
        }
        if (!PluginRegistry.isRegistered('analytics')) {
          PluginRegistry.register(new AnalyticsPlugin());
        }
        if (!PluginRegistry.isRegistered('security')) {
          PluginRegistry.register(new SecurityPlugin());
        }

        // Initialize plugins
        await PluginRegistry.initialize('word-count', { 
          compact: true,
          showWords: true,
          showCharacters: true,
          showReadingTime: true,
          mountPoint: '.editor-footer-controls'
        });
        
        await PluginRegistry.initialize('spell-check', { 
          enabled: spellCheckEnabled,
          mountPoint: '.editor-footer-left'
        });
        
        // AutoSave for localStorage backup only (no database operations)
        await PluginRegistry.initialize('auto-save', { 
          onSave: async (content: string) => {
            // Only save to localStorage for backup, not database
            console.log('💿 AutoSave: Saving to localStorage backup only');
            localStorage.setItem('blog_editor_backup', JSON.stringify({
              content,
              timestamp: Date.now(),
              type: 'autosave_backup'
            }));
          },
          interval: 300000,
          enabled: true,
          mountPoint: '.editor-header-right'
        });

        await PluginRegistry.initialize('performance-monitor', { 
          userRole: userRole,
          mountPoint: '.editor-footer-controls',
          analyticsEnabled: false // Disable analytics to avoid 500 errors
        });
        
        await PluginRegistry.initialize('documentation-manager', {
          userRole: userRole,
          mountPoint: '.editor-footer-controls',
          enabled: true
        });
        
        // Initialize analytics plugin (admin only)
        await PluginRegistry.initialize('analytics', {
          userRole: userRole,
          mountPoint: '.editor-footer-controls',
          enabled: true
        });
        
        // Initialize security plugin (admin only)
        await PluginRegistry.initialize('security', {
          userRole: userRole,
          mountPoint: '.editor-footer-controls',
          enabled: true
        });

        pluginsInitialized.current = true;

      } catch (error) {
        onError(`Plugin system error: ${(error as Error).message}`);
      }
    };
    
    initializePlugins();
  }, [userRole, spellCheckEnabled, onSave, currentContent, onContentChange, editorRef, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pluginManager.destroy();
    };
  }, [pluginManager]);

  // Notify plugins of content changes
  useEffect(() => {
    try {
      pluginManager.onContentChange(currentContent);
    } catch (error) {
      // Plugin content change notification failed - non-critical
    }
  }, [currentContent, pluginManager]);

  return (
    <>
      {/* Plugin Status and Controls */}
      <PluginErrorBoundary pluginName="status-indicator" fallback={null}>
        <PluginStatusIndicator 
          className="plugin-status-indicator editor-plugin-status"
          showDetails={true}
        />
      </PluginErrorBoundary>
      
      <span className="debug-info">Role: {userRole}</span>
      
      <button 
        onClick={() => setShowPluginPanel(true)}
        className="plugin-control-button"
        title="Управление плагинами (Админ)"
      >
        Плагины
      </button>
      
      {/* Plugin Control Panel */}
      {showPluginPanel && (
        <div className="plugin-panel-overlay">
          <PluginControlPanel 
            userRole="admin"
            onClose={() => setShowPluginPanel(false)}
          />
        </div>
      )}
    </>
  );
};
