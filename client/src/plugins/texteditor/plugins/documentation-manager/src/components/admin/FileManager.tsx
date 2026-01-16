import { Icon } from '../../../../../../../ui-system/icons/components';
/**
 * File Manager
 * 
 * Component for managing file system integration with /docs directory.
 */

import React, { useState, useEffect } from 'react';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  fileType?: string;
  size?: number;
  children?: FileNode[];
}

interface FileContent {
  filepath: string;
  content: string;
  metadata: {
    size: number;
    lastModified: string;
    type: string;
  };
}

export const FileManager: React.FC = () => {
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadFileTree();
  }, []);

  const loadFileTree = async () => {
    try {
      const response = await fetch('/api/documentation/filesystem/tree');
      const data = await response.json();
      setFileTree(data);
    } catch (error) {
      console.error('Failed to load file tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (filepath: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documentation/filesystem/file/${encodeURIComponent(filepath)}`);
      const data = await response.json();
      setFileContent(data);
      setSelectedFile(filepath);
    } catch (error) {
      console.error('Failed to load file content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFileContent = async (filepath: string, content: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/documentation/filesystem/file/${encodeURIComponent(filepath)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        setFileContent(prev => prev ? { ...prev, content } : null);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Failed to save file:', error);
    } finally {
      setSaving(false);
    }
  };

  const scanDirectory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documentation/filesystem/scan');
      const data = await response.json();
      
      if (response.ok) {
        await loadFileTree();
        alert(`Scan completed! Found ${data.filesFound} files.`);
      }
    } catch (error) {
      console.error('Failed to scan directory:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncWithDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documentation/filesystem/sync', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        alert(`Sync completed! Synchronized ${data.syncedFiles} files.`);
      }
    } catch (error) {
      console.error('Failed to sync with database:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFileTree = (node: FileNode, level = 0) => {
    const [isExpanded, setIsExpanded] = useState(level < 2);
    
    return (
      <div key={node.path} className="file-tree-node" style={{ marginLeft: `${level * 20}px` }}>
        <div 
          className={`file-tree-node__header ${selectedFile === node.path ? 'selected' : ''}`}
          onClick={() => {
            if (node.type === 'directory') {
              setIsExpanded(!isExpanded);
            } else {
              loadFileContent(node.path);
            }
          }}
        >
          <span className="file-tree-node__icon">
            {node.type === 'directory' 
              ? (isExpanded ? '📂' : '📁')
              : getFileIcon(node.fileType || '')
            }
          </span>
          <span className="file-tree-node__name">{node.name}</span>
          {node.type === 'file' && node.size && (
            <span className="file-tree-node__size">({formatFileSize(node.size)})</span>
          )}
        </div>
        
        {node.type === 'directory' && isExpanded && node.children && (
          <div className="file-tree-node__children">
            {node.children.map(child => renderFileTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'md': return '📝';
      case 'txt': return '📄';
      case 'html': return '🌐';
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !fileTree) {
    return <div className="loading">Loading file system...</div>;
  }

  return (
    <div className="file-manager">
      <div className="file-manager__header">
        <h1>📂 File System Manager</h1>
        <div className="file-manager__actions">
          <button onClick={scanDirectory} className="btn btn--secondary" disabled={loading}>
            🔄 Scan Directory
          </button>
          <button onClick={syncWithDatabase} className="btn btn--secondary" disabled={loading}>
            <Icon name="save" size={16} /> Sync Database
          </button>
        </div>
      </div>

      <div className="file-manager__content">
        <div className="file-manager__sidebar">
          <div className="file-tree">
            <div className="file-tree__header">
              <h3>📁 /docs Directory</h3>
            </div>
            {fileTree ? (
              renderFileTree(fileTree)
            ) : (
              <div className="empty-state">
                <p>No files found. Click "Scan Directory" to refresh.</p>
              </div>
            )}
          </div>
        </div>

        <div className="file-manager__main">
          {fileContent ? (
            <div className="file-editor">
              <div className="file-editor__header">
                <div className="file-info">
                  <h3>📝 {selectedFile}</h3>
                  <div className="file-meta">
                    <span>Size: {formatFileSize(fileContent.metadata.size)}</span>
                    <span>Modified: {new Date(fileContent.metadata.lastModified).toLocaleString()}</span>
                    <span>Type: {fileContent.metadata.type}</span>
                  </div>
                </div>
                
                <div className="file-actions">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => saveFileContent(selectedFile!, fileContent.content)}
                        className="btn btn--primary"
                        disabled={saving}
                      >
                        {saving ? '<Icon name="save" size={16} /> Saving...' : '<Icon name="save" size={16} /> Save'}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="btn btn--secondary"
                      >
                        <Icon name="arrow-left" size={16} /> Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="btn btn--primary"
                    >
                      <Icon name="edit" size={16} /> Edit
                    </button>
                  )}
                </div>
              </div>
              
              <div className="file-editor__content">
                {editMode ? (
                  <textarea
                    value={fileContent.content}
                    onChange={(e) => setFileContent({ ...fileContent, content: e.target.value })}
                    className="file-editor__textarea"
                  />
                ) : (
                  <pre className="file-editor__preview">{fileContent.content}</pre>
                )}
              </div>
            </div>
          ) : (
            <div className="file-editor-placeholder">
              <div className="placeholder-content">
                <h3>📄 Select a file to view or edit</h3>
                <p>Choose a file from the directory tree to view its contents.</p>
                <div className="supported-formats">
                  <h4>Supported formats:</h4>
                  <ul>
                    <li>📝 Markdown (.md)</li>
                    <li>📄 Text (.txt)</li>
                    <li>🌐 HTML (.html)</li>
                    <li>📕 PDF (.pdf) - View only</li>
                    <li>📘 Word (.doc, .docx) - View only</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
