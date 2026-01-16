/**
 * Auto Save Service
 * 
 * Handles automatic saving of editor content with conflict resolution.
 */

import { Disposable, LifecycleManager } from '../lifecycle/LifecycleManager';

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
  lastSaved?: Date;
  error?: string;
}

export interface IAutoSaveService extends Disposable {
  initialize(content: string): void;
  updateContent(content: string): void;
  manualSave(): Promise<void>;
  resolveConflict(resolution: 'local' | 'server' | 'merge'): Promise<void>;
  onStatusChange(callback: (status: AutoSaveStatus) => void): () => void;
}

export class AutoSaveService implements IAutoSaveService {
  private content: string = '';
  private lastSavedContent: string = '';
  private saveCallback?: (content: string) => Promise<void>;
  private statusCallbacks = new Set<(status: AutoSaveStatus) => void>();
  private saveTimeout?: NodeJS.Timeout;
  private currentStatus: AutoSaveStatus = { status: 'idle' };
  private readonly DEBOUNCE_DELAY = 2000; // 2 seconds
  private blogSaveService?: any; // Will be imported dynamically

  constructor(saveCallback?: (content: string) => Promise<void>, postId?: number) {
    console.log('🆕 AutoSaveService: Initializing service', {
      hasCustomCallback: !!saveCallback,
      postId,
      debounceDelay: this.DEBOUNCE_DELAY
    });
    
    this.saveCallback = saveCallback;
    
    // Initialize blog save service if no custom callback provided
    if (!saveCallback) {
      console.log('🔧 AutoSaveService: No custom callback provided, initializing BlogContentSaveService');
      this.initializeBlogSaveService(postId);
    }
    
    // Register with lifecycle manager
    const lifecycleManager = LifecycleManager.getInstance();
    lifecycleManager.register(this);
  }

  initialize(content: string): void {
    this.content = content;
    this.lastSavedContent = content;
    this.updateStatus({ status: 'idle' });
  }

  updateContent(content: string): void {
    this.content = content;
    
    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Don't auto-save if content is too short or unchanged
    if (content.length <= 5 || content === this.lastSavedContent) {
      console.log('🔧 AutoSaveService: Skipping save - content too short or unchanged', {
        contentLength: content.length,
        isUnchanged: content === this.lastSavedContent,
        threshold: 5
      });
      return;
    }
    
    console.log('✅ AutoSaveService: Content meets save criteria, scheduling save', {
      contentLength: content.length,
      debounceDelay: this.DEBOUNCE_DELAY
    });

    // Debounced auto-save
    console.log('⏰ AutoSaveService: Scheduling debounced save', { delay: this.DEBOUNCE_DELAY });
    this.saveTimeout = setTimeout(() => {
      console.log('🚀 AutoSaveService: Debounce timer triggered, starting save');
      this.performSave();
    }, this.DEBOUNCE_DELAY);
  }

  async manualSave(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = undefined;
    }
    
