import { useReducer, useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';

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
  replies?: Comment[];
}

interface CreateCommentData {
  postId: number;
  content: string;
  parentId?: number | null;
}

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number };
  hasMore: boolean;
}

type CommentsAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_MORE'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COMMENTS'; payload: Comment[] }
  | { type: 'APPEND_COMMENTS'; payload: Comment[] }
  | { type: 'SET_PAGINATION'; payload: { page: number; limit: number; total: number } }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'UPDATE_COMMENT'; payload: { id: number; comment: Partial<Comment> } }
  | { type: 'DELETE_COMMENT'; payload: number }
  | { type: 'UPDATE_REPLY_COUNT'; payload: { parentId: number; increment: number } };

function commentsReducer(state: CommentsState, action: CommentsAction): CommentsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_LOADING_MORE':
      return { ...state, loadingMore: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    case 'APPEND_COMMENTS':
      // Filter out duplicates when appending
      const existingIds = new Set(state.comments.map(c => c.id));
      const newComments = action.payload.filter(c => !existingIds.has(c.id));
      
      return { 
        ...state, 
        comments: [...state.comments, ...newComments]
      };
    case 'SET_PAGINATION':
      const hasMore = state.pagination.page * state.pagination.limit < action.payload.total;
      return { ...state, pagination: action.payload, hasMore };
    case 'ADD_COMMENT':
      // Prevent duplicate comments
      const commentExists = state.comments.some(c => c.id === action.payload.id);
      if (commentExists) return state;
      
      return { 
        ...state, 
        comments: [action.payload, ...state.comments],
        pagination: { ...state.pagination, total: state.pagination.total + 1 }
      };
    case 'UPDATE_COMMENT':
      return {
        ...state,
        comments: state.comments.map(c => 
          c.id === action.payload.id ? { ...c, ...action.payload.comment } : c
        )
      };
    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter(c => c.id !== action.payload),
        pagination: { ...state.pagination, total: Math.max(0, state.pagination.total - 1) }
      };
    case 'UPDATE_REPLY_COUNT':
      return {
        ...state,
        comments: state.comments.map(c => 
          c.id === action.payload.parentId 
            ? { ...c, reply_count: c.reply_count + action.payload.increment }
            : c
        )
      };
    default:
      return state;
  }
}

