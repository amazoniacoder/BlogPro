import { Icon } from '../../../../../../../../ui-system/icons/components';
/**
 * File Explorer Component
 * Directory tree navigation with file operations
 * Max 400 lines, strict TypeScript compliance
 */

import React, { useState, useCallback } from 'react';
import { DirectoryStructure, DirectoryNode, DocumentFile } from '../types/Documentation';
import { FileTemplate } from '../types/FileSystem';

interface FileExplorerProps {
  readonly directoryStructure: DirectoryStructure | null;
  readonly onFileSelect: (filePath: string) => void;
  readonly onFileCreate: (dirPath: string, fileName: string, template?: string) => void;
  readonly onRefresh: () => void;
}

interface ExplorerState {
  readonly expandedDirs: Set<string>;
  readonly selectedPath: string | null;
  readonly showCreateDialog: boolean;
  readonly createDialogPath: string | null;
}

interface CreateFileDialogProps {
  readonly dirPath: string;
  readonly onConfirm: (fileName: string, template?: string) => void;
  readonly onCancel: () => void;
}

const CreateFileDialog: React.FC<CreateFileDialogProps> = ({ dirPath, onConfirm, onCancel }) => {
  const [fileName, setFileName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const templates: FileTemplate[] = [
    { name: 'HTML Page', extension: '.html', content: '', description: 'HTML documentation page', category: 'html' },
    { name: 'Markdown Guide', extension: '.md', content: '', description: 'Markdown documentation', category: 'markdown' },
    { name: 'JSON Config', extension: '.json', content: '', description: 'JSON configuration file', category: 'json' }
  ];

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim()) {
      const template = templates.find(t => t.name === selectedTemplate);
      onConfirm(fileName.trim(), template?.content);
    }
  }, [fileName, selectedTemplate, onConfirm, templates]);

  return (
    <div className="create-file-dialog">
      <div className="dialog-backdrop" onClick={onCancel} />
      <div className="dialog-content">
        <h3>Create New File</h3>
        <p>Directory: {dirPath}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fileName">File Name:</label>
            <input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="example.md"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="template">Template:</label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">No template</option>
              {templates.map(template => (
                <option key={template.name} value={template.name}>
                  {template.name} ({template.extension})
                </option>
              ))}
            </select>
          </div>
          
          <div className="dialog-actions">
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" disabled={!fileName.trim()}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  directoryStructure,
  onFileSelect,
  onFileCreate,
  onRefresh
}) => {
  const [state, setState] = useState<ExplorerState>({
    expandedDirs: new Set(['/docs']),
    selectedPath: null,
    showCreateDialog: false,
    createDialogPath: null
  });

  /**
   * Toggle directory expansion
   */
  const toggleDirectory = useCallback((dirPath: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedDirs);
      if (newExpanded.has(dirPath)) {
        newExpanded.delete(dirPath);
      } else {
        newExpanded.add(dirPath);
      }
      return { ...prev, expandedDirs: newExpanded };
    });
  }, []);

  /**
   * Handle file selection
   */
  const handleFileClick = useCallback((file: DocumentFile) => {
    setState(prev => ({ ...prev, selectedPath: file.path }));
    onFileSelect(file.path);
  }, [onFileSelect]);

  /**
   * Show create file dialog
   */
  const showCreateDialog = useCallback((dirPath: string) => {
    setState(prev => ({
      ...prev,
      showCreateDialog: true,
      createDialogPath: dirPath
    }));
  }, []);

  /**
   * Hide create file dialog
   */
  const hideCreateDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      showCreateDialog: false,
      createDialogPath: null
    }));
  }, []);

  /**
   * Handle file creation
   */
  const handleFileCreate = useCallback((fileName: string, template?: string) => {
    if (state.createDialogPath) {
      onFileCreate(state.createDialogPath, fileName, template);
      hideCreateDialog();
    }
  }, [state.createDialogPath, onFileCreate, hideCreateDialog]);

  /**
   * Get file icon based on type
   */
  const getFileIcon = useCallback((file: DocumentFile): string => {
    switch (file.type) {
      case 'html': return '🌐';
      case 'markdown': return '📝';
      case 'json': return '📋';
      case 'css': return '🎨';
      case 'javascript':
      case 'typescript': return '⚡';
      case 'image': return '<Icon name="image" size={16} />';
      default: return '📄';
    }
  }, []);

  /**
   * Format file size
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  /**
   * Render directory node recursively
   */
  const renderDirectoryNode = useCallback((node: DirectoryNode, level: number = 0): React.ReactNode => {
    const isExpanded = state.expandedDirs.has(node.path);
    const indent = level * 20;

    return (
      <div key={node.path} className="directory-node">
        <div
          className="directory-header"
          style={{ paddingLeft: `${indent}px` }}
          onClick={() => toggleDirectory(node.path)}
        >
          <span className="expand-icon">
            {isExpanded ? '📂' : '📁'}
          </span>
          <span className="directory-name">{node.name}</span>
          <button
            className="create-file-btn"
            onClick={(e) => {
              e.stopPropagation();
              showCreateDialog(node.path);
            }}
            title="Create new file"
          >
            <Icon name="add" size={16} />
          </button>
        </div>

        {isExpanded && (
          <div className="directory-content">
            {/* Render files */}
            {node.files?.map(file => (
              <div
                key={file.path}
                className={`file-item ${state.selectedPath === file.path ? 'selected' : ''}`}
                style={{ paddingLeft: `${indent + 20}px` }}
                onClick={() => handleFileClick(file)}
              >
                <span className="file-icon">{getFileIcon(file)}</span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
                {!file.isEditable && <span className="readonly-badge">RO</span>}
              </div>
            ))}

            {/* Render subdirectories */}
            {node.children?.map(child => renderDirectoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [state.expandedDirs, state.selectedPath, toggleDirectory, showCreateDialog, handleFileClick, getFileIcon, formatFileSize]);

  if (!directoryStructure) {
    return (
      <div className="file-explorer loading">
        <div className="loading-message">Loading directory structure...</div>
      </div>
    );
  }

  return (
    <div className="file-explorer">
      {/* Toolbar */}
      <div className="explorer-toolbar">
        <h3>📁 Documentation Files</h3>
        <div className="toolbar-actions">
          <button onClick={onRefresh} title="Refresh directory">
            🔄 Refresh
          </button>
          <button
            onClick={() => showCreateDialog(directoryStructure.root.path)}
            title="Create new file in root"
          >
            <Icon name="add" size={16} /> New File
          </button>
        </div>
      </div>

      {/* Directory Tree */}
      <div className="directory-tree">
        {renderDirectoryNode(directoryStructure.root)}
      </div>

      {/* Statistics */}
      <div className="explorer-stats">
        <div className="stat-item">
          <span className="stat-label">Total Files:</span>
          <span className="stat-value">{directoryStructure.totalFiles}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Supported:</span>
          <span className="stat-value">{directoryStructure.supportedFiles}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Directories:</span>
          <span className="stat-value">{directoryStructure.totalDirectories}</span>
        </div>
      </div>

      {/* Create File Dialog */}
      {state.showCreateDialog && state.createDialogPath && (
        <CreateFileDialog
          dirPath={state.createDialogPath}
          onConfirm={handleFileCreate}
          onCancel={hideCreateDialog}
        />
      )}
    </div>
  );
};
