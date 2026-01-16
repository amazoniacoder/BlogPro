/**
 * Blog Content Save Service
 * 
 * Handles saving editor content to blog_posts table with proper media URL handling.
 */

export interface BlogPost {
  id?: number;
  title: string;
  description: string;
  content: string;
  categoryId?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  projectUrl?: string;
  technologies?: string[];
  tags?: string[];
  slug?: string;
  status?: 'draft' | 'published' | 'archived';
}

export class BlogContentSaveService {
  private postId?: number;
  private isDraft: boolean = true;

  constructor(postId?: number) {
    this.postId = postId;
  }

  /**
   * Save content to blog_posts table
   */
  async saveContent(content: string, metadata?: Partial<BlogPost>): Promise<void> {
    console.log('🔧 BlogContentSaveService: Starting database save operation', {
      postId: this.postId,
      contentLength: content.length,
      hasMetadata: !!metadata,
      isDraft: this.isDraft
    });
    
    try {
      // Process media URLs to ensure they're correct
      const processedContent = this.processMediaUrls(content);
      
      const postData: Partial<BlogPost> = {
        content: processedContent,
        title: metadata?.title || 'Untitled Post',
        description: metadata?.description || this.extractDescription(processedContent),
        status: this.isDraft ? 'draft' : 'published',
        ...metadata
      };
      
      console.log('🔧 BlogContentSaveService: Prepared post data for save', {
        postId: this.postId,
        contentLength: processedContent.length,
        title: postData.title,
        status: postData.status,
        hasChanges: processedContent !== content // Show if content was processed
      });

      if (this.postId) {
        // Update existing post
        console.log('🔄 BlogContentSaveService: Updating existing post in database', { postId: this.postId });
        await this.updateBlogPost(this.postId, postData);
        console.log('✅ BlogContentSaveService: Successfully updated post in database', { postId: this.postId });
      } else {
        // Create new post
        console.log('🔧 BlogContentSaveService: Creating new post in database');
        const newPost = await this.createBlogPost(postData);
        this.postId = newPost.id;
        console.log('✅ BlogContentSaveService: Successfully created new post in database', { postId: this.postId });
      }

      // Save backup to localStorage after successful database save
      this.saveToLocalStorage(processedContent, postData);
      console.log('🔧 BlogContentSaveService: Database save completed successfully', { postId: this.postId });
      
      // Verify save by checking content length
      if (this.postId) {
        try {
          const verifyResponse = await fetch(`/api/blog/${this.postId}`);
          if (verifyResponse.ok) {
            const verifyResult = await verifyResponse.json();
            const savedContent = verifyResult.data?.content || '';
            console.log('🔧 BlogContentSaveService: Save verification', {
              originalLength: processedContent.length,
              savedLength: savedContent.length,
              contentMatches: savedContent === processedContent,
              postId: this.postId
            });
          }
        } catch (error) {
          console.warn('⚠️ BlogContentSaveService: Could not verify save:', error);
        }
      }

    } catch (error) {
      console.error('🔧 BlogContentSaveService: Database save failed:', error);
      
      // Fallback: save to localStorage as temp storage
      console.log('💿 BlogContentSaveService: Falling back to localStorage temp storage');
      this.saveToLocalStorageTemp(content, metadata);
      throw error;
    }
  }