export function useComments(postId: number, isVisible: boolean = true) {
  const [state, dispatch] = useReducer(commentsReducer, {
    comments: [],
    loading: false,
    loadingMore: false,
    error: null,
    pagination: { page: 1, limit: 5, total: 0 },
    hasMore: true
  });
  const [loadedReplies, setLoadedReplies] = useState<{[key: number]: Comment[]}>({});
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<number>>(new Set());
  const { socket } = useWebSocket();

  const loadComments = async (page: number = 1, append: boolean = false) => {
    if (!isVisible) return;
    
    if (append) {
      dispatch({ type: 'SET_LOADING_MORE', payload: true });
    } else {
      dispatch({ type: 'SET_LOADING', payload: true });
    }
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Add artificial delay to show loading animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`🔍 Loading comments: page=${page}, limit=${state.pagination.limit}`);
      const response = await fetch(`/api/comments/${postId}?page=${page}&limit=${state.pagination.limit}`);
      const data = await response.json();
      console.log(`📊 Received ${data.data?.length || 0} comments, total: ${data.pagination?.total || 0}`);
      
      if (data.success) {
        if (append) {
          dispatch({ type: 'APPEND_COMMENTS', payload: data.data || [] });
        } else {
          dispatch({ type: 'SET_COMMENTS', payload: data.data || [] });
        }
        console.log('📄 Pagination data:', data.pagination);
        dispatch({ type: 'SET_PAGINATION', payload: { ...state.pagination, ...data.pagination } });
      } else {
        throw new Error(data.error || 'Failed to load comments');
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      if (!append) {
        dispatch({ type: 'SET_COMMENTS', payload: [] });
      }
    } finally {
      if (append) {
        dispatch({ type: 'SET_LOADING_MORE', payload: false });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  const loadMoreComments = async () => {
    if (state.loadingMore || !state.hasMore) return;
    
    const nextPage = state.pagination.page + 1;
    await loadComments(nextPage, true);
  };

  const loadReplies = async (commentId: number): Promise<Comment[]> => {
    try {
      const response = await fetch(`/api/comments/${commentId}/replies`);
      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.error || 'Failed to load replies');
      }
    } catch (err: any) {
      console.error('Error loading replies:', err);
      return [];
    }
  };

  const createComment = async (data: CreateCommentData) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication required');

    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to create comment');

    // Don't add to local state - WebSocket will handle real-time updates
    return result.data;
  };

  const updateComment = async (id: number, content: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication required');

    const response = await fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Failed to update comment');

    // Don't update local state - WebSocket will handle real-time updates
    return result.data;
  };

  const deleteComment = async (id: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication required');

    console.log('🗑️ Client: Deleting comment ID:', id);
    console.log('🔑 Client: Using token:', token ? 'Present' : 'Missing');

    const response = await fetch(`/api/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📡 Client: Response status:', response.status);
    const result = await response.json();
    console.log('📊 Client: Response data:', result);
    
    if (!result.success) {
      if (response.status === 403) {
        throw new Error('You can only delete your own comments');
      } else if (response.status === 404) {
        throw new Error('Comment not found or already deleted');
      } else if (response.status === 401) {
        throw new Error('Please log in again to delete comments');
      }
      throw new Error(result.error || 'Failed to delete comment');
    }

    // Don't update local state - WebSocket will handle real-time updates
    console.log('✅ Client: Comment deletion will be handled by WebSocket');
  };

  useEffect(() => {
    loadComments(1);
  }, [postId, isVisible]);

  // WebSocket event listeners
  useEffect(() => {
    if (!socket || !isVisible) return;
    
    // Ensure WebSocket is connected
    if (!socket.isConnected()) {
      console.log('🔌 WebSocket not connected, attempting to connect...');
      socket.connect();
    }

    const handleCommentCreated = (data: any) => {
      console.log('🆕 WebSocket: Comment created event received:', data);
      
      if (data.postId == postId) {
        if (!data.isReply) {
          dispatch({ type: 'ADD_COMMENT', payload: data.comment });
          console.log('✅ WebSocket: Added new top-level comment');
        } else {
          const parentId = data.comment.parent_id;
          dispatch({ type: 'UPDATE_REPLY_COUNT', payload: { parentId, increment: 1 } });
          
          // Always ensure replies are loaded and expanded when a new reply is added
          setLoadedReplies(prev => {
            if (prev[parentId]) {
              // Replies already loaded - just add the new reply
              console.log('✅ Adding reply to existing loaded replies for parent', parentId);
              return {
                ...prev,
                [parentId]: [...prev[parentId], data.comment]
              };
            } else {
              // Replies not loaded - load all replies including the new one
              console.log('🔄 Auto-loading replies for parent', parentId, 'due to new reply');
              loadRepliesForComment(parentId, 1);
              return prev;
            }
          });
          
          // Auto-expand replies section
          setExpandedReplies(prev => {
            const newExpanded = new Set(prev);
            newExpanded.add(parentId);
            return newExpanded;
          });
          
          // Scroll to the new reply after a short delay
          setTimeout(() => {
            const replyElement = document.querySelector(`[data-reply-id="${data.comment.id}"]`);
            if (replyElement) {
              replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
          
          console.log('✅ WebSocket: Auto-expanded replies and added new reply for parent comment', parentId);
        }
      }
    };

    const handleCommentUpdated = (data: any) => {
      console.log('✏️ WebSocket: Comment updated event received:', data);
      dispatch({ type: 'UPDATE_COMMENT', payload: { id: data.commentId, comment: data.comment } });
      console.log('✅ WebSocket: Updated comment in list');
    };

    const handleCommentDeleted = (data: any) => {
      console.log('🗑️ WebSocket: Comment deleted event received:', data);
      
      if (data.postId == postId) {
        if (!data.isReply) {
          dispatch({ type: 'DELETE_COMMENT', payload: data.commentId });
          console.log('✅ WebSocket: Removed top-level comment from list');
        } else {
          // Find which parent comment had this reply and decrement count
          const parentComment = state.comments.find(c => 
            loadedReplies[c.id]?.some(reply => reply.id === data.commentId)
          );
          
          if (parentComment) {
            dispatch({ type: 'UPDATE_REPLY_COUNT', payload: { parentId: parentComment.id, increment: -1 } });
          }
          
          // Remove reply from loaded replies
          setLoadedReplies(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach((parentIdStr: string) => {
              const parentId = parseInt(parentIdStr);
              if (updated[parentId]) {
                updated[parentId] = updated[parentId].filter((reply: Comment) => reply.id !== data.commentId);
              }
            });
            return updated;
          });
          
          console.log('✅ WebSocket: Updated reply count and removed reply after deletion');
        }
      }
    };

    console.log('📡 Subscribing to comment WebSocket events...');
    socket.subscribe('COMMENT_CREATED', handleCommentCreated);
    socket.subscribe('COMMENT_UPDATED', handleCommentUpdated);
    socket.subscribe('COMMENT_DELETED', handleCommentDeleted);

    return () => {
      socket.unsubscribe('COMMENT_CREATED', handleCommentCreated);
      socket.unsubscribe('COMMENT_UPDATED', handleCommentUpdated);
      socket.unsubscribe('COMMENT_DELETED', handleCommentDeleted);
    };
  }, [socket, postId, isVisible]);

  const loadRepliesForComment = async (commentId: number, page: number = 1) => {
    setLoadingReplies(prev => new Set([...prev, commentId]));
    
    try {
      const response = await fetch(`/api/comments/${commentId}/replies?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        const replies = data.data || [];
        setLoadedReplies(prev => ({ ...prev, [commentId]: replies }));
      }
    } catch (err: any) {
      console.error('Error loading replies:', err);
    } finally {
      setLoadingReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  return {
    comments: state.comments,
    loading: state.loading,
    loadingMore: state.loadingMore,
    hasMore: state.hasMore,
    error: state.error,
    pagination: state.pagination,
    loadedReplies,
    expandedReplies,
    loadingReplies,
    setExpandedReplies,
    loadComments,
    loadMoreComments,
    loadReplies,
    loadRepliesForComment,
    createComment,
    updateComment,
    deleteComment
  };
}