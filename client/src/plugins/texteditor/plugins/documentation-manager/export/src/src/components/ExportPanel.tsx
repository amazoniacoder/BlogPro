/**
 * Export Panel Component
 * Multi-format export with AI Assistant integration
 * Max 400 lines, strict TypeScript compliance
 */

import React, { useState, useCallback } from 'react';
import { DocumentFile, DirectoryStructure, ExportFormat, ExportOptions } from '../types/Documentation';

interface ExportPanelProps {
  readonly selectedFile: DocumentFile | null;
  readonly directoryStructure: DirectoryStructure | null;
}

interface ExportState {
  readonly selectedFormat: string;
  readonly exportOptions: ExportOptions;
  readonly isExporting: boolean;
  readonly showAIMenu: boolean;
  readonly exportResults: ExportResult[];
}

interface ExportResult {
  readonly fileName: string;
  readonly format: string;
  readonly success: boolean;
  readonly size: number;
  readonly downloadUrl?: string;
  readonly error?: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  selectedFile,
  directoryStructure
}) => {
  const [state, setState] = useState<ExportState>({
    selectedFormat: 'markdown',
    exportOptions: {
      format: { id: 'markdown', name: 'Markdown', extension: '.md', mimeType: 'text/markdown', aiOptimized: true },
      includeMetadata: true,
      includeImages: true,
      preserveStructure: true,
      aiEnhanced: false
    },
    isExporting: false,
    showAIMenu: false,
    exportResults: []
  });

  /**
   * Available export formats
   */
  const exportFormats: ExportFormat[] = [
    { id: 'html', name: 'HTML', extension: '.html', mimeType: 'text/html', aiOptimized: false },
    { id: 'markdown', name: 'Markdown', extension: '.md', mimeType: 'text/markdown', aiOptimized: true },
    { id: 'json', name: 'JSON', extension: '.json', mimeType: 'application/json', aiOptimized: true },
    { id: 'txt', name: 'Plain Text', extension: '.txt', mimeType: 'text/plain', aiOptimized: true },
    { id: 'pdf', name: 'PDF', extension: '.pdf', mimeType: 'application/pdf', aiOptimized: false }
  ];



  /**
   * Handle format selection
   */
  const handleFormatChange = useCallback((formatId: string) => {
    const format = exportFormats.find(f => f.id === formatId);
    if (format) {
      setState(prev => ({
        ...prev,
        selectedFormat: formatId,
        exportOptions: { ...prev.exportOptions, format }
      }));
    }
  }, [exportFormats]);

  /**
   * Handle export options change
   */
  const handleOptionsChange = useCallback((key: keyof ExportOptions, value: boolean) => {
    setState(prev => ({
      ...prev,
      exportOptions: { ...prev.exportOptions, [key]: value }
    }));
  }, []);

  /**
   * Export single file
   */
  const exportSingleFile = useCallback(async () => {
    if (!selectedFile) return;

    setState(prev => ({ ...prev, isExporting: true }));

    try {
      const content = await convertContent(selectedFile, state.exportOptions);
      const result = await downloadFile(content, selectedFile.name, state.exportOptions.format);
      
      setState(prev => ({
        ...prev,
        isExporting: false,
        exportResults: [...prev.exportResults, result]
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        exportResults: [...prev.exportResults, {
          fileName: selectedFile.name,
          format: state.selectedFormat,
          success: false,
          size: 0,
          error: String(error)
        }]
      }));
    }
  }, [selectedFile, state.exportOptions, state.selectedFormat]);

  /**
   * Export all files (batch export)
   */
  const exportAllFiles = useCallback(async () => {
    if (!directoryStructure) return;

    setState(prev => ({ ...prev, isExporting: true }));

    const results: ExportResult[] = [];
    // TODO: Implement batch export logic
    // This would iterate through all files in the directory structure

    setState(prev => ({
      ...prev,
      isExporting: false,
      exportResults: [...prev.exportResults, ...results]
    }));
  }, [directoryStructure]);

  /**
   * Convert content based on format
   */
  const convertContent = async (file: DocumentFile, options: ExportOptions): Promise<string> => {
    const { format } = options;
    
    switch (format.id) {
      case 'html':
        return convertToHTML(file.content || '');
      case 'markdown':
        return convertToMarkdown(file.content || '');
      case 'json':
        return convertToJSON(file, options);
      case 'txt':
        return convertToPlainText(file.content || '');
      default:
        return file.content || '';
    }
  };

  /**
   * Convert to HTML format
   */
  const convertToHTML = (content: string): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Documentation</title>
</head>
<body>
    ${content}
</body>
</html>`;
  };

  /**
   * Convert to Markdown format
   */
  const convertToMarkdown = (content: string): string => {
    // Basic HTML to Markdown conversion
    return content
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  };

  /**
   * Convert to JSON format
   */
  const convertToJSON = (file: DocumentFile, options: ExportOptions): string => {
    const jsonData = {
      metadata: options.includeMetadata ? {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified.toISOString(),
        exported: new Date().toISOString()
      } : undefined,
      content: file.content,
      format: 'json',
      version: '1.0.0'
    };

    return JSON.stringify(jsonData, null, 2);
  };

  /**
   * Convert to plain text
   */
  const convertToPlainText = (content: string): string => {
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  };

  /**
   * Download file
   */
  const downloadFile = async (content: string, fileName: string, format: ExportFormat): Promise<ExportResult> => {
    const blob = new Blob([content], { type: format.mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}${format.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      fileName: a.download,
      format: format.name,
      success: true,
      size: blob.size,
      downloadUrl: url
    };
  };

  /**
   * Toggle AI Assistant menu
   */
  const toggleAIMenu = useCallback(() => {
    setState(prev => ({ ...prev, showAIMenu: !prev.showAIMenu }));
  }, []);

  /**
   * Export for AI (specialized format)
   */
  const exportForAI = useCallback(async (aiFormat: string) => {
    if (!selectedFile) return;

    setState(prev => ({ ...prev, isExporting: true }));

    try {
      let content = '';
      
      switch (aiFormat) {
        case 'structured-markdown':
          content = `# ${selectedFile.name}\n\n**Type:** ${selectedFile.type}\n**Size:** ${selectedFile.size} bytes\n\n## Content\n\n${selectedFile.content}`;
          break;
        case 'json-ld':
          content = JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "TechnicalArticle",
            "name": selectedFile.name,
            "text": selectedFile.content,
            "dateModified": selectedFile.lastModified.toISOString()
          }, null, 2);
          break;
        case 'plain-text':
          content = `DOCUMENT: ${selectedFile.name}\nTYPE: ${selectedFile.type}\nCONTENT: ${convertToPlainText(selectedFile.content || '')}`;
          break;
      }

      const result = await downloadFile(content, selectedFile.name, {
        id: aiFormat,
        name: `AI ${aiFormat}`,
        extension: aiFormat === 'json-ld' ? '.jsonld' : '.txt',
        mimeType: 'text/plain',
        aiOptimized: true
      });

      setState(prev => ({
        ...prev,
        isExporting: false,
        showAIMenu: false,
        exportResults: [...prev.exportResults, result]
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isExporting: false }));
    }
  }, [selectedFile]);

  return (
    <div className="export-panel">
      {/* Export Header */}
      <div className="export-header">
        <h3>📤 Export Documentation</h3>
        <div className="export-stats">
          {selectedFile && <span>Selected: {selectedFile.name}</span>}
          {directoryStructure && (
            <span>Available: {directoryStructure.supportedFiles} files</span>
          )}
        </div>
      </div>

      {/* Format Selection */}
      <div className="format-selection">
        <h4>Export Format</h4>
        <div className="format-grid">
          {exportFormats.map(format => (
            <label key={format.id} className="format-option">
              <input
                type="radio"
                name="export-format"
                value={format.id}
                checked={state.selectedFormat === format.id}
                onChange={(e) => handleFormatChange(e.target.value)}
              />
              <div className="format-info">
                <div className="format-name">{format.name}</div>
                <div className="format-ext">{format.extension}</div>
                {format.aiOptimized && <span className="ai-badge">🤖 AI</span>}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="export-options">
        <h4>Options</h4>
        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={state.exportOptions.includeMetadata}
            onChange={(e) => handleOptionsChange('includeMetadata', e.target.checked)}
          />
          Include metadata
        </label>
        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={state.exportOptions.includeImages}
            onChange={(e) => handleOptionsChange('includeImages', e.target.checked)}
          />
          Include images
        </label>
        <label className="option-checkbox">
          <input
            type="checkbox"
            checked={state.exportOptions.preserveStructure}
            onChange={(e) => handleOptionsChange('preserveStructure', e.target.checked)}
          />
          Preserve structure
        </label>
      </div>

      {/* Export Actions */}
      <div className="export-actions">
        <button
          onClick={exportSingleFile}
          disabled={!selectedFile || state.isExporting}
          className="export-btn primary"
        >
          {state.isExporting ? '⏳ Exporting...' : '📄 Export Selected File'}
        </button>
        
        <button
          onClick={exportAllFiles}
          disabled={!directoryStructure || state.isExporting}
          className="export-btn secondary"
        >
          📁 Export All Files
        </button>
        
        <button
          onClick={toggleAIMenu}
          className="export-btn ai-btn"
          disabled={!selectedFile}
        >
          🤖 AI Assistant Export
        </button>
      </div>

      {/* AI Assistant Menu */}
      {state.showAIMenu && (
        <div className="ai-export-menu">
          <h4>🤖 AI-Optimized Formats</h4>
          <div className="ai-format-buttons">
            <button onClick={() => exportForAI('structured-markdown')}>
              📝 Structured Markdown
            </button>
            <button onClick={() => exportForAI('json-ld')}>
              🔗 JSON-LD
            </button>
            <button onClick={() => exportForAI('plain-text')}>
              📄 AI Plain Text
            </button>
          </div>
        </div>
      )}

      {/* Export Results */}
      {state.exportResults.length > 0 && (
        <div className="export-results">
          <h4>Export History</h4>
          <div className="results-list">
            {state.exportResults.map((result, index) => (
              <div key={index} className={`result-item ${result.success ? 'success' : 'error'}`}>
                <span className="result-icon">{result.success ? '✅' : '<Icon name="x" size={16} />'}</span>
                <span className="result-name">{result.fileName}</span>
                <span className="result-format">({result.format})</span>
                {result.success && <span className="result-size">{result.size} bytes</span>}
                {result.error && <span className="result-error">{result.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
