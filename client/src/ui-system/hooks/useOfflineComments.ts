import { useState, useEffect, useCallback } from 'react';

interface CommentDraft {
  id: string;
  postId: number;
  content: string;
  parentId?: number | null;
  timestamp: number;
}

export function useOfflineComments(postId: number) {
  const [drafts, setDrafts] = useState<CommentDraft[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(`comment-drafts-${postId}`);
    if (stored) {
      try {
        setDrafts(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to load comment drafts:', error);
      }
    }
  }, [postId]);

  const saveDraft = useCallback((content: string, parentId?: number | null) => {
    const draft: CommentDraft = {
      id: `draft-${Date.now()}`,
      postId,
      content,
      parentId,
      timestamp: Date.now()
    };

    setDrafts(prev => {
      const updated = [...prev, draft];
      localStorage.setItem(`comment-drafts-${postId}`, JSON.stringify(updated));
      return updated;
    });

    return draft.id;
  }, [postId]);

  const removeDraft = useCallback((draftId: string) => {
    setDrafts(prev => {
      const updated = prev.filter(d => d.id !== draftId);
      localStorage.setItem(`comment-drafts-${postId}`, JSON.stringify(updated));
      return updated;
    });
  }, [postId]);

  const clearDrafts = useCallback(() => {
    setDrafts([]);
    localStorage.removeItem(`comment-drafts-${postId}`);
  }, [postId]);

  return {
    drafts,
    isOnline,
    saveDraft,
    removeDraft,
    clearDrafts
  };
}