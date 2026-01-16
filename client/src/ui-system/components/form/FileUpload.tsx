/**
 * BlogPro File Upload Component
 * Universal file upload component
 */

import React, { useRef, useState } from 'react';
import { Icon } from '../../icons/components';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onFileSelect?: (files: FileList | null) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize,
  onFileSelect,
  onError,
  disabled = false,
  className = '',
  children
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadClasses = [
    'file-upload',
    isDragOver && 'file-upload--drag-over',
    disabled && 'file-upload--disabled',
    className
  ].filter(Boolean).join(' ');

  const validateFiles = (files: FileList) => {
    if (maxSize) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSize) {
          onError?.(`File "${files[i].name}" exceeds maximum size of ${maxSize} bytes`);
          return false;
        }
      }
    }
    return true;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && validateFiles(files)) {
      onFileSelect?.(files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div
      className={uploadClasses}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="file-upload__input"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      
      {children || (
        <div className="file-upload__content">
          <Icon name="add" size={24} className="file-upload__icon" />
          <div className="file-upload__text">
            <span className="file-upload__primary">
              Click to upload or drag and drop
            </span>
            <span className="file-upload__secondary">
              {accept ? `Accepted formats: ${accept}` : 'Any file type'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
