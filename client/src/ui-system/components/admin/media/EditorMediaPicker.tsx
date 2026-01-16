import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MediaGrid } from './index';
import { useWebSocket } from '../../../../contexts/websocket-context';
import type { MediaItem } from '@/admin/pages/media/state/types';

interface EditorMediaPickerProps {
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
}

const EditorMediaPicker: React.FC<EditorMediaPickerProps> = ({ 
  onSelect, 
  onClose
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const { lastMessage } = useWebSocket();
  const [activeTab, setActiveTab] = useState<'library' | 'editor' | 'upload'>('library');
  const [allImages, setAllImages] = useState<MediaItem[]>([]);
  const [editorImages, setEditorImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle WebSocket media updates for real-time sync
  useEffect(() => {
    if (lastMessage?.type === 'MEDIA_UPDATE') {
      console.log('EditorMediaPicker: WebSocket message received:', lastMessage);
      const { action, item } = lastMessage.data;
      
      if (action === 'uploaded' && item.mimeType?.startsWith('image/')) {
        console.log('EditorMediaPicker: Adding uploaded image:', item);
        
        // Add to allImages (Library tab) - only if NOT from editor source
        if (item.source !== 'editor') {
          setAllImages(prev => {
            const exists = prev.some(img => String(img.id) === String(item.id));
            if (!exists) {
              console.log('EditorMediaPicker: Adding to allImages (library)');
              return [item, ...prev];
            }
            return prev;
          });
        }
        
        // Add to editorImages if source is editor (Editor tab)
        if (item.source === 'editor') {
          setEditorImages(prev => {
            const exists = prev.some(img => String(img.id) === String(item.id));
            if (!exists) {
              console.log('EditorMediaPicker: Adding to editorImages');
              return [item, ...prev];
            }
            return prev;
          });
        }
      } else if (action === 'deleted') {
        console.log('EditorMediaPicker: Processing deletion for item:', item);
        
        const itemId = String(item.id);
        
        setAllImages(prev => {
          const filtered = prev.filter(img => String(img.id) !== itemId);
          console.log('EditorMediaPicker: AllImages filtered:', prev.length, '->', filtered.length);
          return filtered;
        });
        
        setEditorImages(prev => {
          const filtered = prev.filter(img => String(img.id) !== itemId);
          console.log('EditorMediaPicker: EditorImages filtered:', prev.length, '->', filtered.length);
          return filtered;
        });
      }
    }
  }, [lastMessage]); // Remove dependency on array lengths to prevent infinite loops

  const handleFileSelect = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/media/?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const allMedia = await response.json();
        
        // Filter for general images only (for library tab) - exclude editor images
        const libraryImageItems = allMedia.filter((item: MediaItem) => 
          item.mimeType.startsWith('image/') && item.source !== 'editor'
        );
        
        // Filter for editor-only images (for editor tab)
        const editorImageItems = allMedia.filter((item: MediaItem) => 
          item.mimeType.startsWith('image/') && item.source === 'editor'
        );
        
        console.log('EditorMediaPicker: Library images:', libraryImageItems.length, 'Editor images:', editorImageItems.length);
        
        setAllImages(libraryImageItems); // Now contains only general library images
        setEditorImages(editorImageItems);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/editor/upload-image/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('EditorMediaPicker: Upload successful:', result);
        
        // Clear file selection and preview
        handleRemoveFile();
        
        // Create MediaItem for immediate selection (don't add to state - WebSocket will handle)
        const newItem: MediaItem = {
          id: result.id.toString(),
          filename: result.filename,
          originalName: result.originalName,
          mimeType: 'image/webp',
          size: result.size,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl || result.url,
          category: 'images',
          source: 'editor',
          folderPath: 'uploads/editor/images',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Select the uploaded image immediately
        onSelect(newItem);
        
        // WebSocket will handle adding to state, no manual updates needed
        console.log('EditorMediaPicker: Image selected, WebSocket will update state');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-modal">
      <div className="admin-modal__overlay" onClick={onClose}></div>
      <div className="admin-modal__content admin-modal__content--large">
        <div className="admin-modal__header">
          <h3 className="admin-modal__title">
            {t('admin:selectImage', { defaultValue: 'Select Image' })}
          </h3>
          <button className="admin-modal__close hover-bg" onClick={onClose}>×</button>
        </div>

        <div className="admin-modal__body">
          <div className="editor-media-picker">
            <div className="editor-media-picker__tabs">
              <button
                className={`editor-media-picker__tab ${activeTab === 'library' ? 'editor-media-picker__tab--active' : ''}`}
                onClick={() => setActiveTab('library')}
              >
                {t('admin:mediaLibrary', { defaultValue: 'Media Library' })}
              </button>
              <button
                className={`editor-media-picker__tab ${activeTab === 'editor' ? 'editor-media-picker__tab--active' : ''}`}
                onClick={() => setActiveTab('editor')}
              >
                {t('admin:editor', { defaultValue: 'Editor' })}
              </button>
              <button
                className={`editor-media-picker__tab ${activeTab === 'upload' ? 'editor-media-picker__tab--active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                {t('admin:uploadNew', { defaultValue: 'Upload New' })}
              </button>
            </div>

            <div className="editor-media-picker__content">
              {activeTab === 'library' && (
                <div className="editor-media-picker__library">
                  {loading ? (
                    <div className="admin-loading">Loading images...</div>
                  ) : (
                    <MediaGrid
                      items={allImages}
                      selectedItems={[]}
                      dispatch={() => {}}
                      mode="picker"
                      onItemClick={onSelect}
                    />
                  )}
                </div>
              )}

              {activeTab === 'editor' && (
                <div className="editor-media-picker__editor">
                  {loading ? (
                    <div className="admin-loading">Loading editor images...</div>
                  ) : (
                    <MediaGrid
                      items={editorImages}
                      selectedItems={[]}
                      dispatch={() => {}}
                      mode="picker"
                      onItemClick={onSelect}
                    />
                  )}
                </div>
              )}

              {activeTab === 'upload' && (
                <div className="editor-media-picker__upload">
                  {!selectedFile ? (
                    <div className="editor-upload-zone">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                        className="editor-upload-zone__input"
                        disabled={uploading}
                      />
                      <div className="editor-upload-zone__content">
                        <div className="editor-upload-zone__icon">📷</div>
                        <p className="editor-upload-zone__text">
                          {t('admin:dragDropImage', { defaultValue: 'Click to select an image' })}
                        </p>
                        <p className="editor-upload-zone__hint">
                          {t('admin:supportedFormats', { defaultValue: 'Supports: JPG, PNG, GIF, WebP' })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="editor-upload-preview">
                      <div className="editor-upload-preview__image">
                        <img src={previewUrl!} alt="Preview" />
                      </div>
                      <div className="editor-upload-preview__info">
                        <p className="editor-upload-preview__filename">{selectedFile.name}</p>
                        <p className="editor-upload-preview__size">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="editor-upload-preview__actions">
                        <button
                          className="admin-button admin-button--secondary admin-button--small"
                          onClick={handleRemoveFile}
                          disabled={uploading}
                        >
                          {t('admin:remove', { defaultValue: 'Remove' })}
                        </button>
                        <button
                          className="admin-button admin-button--primary admin-button--small"
                          onClick={handleImageUpload}
                          disabled={uploading}
                        >
                          {uploading ? t('admin:uploading', { defaultValue: 'Uploading...' }) : t('admin:uploadAndSelect', { defaultValue: 'Upload & Select' })}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorMediaPicker;
