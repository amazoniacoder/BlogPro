import React, { useState } from 'react';
import { Button } from '@/ui-system/components/button';
import { Textarea } from '@/ui-system/components/form';
import { Heading } from '@/ui-system/components/typography';
import { Card } from '@/ui-system/components/card';
import { Stack, getUserDisplayName, getUserAvatar } from '@/ui-system/components/utility';
import { CommentItem } from './CommentItem';
import { useComments } from '../../hooks/useComments';

interface User {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  profileImageUrl?: string; // Support both naming conventions
}



interface CommentThreadProps {
  postId: number;
  currentUser?: User;
}

export function CommentThread({ postId, currentUser }: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transform Comment to CommentTree
  const transformComment = (comment: any, depth = 0): any => ({
    ...comment,
    reaction_count: 0,
    depth,
    replies: (comment.replies || []).map((reply: any) => transformComment(reply, depth + 1))
  });

  
  const {
    comments,
    loading,
    error,
    pagination,
    loadComments,
    createComment,
    updateComment,
    deleteComment
  } = useComments(postId, true); // Always visible when CommentThread is rendered
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      await createComment({
        postId,
        content: newComment,
        parentId: null
      });
      setNewComment('');
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      alert(error.message || 'Failed to create comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="comment-thread">
        <div className="comment-thread__loading">Loading comments...</div>
      </div>
    );
  }
  
  return (
    <div className="comment-thread">
      <div className="comment-thread__header">
        <Heading level={3}>Comments ({comments.length})</Heading>
        {error && (
          <div className="comment-thread__error">
            {error}
          </div>
        )}
      </div>
      
      {currentUser && (
        <Card className="comment-form">
          <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing="md" align="start">
              <div className="comment-form__avatar">
                <img 
                  src={getUserAvatar(currentUser)} 
                  alt={getUserDisplayName(currentUser)}
                  className="comment-form__avatar-img"
                />
              </div>
              <Stack direction="column" spacing="sm" className="comment-form__input">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  maxLength={2000}
                />
                <div className="comment-form__actions">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={!newComment.trim() || isSubmitting}
                    loading={isSubmitting}
                  >
                    Post Comment
                  </Button>
                </div>
              </Stack>
            </Stack>
          </form>
        </Card>
      )}
      
      <Stack direction="column" spacing="md" className="comment-list">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={transformComment(comment)}
            currentUser={currentUser}
            onReply={createComment}
            onUpdate={updateComment}
            onDelete={deleteComment}
          />
        ))}
      </Stack>
      
      {comments.length === 0 && !loading && (
        <div className="comment-thread__empty">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
      
      {pagination.total > comments.length && (
        <div className="comment-thread__load-more">
          <Button 
            variant="outline" 
            onClick={() => loadComments(pagination.page + 1)}
            disabled={loading}
          >
            Load More Comments ({pagination.total - comments.length} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}