  /**
   * Create new blog post
   */
  private async createBlogPost(postData: Partial<BlogPost>): Promise<BlogPost> {
    const response = await fetch('/api/blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: postData.title,
        description: postData.description,
        content: postData.content,
        categoryId: postData.categoryId,
        imageUrl: postData.imageUrl || '',
        thumbnailUrl: postData.thumbnailUrl,
        projectUrl: postData.projectUrl,
        technologies: postData.technologies || [],
        tags: postData.tags || [],
        slug: postData.slug,
        status: postData.status || 'draft'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create blog post: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Update existing blog post
   */
  private async updateBlogPost(id: number, postData: Partial<BlogPost>): Promise<BlogPost> {
    console.log('🔄 BlogContentSaveService: Sending PUT request to database', {
      url: `/api/blog/${id}`,
      contentLength: postData.content?.length || 0,
      title: postData.title,
      method: 'PUT'
    });
    
    const response = await fetch(`/api/blog/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      console.error('🔧 BlogContentSaveService: Database update failed', {
        status: response.status,
        statusText: response.statusText,
        postId: id
      });
      throw new Error(`Failed to update blog post: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ BlogContentSaveService: Database update successful', {
      postId: result.data?.id,
      updatedContentLength: result.data?.content?.length || 0,
      responseStatus: response.status
    });
    return result.data;
  }

  /**
   * Process media URLs to ensure they're properly formatted
   */
  private processMediaUrls(content: string): string {
    // Create a temporary DOM element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = content;

    // Process images
    const images = temp.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        // Ensure media URLs are properly formatted
        if (src.startsWith('/uploads/') || src.startsWith('uploads/')) {
          // Convert to proper API endpoint
          const cleanPath = src.replace(/^\/+/, '');
          img.setAttribute('src', `/api/media/${cleanPath}`);
        } else if (src.startsWith('blob:') || src.startsWith('data:')) {
          // Handle blob URLs or data URLs - these should be uploaded first
          console.warn('Found blob/data URL in content - should be uploaded to media API first');
        }
      }
    });

    // Process other media elements if needed (videos, audio, etc.)
    const videos = temp.querySelectorAll('video source, video');
    videos.forEach(video => {
      const src = video.getAttribute('src');
      if (src && (src.startsWith('/uploads/') || src.startsWith('uploads/'))) {
        const cleanPath = src.replace(/^\/+/, '');
        video.setAttribute('src', `/api/media/${cleanPath}`);
      }
    });

    return temp.innerHTML;
  }

  /**
   * Extract description from content for SEO
   */
  private extractDescription(content: string): string {
    // Remove HTML tags and get first 160 characters
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 160 
      ? textContent.substring(0, 157) + '...'
      : textContent;
  }

  /**
   * Save to localStorage as backup after successful database save
   */
  private saveToLocalStorage(content: string, metadata: Partial<BlogPost>): void {
    try {
      const backup = {
        postId: this.postId,
        content,
        metadata,
        timestamp: Date.now(),
        type: 'backup'
      };
      
      localStorage.setItem('blog_editor_backup', JSON.stringify(backup));
    } catch (error) {
      console.warn('Failed to save backup to localStorage:', error);
    }
  }

  /**
   * Save to localStorage as temp storage when database fails
   */
  private saveToLocalStorageTemp(content: string, metadata?: Partial<BlogPost>): void {
    try {
      const temp = {
        postId: this.postId,
        content,
        metadata,
        timestamp: Date.now(),
        type: 'temp'
      };
      
      localStorage.setItem('blog_editor_temp', JSON.stringify(temp));
    } catch (error) {
      console.warn('Failed to save temp to localStorage:', error);
    }
  }

  /**
   * Restore content from localStorage
   */
  static restoreFromLocalStorage(): { content: string; metadata?: Partial<BlogPost>; postId?: number } | null {
    console.log('🔧 BlogContentSaveService: Attempting to restore content from localStorage');
    
    try {
      // Try backup first (from successful database saves)
      let saved = localStorage.getItem('blog_editor_backup');
      let isTemp = false;
      
      if (!saved) {
        // Fallback to temp storage
        saved = localStorage.getItem('blog_editor_temp');
        isTemp = true;
      }
      
      if (saved) {
        const data = JSON.parse(saved);
        
        // Check if backup is recent (within 24 hours)
        const isRecent = (Date.now() - data.timestamp) < (24 * 60 * 60 * 1000);
        
        if (isRecent) {
          console.log('✅ BlogContentSaveService: Successfully restored content from localStorage', {
            type: isTemp ? 'temp' : 'backup',
            postId: data.postId,
            contentLength: data.content?.length || 0,
            age: Math.round((Date.now() - data.timestamp) / 1000 / 60) + ' minutes'
          });
          return {
            content: data.content,
            metadata: data.metadata,
            postId: data.postId
          };
        } else if (isTemp) {
          // Remove old temp data
          console.log('🔧 BlogContentSaveService: Removing old temp data from localStorage');
          localStorage.removeItem('blog_editor_temp');
        }
      }
    } catch (error) {
      console.error('🔧 BlogContentSaveService: Failed to restore from localStorage:', error);
    }
    
    console.log('⚠️ BlogContentSaveService: No recent content found in localStorage');
    return null;
  }

  /**
   * Clear localStorage backups after successful restore
   */
  static clearLocalBackups(): void {
    localStorage.removeItem('blog_editor_backup');
    localStorage.removeItem('blog_editor_temp');
  }

  /**
   * Set post as published
   */
  setPublished(published: boolean = true): void {
    this.isDraft = !published;
  }

  /**
   * Get current post ID
   */
  getPostId(): number | undefined {
    return this.postId;
  }

  /**
   * Set post ID for updating existing post
   */
  setPostId(id: number): void {
    this.postId = id;
  }
}
