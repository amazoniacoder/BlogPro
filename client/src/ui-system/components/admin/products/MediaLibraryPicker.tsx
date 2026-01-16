import React, { useState, useEffect } from 'react';
import { Button } from '../../button';
import { Icon } from '../../../icons/components';

interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  category: string;
  source?: string;
  folderPath?: string;
}

interface MediaLibraryPickerProps {
  value?: string;
  onChange: (path: string) => void;
  onCancel: () => void;
}

export const MediaLibraryPicker: React.FC<MediaLibraryPickerProps> = ({
  value,
  onChange,
  onCancel
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>(value || '');
  const [filter, setFilter] = useState('images');

  useEffect(() => {
    fetchMediaFiles();
  }, [filter]);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/media');
      const data = await response.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch media files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedFile) {
      onChange(selectedFile);
    }
  };

  const filteredFiles = filter === 'images' 
    ? files.filter(file => file.mimeType.startsWith('image/'))
    : files;

  return (
    <div className="media-library-picker">
      <div className="media-library-picker__header">
        <h3>Select Image</h3>
        <Button
          variant="ghost"
          size="sm"
          icon="x"
          onClick={onCancel}
        />
      </div>

      <div className="media-library-picker__filters">
        <Button
          variant={filter === 'images' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('images')}
        >
          Images
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Files
        </Button>
      </div>

      <div className="media-library-picker__content">
        {loading ? (
          <div className="media-library-picker__loading">Loading files...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="media-library-picker__empty">
            <Icon name="image" size={48} />
            <p>No images found. Upload some images to get started.</p>
          </div>
        ) : (
          <div className="media-library-picker__grid">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className={`media-library-picker__item ${
                  selectedFile === file.url ? 'media-library-picker__item--selected' : ''
                }`}
                onClick={() => setSelectedFile(file.url)}
              >
                <div className="media-library-picker__image">
                  <img 
                    src={file.thumbnailUrl || file.url} 
                    alt={file.originalName}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.image-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'image-fallback';
                        fallback.innerHTML = '📷';
                        fallback.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#f3f4f6;color:#6b7280;font-size:2rem;';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>
                <div className="media-library-picker__info">
                  <div className="media-library-picker__name">
                    {file.originalName}
                  </div>
                  <div className="media-library-picker__size">
                    {Math.round(file.size / 1024)}KB
                  </div>
                </div>
                {selectedFile === file.url && (
                  <div className="media-library-picker__selected-icon">
                    <Icon name="check" size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="media-library-picker__actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSelect}
          disabled={!selectedFile}
        >
          Select Image
        </Button>
      </div>
    </div>
  );
};
