import { useState, useEffect } from 'react';
import { Card } from '@/ui-system/components/card';
import { Button } from '@/ui-system/components/button';
import { Tabs } from '@/ui-system/components/navigation';
import { Text, Link } from '@/ui-system/components/typography';
import { Stack } from '@/ui-system/components/utility';
import { Icon } from '@/ui-system/icons/components';
import { Pagination } from '@/ui-system/components/pagination';
import websocketService from '@/services/websocket-service';
import { formatDistanceToNow } from 'date-fns';

interface UserComment {
  id: number;
  content: string;
  created_at: string;
  post_title: string;
  post_slug: string;
  post_id: number;
  parent_content?: string;
  parent_author?: string;
  reply_count: number;
  reaction_count: number;
}

interface CommentNotification {
  id: number;
  type: string;
  created_at: string;
  read_at?: string;
  comment_content: string;
  post_title: string;
  post_slug: string;
  triggered_by_name: string;
  comment_id: number;
  post_id?: number;
}

export function CommentArchive() {
  const [comments, setComments] = useState<UserComment[]>([]);
  const [notifications, setNotifications] = useState<CommentNotification[]>([]);
  const [activeTab, setActiveTab] = useState('comments');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    loadUserComments();
    loadNotifications();
    
    // Subscribe to WebSocket events using BlogPro's service
    websocketService.subscribe('comment_created', handleNewReply);
    websocketService.subscribe('comment_deleted', handleCommentDeleted);
    websocketService.subscribe('notification_new', handleNewNotification);
    
    return () => {
      websocketService.unsubscribe('comment_created', handleNewReply);
      websocketService.unsubscribe('comment_deleted', handleCommentDeleted);
      websocketService.unsubscribe('notification_new', handleNewNotification);
    };
  }, [filter, currentPage]);
  
  const loadUserComments = async () => {
    try {
      const response = await fetch(`/api/user/comments?page=${currentPage}&filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data);
        setTotalPages(Math.ceil(data.pagination.total / data.pagination.limit));
      }
    } catch (error) {
      console.error('Error loading user comments:', error);
    }
  };
  
  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/user/comment-notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: CommentNotification) => !n.read_at).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };
  
  const handleNewReply = (data: any) => {
    setComments(prev => prev.map(comment => 
      comment.id === data.commentId 
        ? { ...comment, reply_count: comment.reply_count + 1 }
        : comment
    ));
  };
  
  const handleCommentDeleted = (data: any) => {
    setComments(prev => prev.filter(comment => comment.id !== data.commentId));
  };
  
  const handleNewNotification = (notification: CommentNotification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };
  
  const handleMarkRead = async (notificationId: number) => {
    try {
      await fetch(`/api/user/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  return (
    <div className="comment-archive">
      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        items={[
          {
            id: 'comments',
            label: 'My Comments',
            content: (
              <Stack direction="column" spacing="md">
                <div className="comment-archive__filters">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All Comments
                  </Button>
                  <Button
                    variant={filter === 'root' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('root')}
                  >
                    Original Comments
                  </Button>
                  <Button
                    variant={filter === 'replies' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('replies')}
                  >
                    Replies
                  </Button>
                </div>
                
                <Stack direction="column" spacing="sm">
                  {comments.map(comment => (
                    <CommentArchiveItem
                      key={comment.id}
                      comment={comment}
                    />
                  ))}
                </Stack>
                
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </Stack>
            )
          },
          {
            id: 'notifications',
            label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
            content: (
              <Stack direction="column" spacing="sm">
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </Stack>
            )
          }
        ]}
      />
    </div>
  );
}

function CommentArchiveItem({ comment }: { comment: UserComment }) {
  const handleViewInContext = () => {
    window.open(`/blog/${comment.post_id}#comment-${comment.id}`, '_blank');
  };

  return (
    <Card className="comment-archive-item">
      <Stack direction="column" spacing="md">
        <div className="comment-archive-item__header">
          <Stack direction="row" justify="between" align="start">
            <div className="comment-archive-item__meta">
              <div className="comment-archive-item__type">
                <Icon 
                  name={comment.parent_content ? 'reply' : 'email'} 
                  size={16} 
                  className="comment-archive-item__type-icon"
                />
                <Text size="sm" color="muted">
                  {comment.parent_content ? 'Reply to comment' : 'Original comment'}
                </Text>
              </div>
              <Link 
                href={`/blog/${comment.post_id}`}
                className="comment-archive-item__post-link"
              >
                <Text weight="medium" className="comment-archive-item__post-title">
                  {comment.post_title || `Post #${comment.post_id}`}
                </Text>
              </Link>
            </div>
            <div className="comment-archive-item__date">
              <Text size="sm" color="muted">
                {formatDistanceToNow(new Date(comment.created_at))} ago
              </Text>
            </div>
          </Stack>
        </div>
        
        {comment.parent_content && (
          <div className="comment-archive-item__parent">
            <div className="comment-archive-item__parent-header">
              <Icon name="arrow-right" size={14} />
              <Text size="sm" color="muted" weight="medium">
                Replying to {comment.parent_author}
              </Text>
            </div>
            <div className="comment-archive-item__parent-content">
              <Text size="sm" className="comment-archive-item__parent-text">
                "{comment.parent_content.length > 120 ? 
                  comment.parent_content.substring(0, 120) + '...' : 
                  comment.parent_content}"
              </Text>
            </div>
          </div>
        )}
        
        <div className="comment-archive-item__content">
          <Text className="comment-archive-item__text">
            {comment.content}
          </Text>
        </div>
        
        <div className="comment-archive-item__footer">
          <Stack direction="row" justify="between" align="center">
            <Stack direction="row" spacing="lg" className="comment-archive-item__stats">
              {comment.reply_count > 0 && (
                <div className="comment-archive-item__stat">
                  <Icon name="reply" size={14} />
                  <Text size="sm">{comment.reply_count}</Text>
                </div>
              )}
              {comment.reaction_count > 0 && (
                <div className="comment-archive-item__stat">
                  <Icon name="heart" size={14} />
                  <Text size="sm">{comment.reaction_count}</Text>
                </div>
              )}
            </Stack>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewInContext}
              className="comment-archive-item__view-btn"
            >
              <Icon name="arrow-right" size={14} />
              View in context
            </Button>
          </Stack>
        </div>
      </Stack>
    </Card>
  );
}

function NotificationItem({ 
  notification, 
  onMarkRead 
}: { 
  notification: CommentNotification;
  onMarkRead: (id: number) => void;
}) {
  const isUnread = !notification.read_at;
  
  return (
    <Card className={`notification-item ${isUnread ? 'notification-item--unread' : ''}`}>
      <Stack direction="row" spacing="md" align="start">
        <div className="notification-item__icon">
          <Icon 
            name={notification.type === 'reply' ? 'reply' : 'heart'} 
            size={20} 
          />
        </div>
        
        <Stack direction="column" spacing="xs" className="notification-item__content">
          <Text weight={isUnread ? 'medium' : 'normal'}>
            <strong>{notification.triggered_by_name}</strong>
            {notification.type === 'reply' ? ' replied to your comment' : ' reacted to your comment'}
            {' on '}
            <Link href={`/blog/${notification.post_id || notification.comment_id}#comment-${notification.comment_id}`}>
              {notification.post_title}
            </Link>
          </Text>
          
          <Text size="sm" color="muted">
            {formatDistanceToNow(new Date(notification.created_at))} ago
          </Text>
          
          {isUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(notification.id)}
            >
              Mark as read
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}