    await this.performSave();
  }

  private async performSave(): Promise<void> {
    if (this.content === this.lastSavedContent) {
      return; // No changes to save
    }

    try {
      this.updateStatus({ status: 'saving' });
      
      // Ensure minimum display time for saving status (so animation is visible)
      const saveStartTime = Date.now();
      const MIN_SAVING_DISPLAY_TIME = 500; // 500ms minimum

      if (this.saveCallback) {
        // Use custom save callback (e.g., for specific blog post)
        console.log('🔗 AutoSaveService: Using custom save callback');
        await this.saveCallback(this.content);
        console.log('✅ AutoSaveService: Custom save callback completed');
      } else if (this.blogSaveService) {
        // Use blog save service for database + localStorage hybrid
        console.log('🔧 AutoSaveService: Using BlogContentSaveService');
        await this.blogSaveService.saveContent(this.content);
        console.log('✅ AutoSaveService: BlogContentSaveService completed');
      } else {
        // Fallback: localStorage only (should not happen in production)
        console.warn('⚠️ AutoSaveService: No save method available - using localStorage fallback');
        localStorage.setItem('editor_autosave_fallback', JSON.stringify({
          content: this.content,
          timestamp: Date.now()
        }));
        console.log('💿 AutoSaveService: Fallback save to localStorage completed');
      }

      this.lastSavedContent = this.content;
      
      // Ensure minimum display time for saving animation
      const saveEndTime = Date.now();
      const saveDuration = saveEndTime - saveStartTime;
      const remainingTime = Math.max(0, MIN_SAVING_DISPLAY_TIME - saveDuration);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      this.updateStatus({ 
        status: 'saved', 
        lastSaved: new Date() 
      });

    } catch (error) {
      console.error('Auto-save failed:', error);
      this.updateStatus({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Save failed' 
      });
    }
  }

  async resolveConflict(resolution: 'local' | 'server' | 'merge'): Promise<void> {
    try {
      this.updateStatus({ status: 'saving' });

      switch (resolution) {
        case 'local':
          // Keep local content, force save
          await this.performSave();
          break;
          
        case 'server':
          // Load server content (would need server integration)
          console.log('Loading server content...');
          this.updateStatus({ status: 'saved', lastSaved: new Date() });
          break;
          
        case 'merge':
          // Merge content (would need merge logic)
          console.log('Merging content...');
          await this.performSave();
          break;
      }
    } catch (error) {
      this.updateStatus({ 
        status: 'error', 
        error: 'Conflict resolution failed' 
      });
    }
  }

  onStatusChange(callback: (status: AutoSaveStatus) => void): () => void {
    this.statusCallbacks.add(callback);
    
    // Immediately call with current status
    callback(this.currentStatus);
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  private updateStatus(status: AutoSaveStatus): void {
    this.currentStatus = status;
    this.statusCallbacks.forEach(callback => callback(status));
  }

  dispose(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = undefined;
    }
    
    this.statusCallbacks.clear();
    
    // Unregister from lifecycle manager
    const lifecycleManager = LifecycleManager.getInstance();
    lifecycleManager.unregister(this);
  }

  /**
   * Initialize blog save service for database + localStorage hybrid
   */
  private async initializeBlogSaveService(postId?: number): Promise<void> {
    try {
      console.log('🔧 AutoSaveService: Loading BlogContentSaveService module');
      const { BlogContentSaveService } = await import('./BlogContentSaveService');
      this.blogSaveService = new BlogContentSaveService(postId);
      console.log('✅ AutoSaveService: BlogContentSaveService initialized successfully', { postId });
    } catch (error) {
      console.error('🔧 AutoSaveService: Failed to initialize blog save service:', error);
    }
  }

  /**
   * Set blog post ID for saving to specific post
   */
  setBlogPostId(postId: number): void {
    if (this.blogSaveService) {
      this.blogSaveService.setPostId(postId);
    }
  }

  /**
   * Set post as published/draft
   */
  setPublished(published: boolean): void {
    if (this.blogSaveService) {
      this.blogSaveService.setPublished(published);
    }
  }

  // Static method to restore from localStorage (backup only)
  static restoreFromLocalStorage(): { content: string; timestamp: number; postId?: number } | null {
    try {
      // Try blog editor backup first
      const blogBackup = localStorage.getItem('blog_editor_backup');
      if (blogBackup) {
        const data = JSON.parse(blogBackup);
        return {
          content: data.content,
          timestamp: data.timestamp,
          postId: data.postId
        };
      }

      // Try blog editor temp
      const blogTemp = localStorage.getItem('blog_editor_temp');
      if (blogTemp) {
        const data = JSON.parse(blogTemp);
        return {
          content: data.content,
          timestamp: data.timestamp,
          postId: data.postId
        };
      }

      // Fallback to old format
      const fallback = localStorage.getItem('editor_autosave_fallback');
      if (fallback) {
        const data = JSON.parse(fallback);
        return {
          content: data.content,
          timestamp: data.timestamp
        };
      }
    } catch (error) {
      console.error('Failed to restore from localStorage:', error);
    }
    return null;
  }
  
  // Clear localStorage backups after successful database restore
  static clearLocalBackups(): void {
    localStorage.removeItem('blog_editor_backup');
    localStorage.removeItem('blog_editor_temp');
    localStorage.removeItem('editor_autosave_fallback');
  }
}
