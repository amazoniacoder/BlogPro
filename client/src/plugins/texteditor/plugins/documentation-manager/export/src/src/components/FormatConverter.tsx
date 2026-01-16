/**
 * Format Converter Component
 * Handles content export in multiple formats
 */

import React, { useState, useEffect } from 'react';

interface FormatOption {
  name: string;
  key: string;
  description: string;
  mimeType: string;
  extension: string;
}

interface FormatConverterProps {
  contentId: string;
  contentTitle?: string;
}

export const FormatConverter: React.FC<FormatConverterProps> = ({ 
  contentId, 
  contentTitle = 'Document' 
}) => {
  const [formats, setFormats] = useState<FormatOption[]>([]);
  const [converting, setConverting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load available formats
  useEffect(() => {
    const loadFormats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/documentation/conversion/formats', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFormats(data.formats);
        } else {
          // Fallback to default formats if API endpoint doesn't exist
          setFormats([
            { name: 'HTML', key: 'html', description: 'Web page format', mimeType: 'text/html', extension: '.html' },
            { name: 'Markdown', key: 'markdown', description: 'Markdown format', mimeType: 'text/markdown', extension: '.md' },
            { name: 'JSON', key: 'json', description: 'JSON data format', mimeType: 'application/json', extension: '.json' },
            { name: 'PDF', key: 'pdf', description: 'Portable Document Format', mimeType: 'application/pdf', extension: '.pdf' }
          ]);
        }
      } catch (error) {
        console.error('Failed to load formats:', error);
        // Fallback to default formats
        setFormats([
          { name: 'HTML', key: 'html', description: 'Web page format', mimeType: 'text/html', extension: '.html' },
          { name: 'Markdown', key: 'markdown', description: 'Markdown format', mimeType: 'text/markdown', extension: '.md' },
          { name: 'JSON', key: 'json', description: 'JSON data format', mimeType: 'application/json', extension: '.json' },
          { name: 'PDF', key: 'pdf', description: 'Portable Document Format', mimeType: 'application/pdf', extension: '.pdf' }
        ]);
      }
    };

    loadFormats();
  }, []);

  // Convert and download content
  const convertAndDownload = async (format: string) => {
    setConverting(format);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documentation/conversion/${contentId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ format })
      });

      if (!response.ok) {
        throw new Error(`Conversion failed: ${response.statusText}`);
      }

      // Get the filename from response headers or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${contentTitle}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Handle different content types
      let blob;
      if (format === 'pdf') {
        blob = await response.blob();
      } else {
        const result = await response.json();
        const text = result.content || result;
        const formatOption = formats.find(f => f.key === format);
        blob = new Blob([typeof text === 'string' ? text : JSON.stringify(text, null, 2)], { 
          type: formatOption?.mimeType || 'text/plain' 
        });
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Conversion failed:', error);
      setError(error instanceof Error ? error.message : 'Conversion failed');
    } finally {
      setConverting(null);
    }
  };

  // Preview content in new window
  const previewContent = async (format: string) => {
    if (format === 'pdf') {
      // PDF can't be previewed, just download
      convertAndDownload(format);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/documentation/conversion/${contentId}/preview/${format}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.ok) {
        const content = await response.text();
        const newWindow = window.open('', '_blank');
        
        if (newWindow) {
          if (format === 'html') {
            newWindow.document.write(content);
          } else {
            newWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px;">${content}</pre>`);
          }
          newWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Preview failed:', error);
      setError('Preview failed');
    }
  };

  if (formats.length === 0) {
    return (
      <div className="format-converter loading">
        <p>Loading export options...</p>
      </div>
    );
  }

  return (
    <div className="format-converter">
      <h3 className="converter-title">Export Options</h3>
      
      {error && (
        <div className="converter-error">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            onClick={() => setError(null)}
            className="error-dismiss"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="format-grid">
        {formats.map((format) => (
          <div key={format.key} className="format-option">
            <div className="format-info">
              <h4 className="format-name">{format.name}</h4>
              <p className="format-description">{format.description}</p>
              <span className="format-extension">{format.extension}</span>
            </div>
            
            <div className="format-actions">
              {format.key !== 'pdf' && (
                <button
                  onClick={() => previewContent(format.key)}
                  className="preview-btn"
                  disabled={converting === format.key}
                >
                  👁️ Preview
                </button>
              )}
              
              <button
                onClick={() => convertAndDownload(format.key)}
                className="download-btn"
                disabled={converting === format.key}
              >
                {converting === format.key ? (
                  <>
                    <span className="spinner">⏳</span>
                    Converting...
                  </>
                ) : (
                  <>
                    📥 Download
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="converter-info">
        <p className="info-text">
          💡 <strong>Tip:</strong> Use Preview to see how your content will look before downloading.
          PDF exports include professional formatting and styling.
        </p>
      </div>
    </div>
  );
};
