// client/src/admin/pages/blog/hooks/useBlogData.ts
import { useReducer, useEffect, useCallback } from "react";
import { blogReducer, initialState } from "../state/reducer";
import { BlogPost } from "@/types/blog";
import { blogService } from "@/services/api/blog";
import { mediaService } from "@/services/api/media";

import { useErrorHandler } from "@/hooks/useErrorHandler";
import { ErrorHandler } from "@/utils/errorHandler";
import websocketService from "@/services/websocket-service";


export const useBlogData = () => {
  const [state, dispatch] = useReducer(blogReducer, initialState);
  const { handleError } = useErrorHandler("BlogData");

  // Helper function to remove a blog post from state directly
  const removeBlogPostFromState = useCallback((postId: string) => {
    dispatch({ type: "BLOG/DELETE_SUCCESS", postId });
  }, []);

  // Get a blog post by ID, either from state or from API
  const getBlogPostById = useCallback(
    async (postId: string): Promise<BlogPost | null> => {
      try {
        // First try to find in state
        const postInState = state.posts.find((p) => p.id === postId);
        if (postInState) {
          return postInState;
        }

        // If not in state, fetch from API
        const post = await blogService.getBlogPostById(postId);

        // Add to state if found
        if (post) {
          dispatch({ type: "BLOG/UPDATE_SUCCESS", post });
        }

        return post;
      } catch (error) {
        console.error(`Error fetching blog post ${postId}:`, error);
        return null;
      }
    },
    [state.posts]
  );

  const fetchBlogPosts = useCallback(
    async (page = 1, limit = 10) => {
      dispatch({ type: "BLOG/FETCH_START" });

      try {
        // Direct API call with no-cache headers for admin panel
        const response = await fetch('/api/blog/all', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const posts = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        
        const paginatedResult = {
          data: posts.slice((page - 1) * limit, page * limit),
          total: posts.length,
          totalPages: Math.ceil(posts.length / limit)
        };

        dispatch({
          type: "BLOG/FETCH_SUCCESS",
          payload: paginatedResult.data,
          totalItems: paginatedResult.total,
          totalPages: paginatedResult.totalPages,
        });
        return paginatedResult.data;
      } catch (error) {
        const formattedError = ErrorHandler.formatError(
          error,
          "Failed to fetch blog posts"
        );
        dispatch({
          type: "BLOG/FETCH_FAILURE",
          error: formattedError.message,
        });
        handleError(error, "Failed to fetch blog posts");
        return [];
      }
    },
    [handleError]
  );

  const changePage = useCallback(
    (page: number) => {
      dispatch({ type: "BLOG/SET_PAGE", page });
      fetchBlogPosts(page, state.itemsPerPage);
    },
    [fetchBlogPosts, state.itemsPerPage]
  );

  const changeItemsPerPage = useCallback(
    (itemsPerPage: number) => {
      dispatch({ type: "BLOG/SET_ITEMS_PER_PAGE", count: itemsPerPage });
      fetchBlogPosts(1, itemsPerPage);
    },
    [fetchBlogPosts]
  );

  const deleteBlogPost = useCallback(
    async (postId: string) => {
      dispatch({ type: "BLOG/DELETE_START", postId });

      try {
        await blogService.deleteBlogPost(postId);
        
        // Refetch all data to ensure consistency
        await fetchBlogPosts(state.currentPage, state.itemsPerPage);
      } catch (error) {
        // If the error message contains 404, the post doesn't exist
        // We can consider this a successful deletion (it's already gone)
        if (error instanceof Error && error.message.includes("404")) {
          console.log(`Post ${postId} not found in database, refetching data`);
          await fetchBlogPosts(state.currentPage, state.itemsPerPage);
          return;
        }

        console.error("Error deleting blog post:", error);
        const formattedError = ErrorHandler.formatError(
          error,
          "Failed to delete blog post"
        );
        dispatch({
          type: "BLOG/DELETE_FAILURE",
          error: formattedError.message,
        });
        handleError(error, "Failed to delete blog post");
        throw formattedError;
      }
    },
    [handleError, fetchBlogPosts, state.currentPage, state.itemsPerPage]
  );

  const updateBlogPost = useCallback(
    async (post: BlogPost) => {
      dispatch({ type: "EDITOR/SET_LOADING", loading: true });

      try {
        const updatedPost = await blogService.updateBlogPost(post.id, post);
        
        // Refetch all data to ensure consistency
        await fetchBlogPosts(state.currentPage, state.itemsPerPage);

        return updatedPost;
      } catch (error) {
        console.error("Error updating blog post:", error);
        const formattedError = ErrorHandler.formatError(
          error,
          "Failed to update blog post"
        );
        dispatch({
          type: "BLOG/OPERATION_FAILURE",
          error: formattedError.message,
        });
        handleError(error, "Failed to update blog post");
        throw formattedError;
      }
    },
    [handleError, fetchBlogPosts, state.currentPage, state.itemsPerPage]
  );

  const createBlogPost = useCallback(
    async (post: Omit<BlogPost, "id" | "created_at">) => {
      dispatch({ type: "EDITOR/SET_LOADING", loading: true });

      try {
        const newPost = await blogService.createBlogPost(post);
        
        // Refetch all data to ensure consistency
        await fetchBlogPosts(1, state.itemsPerPage);
        dispatch({ type: "BLOG/SET_PAGE", page: 1 });

        return newPost;
      } catch (error) {
        console.error("Error creating blog post:", error);
        const formattedError = ErrorHandler.formatError(
          error,
          "Failed to create blog post"
        );
        dispatch({
          type: "BLOG/OPERATION_FAILURE",
          error: formattedError.message,
        });
        handleError(error, "Failed to create blog post");
        throw formattedError;
      }
    },
    [handleError, fetchBlogPosts, state.itemsPerPage]
  );

  // Fetch media for the media selector
  const fetchMedia = useCallback(async () => {
    dispatch({ type: "MEDIA/FETCH_START" });

    try {
      const media = await mediaService.getMediaFiles();
      // Filter to only include images
      const imageMedia = media.filter(
        (item) => item.mimeType && item.mimeType.startsWith("image/")
      );
      dispatch({ type: "MEDIA/FETCH_SUCCESS", payload: imageMedia });
    } catch (error) {
      console.error("Error fetching media:", error);
      const formattedError = ErrorHandler.formatError(
        error,
        "Failed to fetch media"
      );
      dispatch({
        type: "MEDIA/FETCH_FAILURE",
        error: formattedError.message,
      });
      handleError(error, "Failed to fetch media");
    }
  }, [handleError]);

  // Select a featured image for the current post
  const selectFeaturedImage = useCallback((url: string) => {
    dispatch({ type: "MEDIA/SELECT_IMAGE", url });
  }, []);

  // Show/hide media selector modal
  const showMediaSelector = useCallback(() => {
    dispatch({ type: "MEDIA/SHOW_MODAL" });
  }, []);

  const hideMediaSelector = useCallback(() => {
    dispatch({ type: "MEDIA/HIDE_MODAL" });
  }, []);

  useEffect(() => {
    // Initial load - always fresh data in admin
    dispatch({ type: "WEBSOCKET/INIT" });
    fetchBlogPosts(1, state.itemsPerPage);
    return () => {
      dispatch({ type: "WEBSOCKET/CLEANUP" });
    };
  }, []);

  // WebSocket event listeners for real-time updates
  useEffect(() => {
    console.log('Setting up WebSocket listeners for blog updates');
    
    const handleBlogUpdated = (data: any) => {
      console.log('🔄 Blog updated via WebSocket:', data);
      // Refetch data to ensure consistency
      fetchBlogPosts(state.currentPage, state.itemsPerPage);
    };

    const handleBlogCreated = (data: any) => {
      console.log('✅ Blog created via WebSocket:', data);
      // Refetch data to ensure consistency
      fetchBlogPosts(state.currentPage, state.itemsPerPage);
    };

    const handleBlogDeleted = (data: any) => {
      console.log('🗑️ Blog deleted via WebSocket:', data);
      // Refetch data to ensure consistency
      fetchBlogPosts(state.currentPage, state.itemsPerPage);
    };
    
    websocketService.subscribe('blog_updated', handleBlogUpdated);
    websocketService.subscribe('blog_created', handleBlogCreated);
    websocketService.subscribe('blog_deleted', handleBlogDeleted);
    
    console.log('WebSocket listeners registered for blog events');

    return () => {
      console.log('Cleaning up WebSocket listeners for blog events');
      websocketService.unsubscribe('blog_updated', handleBlogUpdated);
      websocketService.unsubscribe('blog_created', handleBlogCreated);
      websocketService.unsubscribe('blog_deleted', handleBlogDeleted);
    };
  }, [fetchBlogPosts, state.currentPage, state.itemsPerPage]);

  // Original WebSocket code commented out:
  /*
  useEffect(() => {
    console.log('Setting up WebSocket listeners for blog updates');
    
    const handleBlogUpdated = (data: any) => {
      console.log('🔄 Blog updated via WebSocket:', data);
      if (data && data.id) {
        const blogPost = {
          id: data.id,
          title: data.title,
          description: data.description,
          content: data.content,
          category: data.category,
          imageUrl: data.imageUrl || data.image_url,
          thumbnailUrl: data.thumbnailUrl || data.thumbnail_url,
          projectUrl: data.projectUrl || data.project_url,
          technologies: data.technologies || [],
          status: data.status,
          slug: data.slug,
          tags: data.tags || [],
          created_at: data.createdAt || data.created_at,
          updated_at: data.updatedAt || data.updated_at || data.createdAt || data.created_at,
        };
        dispatch({ type: "UPDATE_POST_SUCCESS", post: blogPost });
      }
    };

    const handleBlogCreated = (data: any) => {
      console.log('✅ Blog created via WebSocket:', data);
      if (data && data.id) {
        const blogPost = {
          id: data.id,
          title: data.title,
          description: data.description,
          content: data.content,
          category: data.category,
          imageUrl: data.imageUrl || data.image_url,
          thumbnailUrl: data.thumbnailUrl || data.thumbnail_url,
          projectUrl: data.projectUrl || data.project_url,
          technologies: data.technologies || [],
          status: data.status,
          slug: data.slug,
          tags: data.tags || [],
          created_at: data.createdAt || data.created_at,
          updated_at: data.updatedAt || data.updated_at || data.createdAt || data.created_at,
        };
        dispatch({ type: "ADD_POST", post: blogPost });
      }
    };

    const handleBlogDeleted = (data: any) => {
      console.log('🗑️ Blog deleted via WebSocket:', data);
      if (data && data.id) {
        dispatch({ type: "DELETE_POST_SUCCESS", postId: data.id });
      }
    };

    const handleTest = (data: any) => {
      console.log('✅ WebSocket test event received:', data);
    };
    
    websocketService.subscribe('blog_updated', handleBlogUpdated);
    websocketService.subscribe('blog_created', handleBlogCreated);
    websocketService.subscribe('blog_deleted', handleBlogDeleted);
    websocketService.subscribe('test', handleTest);
    
    console.log('WebSocket listeners registered for blog events');
    console.log('WebSocket connected:', websocketService.isConnected());

    return () => {
      console.log('Cleaning up WebSocket listeners for blog events');
      websocketService.unsubscribe('blog_updated', handleBlogUpdated);
      websocketService.unsubscribe('blog_created', handleBlogCreated);
      websocketService.unsubscribe('blog_deleted', handleBlogDeleted);
      websocketService.unsubscribe('test', handleTest);
    };
  }, []);
  */



  return {
    state,
    dispatch,
    fetchBlogPosts,
    getBlogPostById,
    deleteBlogPost,
    updateBlogPost,
    createBlogPost,
    fetchMedia,
    selectFeaturedImage,
    showMediaSelector,
    hideMediaSelector,
    removeBlogPostFromState,
    changePage,
    changeItemsPerPage,
  };
};
