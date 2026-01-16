import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface MediaUploaderProps {
  uploading: boolean;
  progress: number;
  onUpload: (files: File[], source?: 'general' | 'editor') => void;
  onClose: () => void;
  source?: 'general' | 'editor';
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  uploading,
  progress,
  onUpload,
  onClose,
  source = 'general',
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files, source);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-modal">
      <div className="admin-modal__overlay" onClick={onClose}></div>
      <div className="admin-modal__content admin-modal__content--large">
        <div className="admin-modal__header">
          <h3 className="admin-modal__title">{t('admin:uploadMedia')}</h3>
          <button className="admin-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="admin-modal__body">
          {uploading ? (
            <div className="admin-uploader__progress-container">
              <div className="admin-uploader__progress">
                <div
                  className="admin-uploader__progress-value"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="admin-uploader__progress-text">
                {progress}% Uploaded
              </div>
            </div>
          ) : (
            <>
              <div
                className={`admin-uploader__dropzone ${
                  dragActive ? 'admin-uploader__dropzone--active' : ''
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="admin-uploader__input hidden"
                />
                <p className="admin-uploader__text">
                  {t('admin:dragDropFiles', { defaultValue: 'Перетащите файлы сюда или' })}
                </p>
                <button
                  type="button"
                  className="admin-button admin-button--primary admin-uploader__browse-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  {t('admin:browseFiles', { defaultValue: 'Выбрать файлы' })}
                </button>
              </div>

              {files.length > 0 && (
                <div className="admin-uploader__files">
                  <h4 className="admin-uploader__files-title">
                    {t('admin:selectedFiles', { count: files.length, defaultValue: 'Выбранные файлы ({{count}})' })}
                  </h4>
                  <ul className="admin-uploader__file-list">
                    {files.map((file, index) => (
                      <li key={index} className="admin-uploader__file-item">
                        <span className="admin-uploader__file-name">
                          {file.name}
                        </span>
                        <span className="admin-uploader__file-size">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          className="admin-uploader__file-remove"
                          onClick={() => removeFile(index)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="admin-modal__footer">
          <button
            className="admin-button admin-button--secondary"
            onClick={onClose}
            disabled={uploading}
          >
            {t('common:cancel')}
          </button>
          <button
            className="admin-button admin-button--primary"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading
              ? t('admin:uploading', { defaultValue: 'Загрузка...' })
              : t('admin:uploadFiles', { count: files.length, defaultValue: 'Загрузить {{count}} файл' + (files.length !== 1 ? 'ов' : '') })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MediaUploader);
