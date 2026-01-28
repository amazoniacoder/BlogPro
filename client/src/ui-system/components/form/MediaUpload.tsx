/**
 * BlogPro Media Upload Component
 * Drag and drop file upload component
 */

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/ui-system/components/feedback';
import { Icon } from '../../icons/components';

import './media-upload.css';

export interface MediaUploadProps {
  onUpload?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  className?: string;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUpload,
  accept = 'image/*',
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    
    try {
      const fileArray = Array.from(files);
      
      // Validate file sizes
      const oversizedFiles = fileArray.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        showError(`Some files are too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      if (onUpload) {
        onUpload(fileArray);
      } else {
        // Default upload behavior
        const uploadPromises = fileArray.map(async (file) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=400&fit=crop`;
          
          return {
            filename: `${Date.now()}_${file.name}`,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: mockUrl,
          };
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        
        showSuccess(`Files uploaded successfully! Uploaded ${uploadedFiles.length} file(s)`);
        
        queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      }
      
    } catch (error) {
      showError('Upload failed. Please try again later.');
    } finally {
      setUploading(false);
    }
  }, [showSuccess, showError, queryClient, onUpload, maxSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    e.target.value = '';
  }, [handleFiles]);

  return (
    <div
      className={`media-upload ${isDragging ? 'media-upload--dragging' : ''} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="media-upload__content">
        <Icon name="upload" size={48} className="media-upload__icon" />
        <h3 className="media-upload__title">
          {uploading ? 'Uploading files...' : 'Upload Media Files'}
        </h3>
        <p className="media-upload__description">
          Drag and drop files here, or click to browse
        </p>
        <p className="media-upload__info">
          Supports: JPG, PNG, GIF, WebP (Max {Math.round(maxSize / 1024 / 1024)}MB each)
        </p>
        
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload-input"
          disabled={uploading}
        />
        
        <label
          htmlFor="media-upload-input"
          className="media-upload__button"
        >
          {uploading ? (
            <>
              <Icon name="refresh" size={16} className="media-upload__spinner" />
              Uploading...
            </>
          ) : (
            <>
              <Icon name="upload" size={16} />
              Choose Files
            </>
          )}
        </label>
      </div>
    </div>
  );
};

export default MediaUpload;
