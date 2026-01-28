import React, { useState, useEffect } from 'react';
import { Button } from '@/ui-system/components/button';
import { BasicSelect } from '@/ui-system/components/form';
import { Badge } from '@/ui-system/components/feedback';
import { Card } from '@/ui-system/components/card';
import { Heading, Text } from '@/ui-system/components/typography';
import { Stack } from '@/ui-system/components/utility';
import { Icon } from '@/ui-system/icons/components';
import { useNotifications } from '@/ui-system/components/feedback';

interface Comment {
  id: number;
  content: string;
  username: string;
  post_title: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  created_at: string;
  flagged_count: number;
}

interface CommentStats {
  total: number;
  pending: number;
  flagged: number;
  approved: number;
}

export function CommentsManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<CommentStats>({
    total: 0,
    pending: 0,
    flagged: 0,
    approved: 0
  });
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const [loading, setLoading] = useState(true);
  const { showToastSuccess, showToastError, showModalError } = useNotifications();
  
  useEffect(() => {
    loadComments();
    loadStats();
  }, [filters]);
  
  const loadComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      
      const response = await fetch(`/api/admin/comments?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      showModalError('Failed to load comments', 'Loading Error');
    } finally {
      setLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/comments/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      showToastError('Failed to load comment statistics');
    }
  };
  
  const handleApprove = async (commentId: number) => {
    try {
      await fetch(`/api/admin/comments/${commentId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, status: 'approved' as const }
          : comment
      ));
      showToastSuccess('Comment approved successfully');
    } catch (error) {
      console.error('Error approving comment:', error);
      showModalError('Failed to approve comment', 'Approval Error');
    }
  };
  
  const handleReject = async (commentId: number) => {
    try {
      await fetch(`/api/admin/comments/${commentId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, status: 'rejected' as const }
          : comment
      ));
      showToastSuccess('Comment rejected successfully');
    } catch (error) {
      console.error('Error rejecting comment:', error);
      showModalError('Failed to reject comment', 'Rejection Error');
    }
  };
  
  const handleDelete = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      showToastSuccess('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showModalError('Failed to delete comment', 'Deletion Error');
    }
  };
  
  const renderStatus = (status: string) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      flagged: 'error'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status && status.charAt ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </Badge>
    );
  };
  
  return (
    <div className="comments-manager">
      <Stack direction="column" spacing="lg">
        <div className="comments-manager__header">
          <Heading level={2}>Comment Management</Heading>
          <Stack direction="row" spacing="md" className="comments-manager__stats">
            <Card>
              <Stack direction="column" spacing="sm" align="center">
                <Icon name="book" size={24} />
                <Text weight="bold">{stats.total}</Text>
                <Text size="sm">Total Comments</Text>
              </Stack>
            </Card>
            <Card>
              <Stack direction="column" spacing="sm" align="center">
                <Icon name="alert-circle" size={24} />
                <Text weight="bold">{stats.pending}</Text>
                <Text size="sm">Pending</Text>
              </Stack>
            </Card>
            <Card>
              <Stack direction="column" spacing="sm" align="center">
                <Icon name="x" size={24} />
                <Text weight="bold">{stats.flagged}</Text>
                <Text size="sm">Flagged</Text>
              </Stack>
            </Card>
          </Stack>
        </div>
        
        <Card className="comments-manager__filters">
          <Stack direction="row" spacing="md">
            <BasicSelect
              value={filters.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Comments</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
            </BasicSelect>
          </Stack>
        </Card>
        
        <Card>
          <Stack direction="column" spacing="md">
            {loading ? (
              <Text>Loading comments...</Text>
            ) : (
              comments.map(comment => (
                <Card key={comment.id} className="comment-item">
                  <Stack direction="column" spacing="sm">
                    <Stack direction="row" justify="between" align="start">
                      <Stack direction="column" spacing="xs">
                        <Text weight="medium">{comment.username}</Text>
                        <Text size="sm" color="muted">{comment.post_title}</Text>
                      </Stack>
                      <Stack direction="row" spacing="sm" align="center">
                        {renderStatus(comment.status)}
                        <Text size="sm" color="muted">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </Text>
                      </Stack>
                    </Stack>
                    
                    <Text className="comment-content">
                      {comment.content.length > 200 
                        ? `${comment.content.substring(0, 200)}...` 
                        : comment.content
                      }
                    </Text>
                    
                    <Stack direction="row" spacing="sm">
                      {comment.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(comment.id)}
                          >
                            <Icon name="save" size={14} />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(comment.id)}
                          >
                            <Icon name="x" size={14} />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Icon name="delete" size={14} />
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))
            )}
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}