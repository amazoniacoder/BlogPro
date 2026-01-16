import React, { useState } from 'react';
import type { MediaItem } from '@/admin/pages/media/state/types';

interface MediaViewerProps {
  item: MediaItem;
  onSave: (item: MediaItem) => void;
  onDelete?: (itemId: string) => void;
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ item, onSave, onDelete, onClose }) => {
  const [editedItem, setEditedItem] = useState<MediaItem>({ ...item });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Debug the item data
  console.log('MediaViewer item:', item);

  const handleChange = (field: keyof MediaItem, value: string) => {
    setEditedItem({ ...editedItem, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedItem);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this media file? This action cannot be undone.');
    if (!confirmed) return;
    
    setDeleting(true);
    try {
      await onDelete(item.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete media file:', error);
      alert('Failed to delete media file. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = item.mimeType.startsWith('image/');
  const isVideo = item.mimeType.startsWith('video/');
  const isAudio = item.mimeType.startsWith('audio/');

  const displayMimeType = isImage ? 'image/webp (Converted)' : item.mimeType;

  return (
    <div className="admin-modal">
      <div className="admin-modal__overlay" onClick={onClose}></div>
      <div className="admin-modal__content admin-modal__content--large">
        <div className="admin-modal__header">
          <h3 className="admin-modal__title">Media Details</h3>
          <button className="admin-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="admin-modal__body">
          <div className="admin-media-viewer">
            <div className="admin-media-viewer__preview">
              {isImage && (
                <img
                  src={item.url}
                  alt={item.alt || item.originalName}
                  className="admin-media-viewer__image"
                  onError={(e) => {
                    console.error('Failed to load image:', item.url);
                    // Try thumbnail as fallback
                    if (item.thumbnailUrl && e.currentTarget.src !== item.thumbnailUrl) {
                      console.log('Trying thumbnail fallback:', item.thumbnailUrl);
                      e.currentTarget.src = item.thumbnailUrl;
                    } else {
                      e.currentTarget.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'admin-media-viewer__error';
                      errorDiv.textContent = `Image failed to load: ${item.filename}`;
                      e.currentTarget.parentNode?.appendChild(errorDiv);
                    }
                  }}
                />
              )}
              {isVideo && (
                <video controls className="admin-media-viewer__video">
                  <source src={item.url} type={item.mimeType} />
                  Your browser does not support the video tag.
                </video>
              )}
              {isAudio && (
                <audio controls className="admin-media-viewer__audio">
                  <source src={item.url} type={item.mimeType} />
                  Your browser does not support the audio tag.
                </audio>
              )}
              {!isImage && !isVideo && !isAudio && (
                <div className="admin-media-viewer__file">
                  <div className="admin-media-viewer__file-icon">📄</div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-media-viewer__download"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>

            <div className="admin-media-viewer__details">
              <div className="admin-form__group">
                <label className="admin-form__label">Title</label>
                <input
                  type="text"
                  value={editedItem.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="admin-form__input"
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Alt Text</label>
                <input
                  type="text"
                  value={editedItem.alt || ''}
                  onChange={(e) => handleChange('alt', e.target.value)}
                  className="admin-form__input"
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">File Name</label>
                <input
                  type="text"
                  value={editedItem.filename}
                  readOnly
                  className="admin-form__input admin-form__input--readonly"
                />
              </div>
              
              <div className="admin-form__group">
                <label className="admin-form__label">Original Name</label>
                <input
                  type="text"
                  value={editedItem.originalName}
                  readOnly
                  className="admin-form__input admin-form__input--readonly"
                />
              </div>

              <div className="admin-media-viewer__info">
                <div className="admin-media-viewer__info-row">
                  <span className="admin-media-viewer__info-label">Type:</span>
                  <span className="admin-media-viewer__info-value">
                    {displayMimeType}
                  </span>
                </div>
                <div className="admin-media-viewer__info-row">
                  <span className="admin-media-viewer__info-label">Size:</span>
                  <span className="admin-media-viewer__info-value">
                    {formatFileSize(item.size)}
                  </span>
                </div>
                {item.width && item.height && (
                  <div className="admin-media-viewer__info-row">
                    <span className="admin-media-viewer__info-label">
                      Dimensions:
                    </span>
                    <span className="admin-media-viewer__info-value">
                      {item.width} × {item.height}
                    </span>
                  </div>
                )}
                <div className="admin-media-viewer__info-row">
                  <span className="admin-media-viewer__info-label">
                    Uploaded:
                  </span>
                  <span className="admin-media-viewer__info-value">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">URL</label>
                <div className="admin-form__input-group">
                  <input
                    type="text"
                    value={item.url}
                    readOnly
                    className="admin-form__input admin-form__input--readonly"
                  />
                  <button
                    className="admin-button admin-button--secondary"
                    onClick={() => navigator.clipboard.writeText(item.url)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-modal__footer">
          {onDelete && (
            <button
              className="admin-button admin-button--danger"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          <div className="admin-modal__footer-right">
            <button
              className="admin-button admin-button--secondary"
              onClick={onClose}
              disabled={saving || deleting}
            >
              Cancel
            </button>
            <button
              className="admin-button admin-button--primary"
              onClick={handleSave}
              disabled={saving || deleting}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MediaViewer);
