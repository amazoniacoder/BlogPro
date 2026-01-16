import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '@/store/auth-context';
import { Icon } from '@/ui-system/icons/components';
import { Button } from '@/ui-system/components/button';

interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  parent_id?: number | null;
  content: string;
  content_html: string;
  created_at: string;
  updated_at: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  reply_count: number;
  like_count?: number;
  replies?: Comment[];
}

interface CommentListProps {
  postId: number;
  isVisible?: boolean;
}

export function CommentList({ postId, isVisible = true }: CommentListProps) {
  const { 
    comments, loading, loadingMore, hasMore, error, pagination, loadedReplies, expandedReplies, loadingReplies,
    setExpandedReplies, loadComments, loadMoreComments, loadReplies, loadRepliesForComment, createComment, updateComment, deleteComment 
  } = useComments(postId, isVisible);
  const { user, isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [reactions, setReactions] = useState<{[key: number]: boolean}>({});
  const [likeCounts, setLikeCounts] = useState<{[key: number]: number}>({});
  
  // Load user reactions when component mounts
  useEffect(() => {
    const loadUserReactions = async () => {
      console.log('🔄 Loading user reactions for post:', postId);
      console.log('🔐 Auth status:', { isAuthenticated, userId: user?.id });
      
      if (!isAuthenticated || !user) {
        console.log('❌ Not authenticated, skipping reaction load');
        return;
      }
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('❌ No auth token found');
          return;
        }
        
        console.log('📡 Fetching reactions from API...');
        const response = await fetch(`/api/comments/${postId}/reactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📡 API response:', result);
          
          if (result.success) {
            // Convert reaction types to boolean (assuming 'like' reactions)
            const reactionState = Object.keys(result.data).reduce((acc, commentId) => {
              acc[parseInt(commentId)] = result.data[commentId] === 'like';
              return acc;
            }, {} as {[key: number]: boolean});
            
            console.log('✅ Setting reaction state:', reactionState);
            setReactions(reactionState);
          } else {
            console.log('❌ API returned error:', result.error);
          }
        } else {
          const errorText = await response.text();
          console.log('❌ API request failed:', response.status, errorText);
        }
      } catch (error) {
        console.error('❌ Error loading user reactions:', error);
      }
    };
    
    loadUserReactions();
  }, [postId, isAuthenticated, user]);
  
  // Infinite scroll functionality
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (hasMore && !loadingMore) {
          loadMoreComments();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loadMoreComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment({ postId, content: newComment });
      setNewComment('');
    } catch (err: any) {
      console.error('Error creating comment:', err);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await createComment({ postId, content: replyContent, parentId });
      setReplyContent('');
      setReplyTo(null);
      // Refresh replies for this comment
      await loadReplies(parentId);
    } catch (err: any) {
      console.error('Error creating reply:', err);
    }
  };

  const toggleReplies = async (commentId: number) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      // Hide replies
      newExpanded.delete(commentId);
    } else {
      // Show replies and load first page if not loaded
      newExpanded.add(commentId);
      if (!loadedReplies[commentId]) {
        await loadRepliesForComment(commentId, 1);
      }
    }
    setExpandedReplies(newExpanded);
  };





  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserDisplayName = (comment: Comment) => {
    if (comment.first_name || comment.last_name) {
      return `${comment.first_name || ''} ${comment.last_name || ''}`.trim();
    }
    return comment.username;
  };

  const canEditComment = (comment: Comment) => {
    // Only allow editing own comments (even for admins)
    return isAuthenticated && user && user.id === comment.user_id;
  };

  const canDeleteComment = (comment: Comment) => {
    // Allow deleting own comments or admin can delete any comment
    return isAuthenticated && user && (user.id === comment.user_id || user.role === 'admin');
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editContent.trim()) return;
    
    try {
      await updateComment(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
    } catch (err: any) {
      console.error('Error updating comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
      } catch (err: any) {
        console.error('Error deleting comment:', err);
      }
    }
  };

  const handleReaction = async (commentId: number) => {
    console.log('👍 Handling reaction for comment:', commentId);
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, cannot react');
      return;
    }
    
    const isCurrentlyLiked = reactions[commentId];
    console.log('👍 Current like state:', isCurrentlyLiked);
    
    // Optimistic update
    const newState = !isCurrentlyLiked;
    console.log('👍 Setting optimistic state to:', newState);
    setReactions(prev => ({
      ...prev,
      [commentId]: newState
    }));
    
    // Update like count optimistically
    setLikeCounts(prev => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + (newState ? 1 : -1)
    }));
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');
      
      let response;
      
      if (isCurrentlyLiked) {
        // Remove reaction
        console.log('🗑️ Removing reaction via DELETE');
        response = await fetch(`/api/comments/${commentId}/reactions`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Add reaction
        console.log('➕ Adding reaction via POST');
        response = await fetch(`/api/comments/${commentId}/reactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reactionType: 'like' })
        });
      }
      
      console.log('📡 Reaction API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Reaction API failed:', errorText);
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Reaction API success:', result);
      
    } catch (err: any) {
      console.error('❌ Error updating reaction:', err);
      // Revert optimistic update on error
      console.log('↩️ Reverting optimistic update');
      setReactions(prev => ({
        ...prev,
        [commentId]: isCurrentlyLiked
      }));
      setLikeCounts(prev => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) + (isCurrentlyLiked ? 1 : -1)
      }));
    }
  };

  if (!isVisible) return null;

  return (
    <div className="comment-list">
      <div className="comment-list__header">
        <h3 className="comment-list__title">
          Comments ({pagination.total})
        </h3>
      </div>

      {/* New Comment Form - Only show if authenticated */}
      {isAuthenticated && (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <div className="comment-form__field">
            <textarea
              className="comment-form__textarea"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
            />
          </div>
          <div className="comment-form__actions">
            <button 
              type="submit" 
              className="comment-form__submit"
              disabled={!newComment.trim()}
            >
              Post Comment
            </button>
          </div>
        </form>
      )}
      
      {!isAuthenticated && (
        <div className="comment-form__login-prompt">
          <p>Please log in to leave a comment.</p>
          <Link href="/auth">
            <Button variant="primary" size="md">
              Login
            </Button>
          </Link>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="comment-list__loading">
          Loading comments...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="comment-list__error">
          Error: {error}
          <button onClick={() => loadComments(1)} className="comment-list__retry">
            Retry
          </button>
        </div>
      )}

      {/* Comments */}
      <div className="comment-list__items">
        {comments.map((comment) => (
          <div key={comment.id} className="frontend-comment-item">
            <div className="frontend-comment-item__header">
              <div className="comment-item__author">
                {comment.profile_image_url && (
                  <img 
                    src={comment.profile_image_url} 
                    alt={getUserDisplayName(comment)}
                    className="comment-item__avatar"
                  />
                )}
                <span className="frontend-comment-item__name">
                  {getUserDisplayName(comment)}
                </span>
              </div>
              <span className="frontend-comment-item__date">
                {formatDate(comment.created_at)}
              </span>
            </div>

            <div className="frontend-comment-item__content">
              {editingComment === comment.id ? (
                <div className="comment-edit-form">
                  <textarea
                    className="comment-edit-form__textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="comment-edit-form__actions">
                    <button 
                      onClick={() => handleSaveEdit(comment.id)}
                      className="comment-edit-form__save"
                      disabled={!editContent.trim()}
                    >
                      <Icon name="check" size={14} />
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingComment(null)}
                      className="comment-edit-form__cancel"
                    >
                      <Icon name="x" size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: comment.content_html }} />
              )}
            </div>

            <div className="frontend-comment-item__actions">
              <div className="frontend-comment-item__actions-left">
                {isAuthenticated && (
                  <button 
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="frontend-comment-item__reply-btn"
                  >
                    <Icon name="reply" size={14} />
                    Reply
                  </button>
                )}
                
                {comment.reply_count > 0 && (
                  <button 
                    onClick={() => toggleReplies(comment.id)}
                    className="frontend-comment-item__replies-btn"
                    disabled={loadingReplies.has(comment.id)}
                  >
                    <Icon name="reply" size={14} />
                    {loadingReplies.has(comment.id) 
                      ? 'Loading...' 
                      : `${expandedReplies.has(comment.id) ? 'Hide' : 'Show'} Replies (${comment.reply_count})`
                    }
                  </button>
                )}
              </div>
              
              <div className="frontend-comment-item__actions-right">
                {/* Reaction Button */}
                <button 
                  onClick={() => handleReaction(comment.id)}
                  className={`frontend-comment-item__reaction ${reactions[comment.id] ? 'frontend-comment-item__reaction--active' : ''}`}
                >
                  <Icon name="thumbs-up" size={14} />
                  <span className="frontend-comment-item__reaction-count">
                    {likeCounts[comment.id] !== undefined ? likeCounts[comment.id] : ((comment as any).like_count || 0)}
                  </span>
                </button>
                
                {/* Edit/Delete Menu */}
                {(canEditComment(comment) || canDeleteComment(comment)) && editingComment !== comment.id && (
                  <div className="frontend-comment-item__menu">
                    {canEditComment(comment) && (
                      <button 
                        onClick={() => handleEditComment(comment)}
                        className="frontend-comment-item__edit-btn"
                        title="Edit comment"
                      >
                        <Icon name="edit" size={14} />
                      </button>
                    )}
                    {canDeleteComment(comment) && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="frontend-comment-item__delete-btn"
                        title="Delete comment"
                      >
                        <Icon name="delete" size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reply Form */}
            {replyTo === comment.id && isAuthenticated && (
              <form 
                className="comment-reply-form" 
                onSubmit={(e) => handleSubmitReply(e, comment.id)}
              >
                <textarea
                  className="comment-reply-form__textarea"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                />
                <div className="comment-reply-form__actions">
                  <button type="submit" disabled={!replyContent.trim()}>
                    <Icon name="check" size={14} />
                    Post Reply
                  </button>
                  <button type="button" onClick={() => setReplyTo(null)}>
                    <Icon name="x" size={14} />
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Replies */}
            {expandedReplies.has(comment.id) && loadedReplies[comment.id] && (
              <div className="comment-replies">
                {loadedReplies[comment.id].map((reply) => (
                  <div key={reply.id} className="comment-reply" data-reply-id={reply.id}>
                    <div className="comment-reply__header">
                      <div className="comment-reply__author">
                        {reply.profile_image_url && (
                          <img 
                            src={reply.profile_image_url} 
                            alt={getUserDisplayName(reply)}
                            className="comment-reply__avatar"
                          />
                        )}
                        <span className="comment-reply__name">
                          {getUserDisplayName(reply)}
                        </span>
                      </div>
                      <span className="comment-reply__date">
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <div className="comment-reply__content">
                      <div dangerouslySetInnerHTML={{ __html: reply.content_html }} />
                    </div>
                    
                    {/* Reply actions */}
                    <div className="comment-reply__actions">
                      <div className="comment-reply__actions-right">
                        {/* Reaction Button for replies */}
                        <button 
                          onClick={() => handleReaction(reply.id)}
                          className={`comment-reply__reaction ${reactions[reply.id] ? 'comment-reply__reaction--active' : ''}`}
                        >
                          <Icon name="thumbs-up" size={14} />
                          <span className="comment-reply__reaction-count">
                            {likeCounts[reply.id] !== undefined ? likeCounts[reply.id] : ((reply as any).like_count || 0)}
                          </span>
                        </button>
                        
                        {/* Edit/Delete for reply owner */}
                        {(canEditComment(reply) || canDeleteComment(reply)) && (
                          <div className="comment-reply__menu">
                            {canEditComment(reply) && (
                              <button 
                                onClick={() => handleEditComment(reply)}
                                className="comment-reply__edit-btn"
                                title="Edit reply"
                              >
                                <Icon name="edit" size={12} />
                              </button>
                            )}
                            {canDeleteComment(reply) && (
                              <button 
                                onClick={() => handleDeleteComment(reply.id)}
                                className="comment-reply__delete-btn"
                                title="Delete reply"
                              >
                                <Icon name="delete" size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                

              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="comment-load-more">
          <button 
            onClick={loadMoreComments}
            disabled={loadingMore}
            className="comment-load-more__btn"
          >
            {loadingMore ? (
              <>
                <div className="comment-load-more__spinner"></div>
                Loading more comments...
              </>
            ) : (
              `Load more comments (${Math.max(0, pagination.total - comments.length)} remaining)`
            )}
          </button>
        </div>
      )}
      
      {/* End of comments indicator */}
      {!hasMore && comments.length > 0 && (
        <div className="comment-end-indicator">
          <span>All comments loaded</span>
        </div>
      )}
    </div>
  );
}