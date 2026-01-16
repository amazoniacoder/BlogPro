import React, { useState } from 'react';
import { Button } from '@/ui-system/components/button';
import { Textarea } from '@/ui-system/components/form';
import { Text } from '@/ui-system/components/typography';
import { Card } from '@/ui-system/components/card';
import { Stack, getUserDisplayName, getUserAvatar } from '@/ui-system/components/utility';
import { Icon } from '@/ui-system/icons/components';
import { CommentReactions } from './CommentReactions';
import { ReplyLoader } from './ReplyLoader';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  role?: string;
}

interface CommentTree {
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
  reaction_count: number;
  reply_count: number;
  depth: number;
  replies: CommentTree[];
}

interface CreateCommentData {
  postId: number;
  content: string;
  parentId?: number | null;
}

interface CommentItemProps {
  comment: CommentTree;
  currentUser?: User;
  onReply: (data: CreateCommentData) => Promise<void>;
  onUpdate: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function CommentItem({ 
  comment, 
  currentUser, 
  onReply, 
  onUpdate, 
  onDelete 
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [repliesVisible, setRepliesVisible] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [loadedReplies, setLoadedReplies] = useState<CommentTree[]>([]);
  
  const canEdit = currentUser?.id === comment.user_id;
  const canDelete = canEdit || currentUser?.role === 'admin';
  
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    await onReply({
      postId: comment.post_id,
      content: replyContent,
      parentId: comment.id
    });
    
    setReplyContent('');
    setIsReplying(false);
  };
  
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(comment.id, editContent);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update comment:', error);
      alert(error.message || 'Failed to update comment');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const loadReplies = async (commentId: number) => {
    setRepliesLoading(true);
    try {
      const response = await fetch(`/api/comments/${commentId}/replies`);
      if (!response.ok) throw new Error('Failed to load replies');
      const data = await response.json();
      setLoadedReplies(data.data || []);
      setRepliesVisible(true);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setRepliesLoading(false);
    }
  };
  
  return (
    <Card 
      id={`comment-${comment.id}`}
      className={`comment-item comment-item--depth-${comment.depth}`}
    >
      <Stack direction="row" spacing="md" align="start">
        <div className="comment-item__avatar">
          <img 
            src={getUserAvatar(comment)} 
            alt={getUserDisplayName(comment)}
            className="comment-item__avatar-img"
          />
        </div>
        
        <Stack direction="column" spacing="sm" className="comment-item__content">
          <Stack direction="row" justify="between" align="center">
            <Text weight="medium">
              {getUserDisplayName(comment)}
            </Text>
            <Text size="sm" color="muted">
              {formatDistanceToNow(new Date(comment.created_at))} ago
            </Text>
          </Stack>
          
          <div className="comment-item__body">
            {isEditing ? (
              <form onSubmit={handleEdit}>
                <Stack direction="column" spacing="sm">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    maxLength={2000}
                  />
                  <Stack direction="row" spacing="sm">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="sm"
                      disabled={isUpdating}
                      loading={isUpdating}
                    >
                      <Icon name="save" size={16} />
                      Save
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      <Icon name="x" size={16} />
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </form>
            ) : (
              <div 
                className="comment-item__text"
                dangerouslySetInnerHTML={{ __html: comment.content_html }}
              />
            )}
          </div>
          
          <Stack direction="row" spacing="sm" className="comment-item__actions">
            {currentUser && (
              <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)}>
                <Icon name="arrow-left" size={14} />
                Reply
              </Button>
            )}
            
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Icon name="edit" size={14} />
                Edit
              </Button>
            )}
            
            {canDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this comment?')) {
                    try {
                      console.log(`Attempting to delete comment ${comment.id}`);
                      await onDelete(comment.id);
                      console.log(`Comment ${comment.id} deleted successfully`);
                    } catch (error: any) {
                      console.error('Failed to delete comment:', error);
                      // Don't show alert for "already deleted" errors
                      if (!error.message?.includes('уже удалён') && !error.message?.includes('already deleted')) {
                        alert(error.message || 'Failed to delete comment');
                      }
                    }
                  }
                }}
              >
                <Icon name="delete" size={14} />
                Delete
              </Button>
            )}
            
            <CommentReactions 
              commentId={comment.id}
              reactionCount={comment.reaction_count}
              currentUser={currentUser}
            />
          </Stack>
          
          {isReplying && (
            <Card className="comment-reply-form">
              <form onSubmit={handleReply}>
                <Stack direction="column" spacing="sm">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.username || 'user'}...`}
                    rows={2}
                    maxLength={2000}
                  />
                  <Stack direction="row" spacing="sm">
                    <Button type="submit" variant="primary" size="sm">
                      Reply
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsReplying(false)}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Card>
          )}
          
          {!repliesVisible && comment.reply_count > 0 && (
            <ReplyLoader 
              commentId={comment.id}
              replyCount={comment.reply_count}
              onLoadReplies={loadReplies}
              isLoading={repliesLoading}
            />
          )}
          
          {repliesVisible && loadedReplies.length > 0 && (
            <Stack direction="column" spacing="md" className="comment-replies">
              {loadedReplies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}