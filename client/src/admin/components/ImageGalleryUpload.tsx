import React, { useState, useRef } from 'react';

interface ImageGalleryUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageGalleryUpload: React.FC<ImageGalleryUploadProps> = ({
  images,
  onChange,
  maxImages = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;
    
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    setUploading(true);
    
    try {
      const newImageUrls: string[] = [];
      
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          newImageUrls.push(data.url);
        } else {
          console.error('Upload failed:', response.statusText);
        }
      }
      
      onChange([...images, ...newImageUrls]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  return (
    <div className="image-gallery-upload">
      <div className="image-gallery-upload__header">
        <h3>Image Gallery ({images.length}/{maxImages})</h3>
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="button button--secondary"
          >
            {uploading ? 'Uploading...' : 'Add Images'}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />

      <div className="image-gallery-upload__grid">
        {images.map((image, index) => (
          <div key={index} className="image-gallery-upload__item">
            <img src={image} alt={`Gallery ${index + 1}`} />
            <div className="image-gallery-upload__controls">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, index - 1)}
                  className="image-gallery-upload__move"
                >
                  ←
                </button>
              )}
              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, index + 1)}
                  className="image-gallery-upload__move"
                >
                  →
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="image-gallery-upload__remove"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
