/**
 * Media Service - Image upload, WebP conversion, and file management
 * Handles image processing and integration with media directory
 */

export interface ImageData {
  file: File;
  alt: string;
  description?: string;
  alignment: 'left' | 'center' | 'right' | 'none';
  width?: number;
  height?: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  fileSize?: number;
  dimensions?: { width: number; height: number };
}

export class MediaService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private static readonly UPLOAD_ENDPOINT = '/api/media';

  /**
   * Validate image file
   */
  static async validateImage(file: File): Promise<ImageValidationResult> {
    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.'
      };
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'File size too large. Maximum size is 10MB.'
      };
    }

    // Get image dimensions
    try {
      const dimensions = await this.getImageDimensions(file);
      return {
        isValid: true,
        fileSize: file.size,
        dimensions
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid image file or corrupted data.'
      };
    }
  }

  /**
   * Upload image with WebP conversion
   */
  static async uploadImage(file: File): Promise<UploadResult> {
    try {
      // Validate image first
      const validation = await this.validateImage(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Convert to WebP if not already
      const webpFile = await this.convertToWebP(file);

      // Create form data
      const formData = new FormData();
      formData.append('file', webpFile);

      // Upload to server
      const response = await fetch(this.UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `Upload failed: ${response.statusText}`
        };
      }

      const result = await response.json();
      return {
        success: true,
        url: result.url,
        filename: result.filename
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Convert image to WebP format
   */
  static async convertToWebP(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      // If already WebP, return as is
      if (file.type === 'image/webp') {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const webpFile = new File([blob], this.generateWebPFilename(file.name), {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(webpFile);
            } else {
              reject(new Error('Failed to convert image to WebP'));
            }
          }, 'image/webp', 0.9); // 90% quality
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get image dimensions
   */
  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate WebP filename
   */
  private static generateWebPFilename(originalName: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const timestamp = Date.now();
    return `${nameWithoutExt}_${timestamp}.webp`;
  }

  /**
   * Insert image into editor
   */
  static insertImage(imageData: { url: string; alt: string; description?: string; alignment: string; width?: number; height?: number }): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    
    // Create image element with built-in resize functionality
    const img = document.createElement('img');
    img.src = imageData.url;
    img.alt = imageData.alt;
    img.style.width = imageData.width ? `${imageData.width}px` : 'auto';
    img.style.height = 'auto';
    img.style.maxWidth = '100%';
    img.style.display = 'inline-block';
    img.style.margin = '8px';
    img.style.verticalAlign = 'top';
    img.style.border = '3px solid transparent';
    img.style.transition = 'all 0.2s';
    img.style.cursor = 'pointer';
    img.className = 'resizable-image';
    
    // Apply alignment for inline-block images
    if (imageData.alignment === 'center') {
      img.style.display = 'block';
      img.style.marginLeft = 'auto';
      img.style.marginRight = 'auto';
    } else if (imageData.alignment === 'left') {
      img.style.float = 'left';
      img.style.marginRight = '16px';
    } else if (imageData.alignment === 'right') {
      img.style.float = 'right';
      img.style.marginLeft = '16px';
    }
    
    // Save alignment and description in data attributes
    img.setAttribute('data-alignment', imageData.alignment);
    if (imageData.description) {
      img.setAttribute('data-description', imageData.description);
    }
    
    // Add resize functionality and click handler
    this.makeImageResizable(img);
    this.addImageClickHandler(img);
    
    console.log('🔧 Creating resizable image');

    // Insert image with proper spacing for cursor positioning
    range.deleteContents();
    
    // Create text nodes for cursor positioning
    const beforeText = document.createTextNode('\u200B'); // Zero-width space
    const afterText = document.createTextNode('\u200B'); // Zero-width space
    
    // Insert in order: before text, image, after text
    range.insertNode(beforeText);
    range.setStartAfter(beforeText);
    range.insertNode(img);
    range.setStartAfter(img);
    range.insertNode(afterText);
    
    // Position cursor after the image
    range.setStartAfter(afterText);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Create image from drag and drop
   */
  static async handleImageDrop(dataTransfer: DataTransfer): Promise<UploadResult[]> {
    const files = Array.from(dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length === 0) {
      return [{ success: false, error: 'No image files found' }];
    }

    // Upload all images
    const results = await Promise.all(
      files.map(file => this.uploadImage(file))
    );

    return results;
  }

  /**
   * Resize image while maintaining aspect ratio
   */
  static async resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { width, height } = this.calculateResizedDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        );

        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          }, file.type, 0.9);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Make image resizable with drag functionality
   */
  private static makeImageResizable(img: HTMLImageElement): void {
    console.log('🔧 Adding resize functionality to image:', img.src);
    
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    let aspectRatio = 1;
    
    // Remove existing event listeners to avoid duplicates
    const newImg = img.cloneNode(true) as HTMLImageElement;
    img.parentNode?.replaceChild(newImg, img);
    
    // Show resize border on hover
    newImg.addEventListener('mouseenter', () => {
      newImg.style.borderColor = '#3b82f6';
      newImg.style.cursor = 'nw-resize';
      console.log('🖱️ Mouse entered image - resize ready');
    });
    
    newImg.addEventListener('mouseleave', () => {
      if (!isResizing) {
        newImg.style.borderColor = 'transparent';
        newImg.style.cursor = 'pointer';
      }
      console.log('🖱️ Mouse left image');
    });
    
    // Get aspect ratio when image loads
    const updateAspectRatio = () => {
      if (newImg.naturalWidth && newImg.naturalHeight) {
        aspectRatio = newImg.naturalWidth / newImg.naturalHeight;
        console.log('📎 Aspect ratio set:', aspectRatio);
      }
    };
    
    if (newImg.complete) {
      updateAspectRatio();
    } else {
      newImg.onload = updateAspectRatio;
    }
    
    // Handle right-click for alignment menu
    newImg.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      this.showAlignmentMenu(newImg, e.clientX, e.clientY);
    });
    
    // Handle resize on image mousedown
    newImg.addEventListener('mousedown', (e: MouseEvent) => {
      // Right-click is handled by contextmenu event
      if (e.button === 2) return;
      
      console.log('🖱️ Resize started on existing image');
      e.preventDefault();
      e.stopPropagation();
      
      isResizing = true;
      startX = e.clientX;
      startWidth = newImg.offsetWidth;
      
      document.body.style.cursor = 'nw-resize';
      document.body.style.userSelect = 'none';
      newImg.style.borderColor = '#3b82f6';
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(50, Math.min(800, startWidth + deltaX));
        const newHeight = newWidth / aspectRatio;
        
        console.log('📎 Resizing existing image - newWidth:', newWidth);
        
        // Update both CSS styles and HTML attributes for persistence
        newImg.style.width = `${newWidth}px`;
        newImg.style.height = `${newHeight}px`;
        newImg.setAttribute('width', newWidth.toString());
        newImg.setAttribute('height', newHeight.toString());
      };
      
      const handleMouseUp = () => {
        console.log('📎 Resize ended - final size:', newImg.offsetWidth, 'x', newImg.offsetHeight);
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        newImg.style.borderColor = 'transparent';
        newImg.style.cursor = 'pointer';
        
        // Ensure final dimensions are saved in attributes
        newImg.setAttribute('width', newImg.offsetWidth.toString());
        newImg.setAttribute('height', newImg.offsetHeight.toString());
        
        // Trigger content change event to save changes
        const editor = newImg.closest('[contenteditable="true"]') as HTMLElement;
        if (editor) {
          const event = new Event('input', { bubbles: true });
          editor.dispatchEvent(event);
          console.log('🔧 Triggered content change event for save');
        }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
    
    console.log('✅ Resize functionality fully attached to image');
  }

  /**
   * Show alignment context menu for image
   */
  private static showAlignmentMenu(img: HTMLImageElement, x: number, y: number): void {
    // Remove existing menu if any
    const existingMenu = document.querySelector('.image-alignment-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    // Create menu
    const menu = document.createElement('div');
    menu.className = 'image-alignment-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.background = 'white';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '4px';
    menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    menu.style.zIndex = '10000';
    menu.style.padding = '4px 0';
    menu.style.minWidth = '120px';

    // Menu items
    const alignments = [
      { label: '← Left', value: 'left' },
      { label: '⊙ Center', value: 'center' },
      { label: '→ Right', value: 'right' },
      { label: '⊡ None', value: 'none' },
      { label: '---', value: 'separator' },
      { label: '📝 Edit Description', value: 'edit-description' }
    ];

    alignments.forEach(alignment => {
      const item = document.createElement('div');
      
      if (alignment.value === 'separator') {
        item.style.height = '1px';
        item.style.backgroundColor = '#e0e0e0';
        item.style.margin = '4px 0';
      } else {
        item.textContent = alignment.label;
        item.style.padding = '8px 16px';
        item.style.cursor = 'pointer';
        item.style.fontSize = '14px';
        
        item.addEventListener('mouseenter', () => {
          item.style.backgroundColor = '#f0f0f0';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.backgroundColor = 'transparent';
        });
        
        item.addEventListener('click', () => {
          if (alignment.value === 'edit-description') {
            this.showDescriptionEditor(img);
          } else {
            this.changeImageAlignment(img, alignment.value);
          }
          menu.remove();
        });
      }
      
      menu.appendChild(item);
    });

    // Add to document
    document.body.appendChild(menu);

    // Remove menu when clicking outside
    const removeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', removeMenu);
    }, 100);

    console.log('🎯 Alignment menu shown for image');
  }

  /**
   * Change image alignment
   */
  private static changeImageAlignment(img: HTMLImageElement, alignment: string): void {
    console.log('🎯 Changing image alignment to:', alignment);
    
    // Reset all alignment styles
    img.style.float = '';
    img.style.display = 'inline-block';
    img.style.marginLeft = '8px';
    img.style.marginRight = '8px';
    img.style.marginTop = '8px';
    img.style.marginBottom = '8px';
    
    // Apply new alignment with max-width constraint
    img.style.maxWidth = '100%';
    
    switch (alignment) {
      case 'left':
        img.style.float = 'left';
        img.style.marginRight = '16px';
        img.style.marginLeft = '0';
        img.style.maxWidth = '50%'; // Prevent left-floated images from taking full width
        break;
      case 'right':
        img.style.float = 'right';
        img.style.marginLeft = '16px';
        img.style.marginRight = '0';
        img.style.maxWidth = '50%'; // Prevent right-floated images from taking full width
        break;
      case 'center':
        img.style.display = 'block';
        img.style.marginLeft = 'auto';
        img.style.marginRight = 'auto';
        img.style.float = '';
        img.style.maxWidth = '100%';
        break;
      case 'none':
      default:
        // Keep inline-block with normal margins
        img.style.maxWidth = '100%';
        break;
    }
    
    // Save alignment in data attribute
    img.setAttribute('data-alignment', alignment);
    
    // Trigger content change event to save changes
    const editor = img.closest('[contenteditable="true"]') as HTMLElement;
    if (editor) {
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
      console.log('🔧 Triggered content change event for alignment save');
    }
    
    console.log('✅ Image alignment changed and saved');
  }

  /**
   * Show description editor for image
   */
  private static showDescriptionEditor(img: HTMLImageElement): void {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    // Create dialog
    const dialog = document.createElement('div');
    dialog.style.background = 'white';
    dialog.style.borderRadius = '8px';
    dialog.style.padding = '24px';
    dialog.style.width = '400px';
    dialog.style.maxWidth = '90vw';
    dialog.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';

    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Edit Image Description';
    title.style.margin = '0 0 16px 0';
    title.style.fontSize = '18px';
    title.style.fontWeight = '600';

    // Create textarea
    const textarea = document.createElement('textarea');
    textarea.value = img.getAttribute('data-description') || '';
    textarea.placeholder = 'Enter image description for popup display';
    textarea.style.width = '100%';
    textarea.style.height = '100px';
    textarea.style.padding = '12px';
    textarea.style.border = '1px solid #ddd';
    textarea.style.borderRadius = '6px';
    textarea.style.fontSize = '14px';
    textarea.style.fontFamily = 'inherit';
    textarea.style.resize = 'vertical';
    textarea.style.marginBottom = '16px';
    textarea.style.boxSizing = 'border-box';

    // Create buttons container
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '8px';
    buttons.style.justifyContent = 'flex-end';

    // Create save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.style.padding = '8px 16px';
    saveBtn.style.background = '#3b82f6';
    saveBtn.style.color = 'white';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '6px';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.fontSize = '14px';
    saveBtn.style.fontWeight = '500';

    // Create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '8px 16px';
    cancelBtn.style.background = '#f3f4f6';
    cancelBtn.style.color = '#374151';
    cancelBtn.style.border = '1px solid #d1d5db';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.fontSize = '14px';
    cancelBtn.style.fontWeight = '500';

    // Add hover effects
    saveBtn.addEventListener('mouseenter', () => {
      saveBtn.style.background = '#2563eb';
    });
    saveBtn.addEventListener('mouseleave', () => {
      saveBtn.style.background = '#3b82f6';
    });

    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.background = '#e5e7eb';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.background = '#f3f4f6';
    });

    // Add event listeners
    const closeDialog = () => {
      overlay.remove();
    };

    saveBtn.addEventListener('click', () => {
      const description = textarea.value.trim();
      if (description) {
        img.setAttribute('data-description', description);
      } else {
        img.removeAttribute('data-description');
      }
      
      // Trigger content change event to save changes
      const editor = img.closest('[contenteditable="true"]') as HTMLElement;
      if (editor) {
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
        console.log('🔧 Triggered content change event for description save');
      }
      
      closeDialog();
      console.log('📝 Image description updated');
    });

    cancelBtn.addEventListener('click', closeDialog);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeDialog();
      }
    });

    // Close on Escape key
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDialog();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);

    // Assemble dialog
    buttons.appendChild(cancelBtn);
    buttons.appendChild(saveBtn);
    dialog.appendChild(title);
    dialog.appendChild(textarea);
    dialog.appendChild(buttons);
    overlay.appendChild(dialog);

    // Add to document and focus textarea
    document.body.appendChild(overlay);
    textarea.focus();
    textarea.select();

    console.log('📝 Description editor shown');
  }

  /**
   * Add click handler for image popup
   */
  private static addImageClickHandler(img: HTMLImageElement): void {
    img.addEventListener('click', (e: MouseEvent) => {
      // Don't trigger popup during resize or if right-clicking
      if (e.button === 2 || img.style.borderColor === 'rgb(59, 130, 246)') {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      this.showImagePopup(img);
    });
  }

  /**
   * Show full-scale image popup with description
   */
  private static showImagePopup(img: HTMLImageElement): void {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.flexDirection = 'column';
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';

    // Create full-scale image
    const fullImg = document.createElement('img');
    fullImg.src = img.src;
    fullImg.alt = img.alt;
    fullImg.style.maxWidth = '90%';
    fullImg.style.maxHeight = '80%';
    fullImg.style.objectFit = 'contain';
    fullImg.style.borderRadius = '8px';
    fullImg.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';

    // Create description if it exists
    const description = img.getAttribute('data-description');
    let descriptionEl: HTMLElement | null = null;
    
    if (description) {
      descriptionEl = document.createElement('div');
      descriptionEl.textContent = description;
      descriptionEl.style.color = 'white';
      descriptionEl.style.fontSize = '16px';
      descriptionEl.style.marginTop = '20px';
      descriptionEl.style.textAlign = 'center';
      descriptionEl.style.maxWidth = '600px';
      descriptionEl.style.lineHeight = '1.5';
    }

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '20px';
    closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.width = '40px';
    closeBtn.style.height = '40px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';

    // Add elements to overlay
    overlay.appendChild(fullImg);
    if (descriptionEl) {
      overlay.appendChild(descriptionEl);
    }
    overlay.appendChild(closeBtn);

    // Add to document
    document.body.appendChild(overlay);

    // Close handlers
    const closePopup = () => {
      overlay.remove();
    };

    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePopup();
      }
    });

    // Close on Escape key
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopup();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);

    console.log('🔧 Image popup shown');
  }

  /**
   * Calculate resized dimensions maintaining aspect ratio
   */
  private static calculateResizedDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Make all existing images in the editor resizable
   */
  static makeAllImagesResizable(editorElement: HTMLElement): void {
    const images = editorElement.querySelectorAll('img');
    
    images.forEach((img) => {
      const htmlImg = img as HTMLImageElement;
      
      // Remove existing resize functionality to re-add it
      
      // Always add/update resize functionality
      htmlImg.classList.add('resizable-image');
      htmlImg.style.border = '3px solid transparent';
      htmlImg.style.transition = 'all 0.2s';
      htmlImg.style.cursor = 'pointer';
      htmlImg.style.display = 'inline-block';
      htmlImg.style.verticalAlign = 'top';
      
      // Ensure margin is set for inline-block
      if (!htmlImg.style.margin) {
        htmlImg.style.margin = '8px';
      }
      
      // Preserve existing dimensions if they exist
      if (htmlImg.hasAttribute('width') && htmlImg.hasAttribute('height')) {
        const width = htmlImg.getAttribute('width');
        const height = htmlImg.getAttribute('height');
        if (width && height) {
          htmlImg.style.width = `${width}px`;
          htmlImg.style.height = `${height}px`;

        }
      }
      
      // Restore alignment if it exists
      const savedAlignment = htmlImg.getAttribute('data-alignment');
      if (savedAlignment) {
        this.changeImageAlignment(htmlImg, savedAlignment);
      }
      
      // Always add resize functionality and click handler
      this.makeImageResizable(htmlImg);
      this.addImageClickHandler(htmlImg);
      

    });
  }

  /**
   * Initialize frontend image popups (for blog detail pages)
   */
  static initFrontendImagePopups(): void {
    // Find all images with resizable-image class in blog content
    const blogContent = document.querySelector('.blog-detail__content');
    if (!blogContent) return;

    const images = blogContent.querySelectorAll('img.resizable-image');
    
    images.forEach(img => {
      const htmlImg = img as HTMLImageElement;
      
      // Remove editor-specific styles and add frontend cursor
      htmlImg.style.border = 'none';
      htmlImg.style.cursor = 'pointer';
      htmlImg.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
      
      // Add hover effect
      htmlImg.addEventListener('mouseenter', () => {
        htmlImg.style.transform = 'scale(1.02)';
        htmlImg.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      });
      
      htmlImg.addEventListener('mouseleave', () => {
        htmlImg.style.transform = 'scale(1)';
        htmlImg.style.boxShadow = 'none';
      });
      
      // Add click handler for popup
      htmlImg.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showFrontendImagePopup(htmlImg);
      });
    });

    console.log(`🔧 Initialized frontend image popups for ${images.length} images`);
  }

  /**
   * Show professional frontend image popup with description
   */
  private static showFrontendImagePopup(img: HTMLImageElement): void {
    // Create overlay with professional styling
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.95));
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      padding: 20px;
      box-sizing: border-box;
      opacity: 0;
      transition: opacity 0.4s ease;
      backdrop-filter: blur(10px);
    `;

    // Create image container with professional styling
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      position: relative;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: scale(0.9);
      transition: transform 0.4s ease;
    `;

    // Create full-scale image with professional styling
    const fullImg = document.createElement('img');
    fullImg.src = img.src;
    fullImg.alt = img.alt;
    fullImg.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.1);
    `;

    // Create professional description styling
    const description = img.getAttribute('data-description');
    let descriptionEl = null;
    
    if (description) {
      descriptionEl = document.createElement('div');
      descriptionEl.textContent = description;
      descriptionEl.style.cssText = `
        color: #ffffff;
        font-size: 18px;
        font-weight: 400;
        margin-top: 32px;
        text-align: center;
        max-width: 700px;
        line-height: 1.7;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        padding: 24px 32px;
        border-radius: 16px;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
    }

    // Create professional close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 24px;
      right: 24px;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 18px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      z-index: 10001;
      font-weight: 300;
    `;

    // Professional hover effects
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))';
      closeBtn.style.transform = 'scale(1.1) rotate(90deg)';
      closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.4)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))';
      closeBtn.style.transform = 'scale(1) rotate(0deg)';
      closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });

    // Assemble popup
    imageContainer.appendChild(fullImg);
    if (descriptionEl) {
      imageContainer.appendChild(descriptionEl);
    }
    
    overlay.appendChild(imageContainer);
    overlay.appendChild(closeBtn);

    // Add to document
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Professional animation
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      imageContainer.style.transform = 'scale(1)';
    });

    // Close handlers
    const closePopup = () => {
      overlay.style.opacity = '0';
      imageContainer.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
        document.body.style.overflow = '';
      }, 400);
    };

    closeBtn.addEventListener('click', closePopup);
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePopup();
      }
    });

    // Close on Escape key
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopup();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);

    console.log('🔧 Professional frontend image popup shown');
  }
}
