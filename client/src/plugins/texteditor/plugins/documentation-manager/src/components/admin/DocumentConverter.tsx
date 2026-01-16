import { Icon } from '../../../../../../../ui-system/icons/components';
/**
 * Document Converter
 * 
 * Component for converting documents between different formats.
 */

import React, { useState, useEffect } from 'react';

interface SupportedFormat {
  extension: string;
  name: string;
  mimeType: string;
  canConvertTo: string[];
  canConvertFrom: string[];
}

interface Conversion {
  id: string;
  source_format: string;
  target_format: string;
  conversion_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  error_message?: string;
  filename?: string;
}

export const DocumentConverter: React.FC = () => {
  const [formats, setFormats] = useState<SupportedFormat[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [converting, setConverting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupportedFormats();
    loadConversionHistory();
  }, []);

  const loadSupportedFormats = async () => {
    try {
      const response = await fetch('/api/documentation/conversion/formats');
      const data = await response.json();
      setFormats(data.formats);
    } catch (error) {
      console.error('Failed to load supported formats:', error);
    }
  };

  const loadConversionHistory = async () => {
    try {
      const response = await fetch('/api/documentation/conversion/history');
      const data = await response.json();
      setConversions(data.conversions);
    } catch (error) {
      console.error('Failed to load conversion history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTargetFormat(''); // Reset target format when new file is selected
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getAvailableTargetFormats = () => {
    if (!selectedFile) return [];
    
    const sourceExtension = getFileExtension(selectedFile.name);
    const sourceFormat = formats.find(f => f.extension === sourceExtension);
    
    return sourceFormat ? sourceFormat.canConvertTo : [];
  };

  const startConversion = async () => {
    if (!selectedFile || !targetFormat) return;
    
    try {
      setConverting(true);
      
      // For demo purposes, we'll simulate file upload by reading content
      const content = await readFileContent(selectedFile);
      
      const response = await fetch('/api/documentation/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceFileId: 'demo-file-id', // In real implementation, upload file first
          targetFormat,
          sourceContent: content
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Poll for conversion status
        pollConversionStatus(result.conversionId);
        
        // Refresh history
        await loadConversionHistory();
      }
    } catch (error) {
      console.error('Failed to start conversion:', error);
    } finally {
      setConverting(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const pollConversionStatus = async (conversionId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/documentation/conversion/${conversionId}/status`);
        const status = await response.json();
        
        if (status.conversion_status === 'completed') {
          await loadConversionHistory();
          return;
        } else if (status.conversion_status === 'failed') {
          console.error('Conversion failed:', status.error_message);
          await loadConversionHistory();
          return;
        }
        
        // Continue polling if still pending
        setTimeout(checkStatus, 2000);
      } catch (error) {
        console.error('Failed to check conversion status:', error);
      }
    };
    
    checkStatus();
  };

  const downloadConversion = async (conversionId: string, targetFormat: string) => {
    try {
      const response = await fetch(`/api/documentation/conversion/${conversionId}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted.${targetFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download conversion:', error);
    }
  };

  const deleteConversion = async (conversionId: string) => {
    if (!confirm('Are you sure you want to delete this conversion?')) return;
    
    try {
      const response = await fetch(`/api/documentation/conversion/${conversionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadConversionHistory();
      }
    } catch (error) {
      console.error('Failed to delete conversion:', error);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      case 'md': return '📝';
      case 'html': return '🌐';
      case 'txt': return '📄';
      default: return '📄';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '<Icon name="x" size={16} />';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  if (loading) {
    return <div className="loading">Loading converter...</div>;
  }

  return (
    <div className="document-converter">
      <div className="document-converter__header">
        <h1>🔄 Document Converter</h1>
        <p>Convert documents between different formats</p>
      </div>

      <div className="converter-form">
        <div className="converter-form__section">
          <h3>📁 Select File</h3>
          <div className="file-input-wrapper">
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.md,.html,.txt"
              className="file-input"
            />
            {selectedFile && (
              <div className="selected-file">
                <span className="file-icon">{getFormatIcon(getFileExtension(selectedFile.name))}</span>
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        </div>

        <div className="converter-form__section">
          <h3>🎯 Target Format</h3>
          <div className="format-selector">
            {getAvailableTargetFormats().map(format => {
              const formatInfo = formats.find(f => f.extension === format);
              return (
                <label key={format} className="format-option">
                  <input
                    type="radio"
                    name="targetFormat"
                    value={format}
                    checked={targetFormat === format}
                    onChange={(e) => setTargetFormat(e.target.value)}
                  />
                  <span className="format-icon">{getFormatIcon(format)}</span>
                  <span className="format-name">{formatInfo?.name || format.toUpperCase()}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="converter-form__actions">
          <button
            onClick={startConversion}
            disabled={!selectedFile || !targetFormat || converting}
            className="btn btn--primary btn--large"
          >
            {converting ? '🔄 Converting...' : '🚀 Start Conversion'}
          </button>
        </div>
      </div>

      <div className="conversion-history">
        <h3>📋 Conversion History</h3>
        {conversions.length > 0 ? (
          <div className="conversions-table">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>From → To</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map(conversion => (
                  <tr key={conversion.id}>
                    <td>
                      <div className="conversion-file">
                        <span className="file-icon">{getFormatIcon(conversion.source_format)}</span>
                        <span>{conversion.filename || 'Unknown file'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="conversion-formats">
                        <span className="source-format">
                          {getFormatIcon(conversion.source_format)} {conversion.source_format.toUpperCase()}
                        </span>
                        <span className="arrow">→</span>
                        <span className="target-format">
                          {getFormatIcon(conversion.target_format)} {conversion.target_format.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="conversion-status">
                        <span className="status-icon">{getStatusIcon(conversion.conversion_status)}</span>
                        <span className={`status-text status-${conversion.conversion_status}`}>
                          {conversion.conversion_status}
                        </span>
                      </div>
                    </td>
                    <td>{new Date(conversion.created_at).toLocaleString()}</td>
                    <td>
                      <div className="conversion-actions">
                        {conversion.conversion_status === 'completed' && (
                          <button
                            onClick={() => downloadConversion(conversion.id, conversion.target_format)}
                            className="btn btn--small btn--secondary"
                          >
                            📥 Download
                          </button>
                        )}
                        <button
                          onClick={() => deleteConversion(conversion.id)}
                          className="btn btn--small btn--danger"
                        >
                          <Icon name="delete" size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No conversions yet. Upload a file and convert it to get started.</p>
          </div>
        )}
      </div>

      <div className="supported-formats">
        <h3>📋 Supported Formats</h3>
        <div className="formats-grid">
          {formats.map(format => (
            <div key={format.extension} className="format-card">
              <div className="format-header">
                <span className="format-icon">{getFormatIcon(format.extension)}</span>
                <span className="format-name">{format.name}</span>
              </div>
              <div className="format-conversions">
                <div className="conversion-direction">
                  <strong>Can convert to:</strong>
                  <div className="format-list">
                    {format.canConvertTo.map(target => (
                      <span key={target} className="format-tag">
                        {getFormatIcon(target)} {target.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
