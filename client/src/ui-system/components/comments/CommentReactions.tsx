import { useState, useEffect, useCallback, useMemo } from 'react';
import { Stack } from '@/ui-system/components/utility';
import { Icon } from '@/ui-system/icons/components';
import { Text } from '@/ui-system/components/typography';
import { AnimatedReaction } from './ReactionAnimations';

// Debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

interface User {
  id: string;
  username?: string;
}

interface CommentReactionsProps {
  commentId: number;
  reactionCount: number;
  currentUser?: User;
}

export function CommentReactions({ 
  commentId, 
  reactionCount, 
  currentUser 
}: CommentReactionsProps) {
  const [reactions, setReactions] = useState({
    like: 0,
    heart: 0,
    userReaction: null as string | null
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Load user's existing reactions and counts
  useEffect(() => {
    const loadReactions = async () => {
      if (!currentUser) {
        setReactions({
          like: Math.floor(reactionCount / 2),
          heart: Math.ceil(reactionCount / 2),
          userReaction: null
        });
        return;
      }
      
      try {
        const response = await fetch(`/api/comments/${commentId}/reactions/user`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setReactions({
            like: data.counts?.like || 0,
            heart: data.counts?.heart || 0,
            userReaction: data.userReaction || null
          });
        } else {
          // Fallback to simple distribution
          setReactions({
            like: Math.floor(reactionCount / 2),
            heart: Math.ceil(reactionCount / 2),
            userReaction: null
          });
        }
      } catch (error) {
        console.error('Failed to load reactions:', error);
        setReactions({
          like: Math.floor(reactionCount / 2),
          heart: Math.ceil(reactionCount / 2),
          userReaction: null
        });
      }
    };
    
    loadReactions();
  }, [commentId, reactionCount, currentUser]);
  
  const getCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf-token');
      if (response.ok) {
        const data = await response.json();
        return data.data.csrfToken;
      }
    } catch (error) {
      console.warn('Failed to get CSRF token:', error);
    }
    return null;
  };
  
  // Debounced reaction handler to prevent rapid-fire requests
  const handleReaction = useCallback(async (reactionType: string) => {
    if (!currentUser || isLoading) return;
    
    setIsLoading(true);
    const previousReactions = { ...reactions };
    const csrfToken = await getCSRFToken();
    
    try {
      if (reactions.userReaction === reactionType) {
        // Remove current reaction
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        };
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
        
        const response = await fetch(`/api/comments/${commentId}/reactions/${reactionType}`, {
          method: 'DELETE',
          headers
        });
        
        if (!response.ok) throw new Error('Failed to remove reaction');
        
        setReactions(prev => ({
          ...prev,
          [reactionType]: Math.max(0, prev[reactionType as keyof typeof prev] as number - 1),
          userReaction: null
        }));
      } else {
        // Remove previous reaction if exists, then add new one
        if (reactions.userReaction) {
          const deleteHeaders: Record<string, string> = {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          };
          if (csrfToken) deleteHeaders['X-CSRF-Token'] = csrfToken;
          
          await fetch(`/api/comments/${commentId}/reactions/${reactions.userReaction}`, {
            method: 'DELETE',
            headers: deleteHeaders
          });
        }
        
        // Add new reaction
        const postHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        };
        if (csrfToken) postHeaders['X-CSRF-Token'] = csrfToken;
        
        const response = await fetch(`/api/comments/${commentId}/reactions`, {
          method: 'POST',
          headers: postHeaders,
          body: JSON.stringify({ reactionType })
        });
        
        if (!response.ok) throw new Error('Failed to add reaction');
        
        setReactions(prev => {
          const newReactions = { like: prev.like, heart: prev.heart, userReaction: reactionType };
          
          // Remove count from previous reaction
          if (prev.userReaction === 'like') {
            newReactions.like = Math.max(0, prev.like - 1);
          } else if (prev.userReaction === 'heart') {
            newReactions.heart = Math.max(0, prev.heart - 1);
          }
          
          // Add count to new reaction
          if (reactionType === 'like') {
            newReactions.like = prev.like + 1;
          } else if (reactionType === 'heart') {
            newReactions.heart = prev.heart + 1;
          }
          
          return newReactions;
        });
      }
    } catch (error: any) {
      console.error('Error handling reaction:', error);
      
      // Rollback optimistic update
      setReactions(previousReactions);
      
      // Handle rate limiting specifically
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        alert('You\'re reacting too quickly. Please wait a moment before trying again.');
      } else {
        alert('Failed to update reaction. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [commentId, currentUser, reactions]);
  
  // Debounce the reaction handler to prevent rapid clicks
  const debouncedHandleReaction = useMemo(
    () => debounce(handleReaction, 300),
    [handleReaction]
  );
  
  if (!currentUser) {
    return (
      <Stack direction="row" spacing="xs" align="center">
        {reactionCount > 0 && (
          <>
            <Icon name="heart" size={14} />
            <Text size="sm">{reactionCount}</Text>
          </>
        )}
      </Stack>
    );
  }
  
  return (
    <Stack direction="row" spacing="xs" align="center" className="comment-reactions">
      <AnimatedReaction
        type="like"
        count={reactions.like}
        isActive={reactions.userReaction === 'like'}
        onClick={() => debouncedHandleReaction('like')}
        disabled={isLoading}
      />
      
      <AnimatedReaction
        type="dislike"
        count={reactions.heart}
        isActive={reactions.userReaction === 'heart'}
        onClick={() => debouncedHandleReaction('heart')}
        disabled={isLoading}
      />
    </Stack>
  );
}