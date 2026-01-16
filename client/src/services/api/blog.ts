// client/src/services/api/blog.ts
import { BlogPost } from "@/types/blog";
// Cache disabled for admin panel

// Direct HTTP client without cache for admin operations
const directHttpClient = {
  get: async <T>(url: string): Promise<T> => {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  post: async <T>(url: string, data: any): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  put: async <T>(url: string, data: any): Promise<T> => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  delete: async <T>(url: string): Promise<T> => {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
};
import {
  BackendBlogPost,
  BackendBlogPostInput,
  ApiResponse,
  PaginatedResponse,
  SearchResponse,
} from "@/../../shared/types/api";

// Define a standard API error structure
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Define pagination result interface
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Transform a backend blog post model to frontend blog post model
 */
const transformBackendBlogPost = (backendBlogPost: any): BlogPost => {
  // Handle both camelCase and snake_case field names from database
  const createdAt = backendBlogPost.created_at || backendBlogPost.createdAt;
  const updatedAt = backendBlogPost.updated_at || backendBlogPost.updatedAt;
  const imageUrl = backendBlogPost.imageUrl || backendBlogPost.image_url;
  const thumbnailUrl = backendBlogPost.thumbnailUrl || backendBlogPost.thumbnail_url;
  const projectUrl = backendBlogPost.projectUrl || backendBlogPost.project_url;
  
  // Handle date transformation
  
  // Clean content from HTML entities and malformed HTML
  let cleanContent = backendBlogPost.content || "";
  cleanContent = cleanContent
    .replace(/&nbsp;/g, ' ')  // Replace non-breaking spaces
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
  
  const createdAtISO = createdAt && createdAt !== 'null' && createdAt !== 'undefined'
    ? new Date(createdAt).toISOString() 
    : new Date().toISOString();
  const updatedAtISO = updatedAt && updatedAt !== 'null' && updatedAt !== 'undefined'
    ? new Date(updatedAt).toISOString() 
    : createdAtISO;
  
  return {
    id: backendBlogPost.id.toString(),
    title: backendBlogPost.title || "",
    description: backendBlogPost.description || "",
    content: cleanContent,
    categoryId: backendBlogPost.category_id || backendBlogPost.categoryId,
    imageUrl: imageUrl || null,
    thumbnailUrl: thumbnailUrl || null,
    projectUrl: projectUrl || null,
    technologies: backendBlogPost.technologies || [],
    status: backendBlogPost.status || "draft",
    slug: backendBlogPost.slug || null,
    tags: backendBlogPost.tags || [],
    created_at: createdAtISO,
    updated_at: updatedAtISO,
  };
};

/**
 * Transform a frontend blog post model to backend blog post input
 */
const transformToBackendBlogPost = (
  post: Partial<BlogPost>
): BackendBlogPostInput => {
  // Process content to handle embedded images and clean HTML
  let processedContent = post.content || "";

  // Clean up HTML entities and malformed content
  processedContent = processedContent
    .replace(/&nbsp;/g, ' ')  // Replace non-breaking spaces
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();

  // Check if content is too large and might cause server issues
  if (processedContent.length > 500000) {
    // 500KB limit
    console.warn("Content exceeds 500KB, truncating to prevent server errors");
    processedContent = processedContent.substring(0, 500000);
  }

  // Replace base64 encoded images with placeholders to reduce payload size
  processedContent = processedContent.replace(
    /src="data:image\/[^;]+;base64,[^"]+"/g,
    'src="[Image: Embedded]" data-embedded-image="true"'
  );

  // Create the backend blog post object with camelCase (API layer handles transformation)
  const backendBlogPost: BackendBlogPostInput = {
    title: post.title || "",
    description: post.description || "",
    content: processedContent,
    categoryId: post.categoryId,
    imageUrl: post.imageUrl || undefined,
    thumbnailUrl: post.thumbnailUrl || undefined,
    projectUrl: post.projectUrl || undefined,
    technologies: Array.isArray(post.technologies) ? post.technologies : [],
    status: post.status || "draft",
    slug: post.slug || undefined,
    tags: Array.isArray(post.tags) ? post.tags : [],
  };

  return backendBlogPost;
};

// Cache functions removed - admin panel uses direct API calls only

// Function to manually sort blog posts by creation date (newest first)
const sortBlogPostsByDate = (posts: BlogPost[]): BlogPost[] => {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA; // Descending order (newest first)
  });
};

export const blogService = {
  // Refresh all blog data
  refreshBlog: async (): Promise<BlogPost[]> => {
    return blogService.refreshBlogPosts();
  },
  
  // Get all blog posts
  getAll: async (): Promise<BlogPost[]> => {
    try {
      console.log('Fetching blog posts from /api/blog/all');
      const response = await directHttpClient.get<
        | ApiResponse<BackendBlogPost[]>
        | PaginatedResponse<BackendBlogPost>
        | BackendBlogPost[]
      >("/api/blog/all");

      console.log('Raw API response:', response);

      // Handle different response formats
      let backendBlogPosts: BackendBlogPost[];

      if (Array.isArray(response)) {
        backendBlogPosts = response;
      } else if ("data" in response && Array.isArray(response.data)) {
        backendBlogPosts = response.data;
      } else {
        backendBlogPosts = [];
      }

      console.log('Backend blog posts:', backendBlogPosts.length, backendBlogPosts);
      if (backendBlogPosts.length > 0) {
        console.log('Sample backend post dates:', {
          id: backendBlogPosts[0].id,
          created_at: backendBlogPosts[0].created_at,
          updated_at: backendBlogPosts[0].updated_at
        });
      }

      // Transform backend model to frontend model
      const blogPosts = backendBlogPosts.map(transformBackendBlogPost);

      console.log('Transformed blog posts:', blogPosts.length, blogPosts);
      if (blogPosts.length > 0) {
        console.log('Final transformed post dates:', {
          id: blogPosts[0].id,
          created_at: blogPosts[0].created_at,
          updated_at: blogPosts[0].updated_at,
          created_at_type: typeof blogPosts[0].created_at,
          updated_at_type: typeof blogPosts[0].updated_at
        });
      }

      // Sort blog posts manually by creation date (newest first)
      return sortBlogPostsByDate(blogPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error as Error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  // Get paginated blog posts
  getPaginatedBlogPosts: async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<BlogPost>> => {
    try {
      const response = await directHttpClient.get<
        | ApiResponse<BackendBlogPost[]>
        | PaginatedResponse<BackendBlogPost>
        | BackendBlogPost[]
      >("/api/blog");

      let data = response;

      // Handle different response formats
      let backendBlogPosts: BackendBlogPost[] = [];

      if (Array.isArray(data)) {
        backendBlogPosts = data;
      } else if ("data" in data && Array.isArray(data.data)) {
        backendBlogPosts = data.data;
      }

      // Transform backend model to frontend model
      let transformedBlogPosts = backendBlogPosts.map(transformBackendBlogPost);

      // Sort blog posts manually by creation date (newest first)
      transformedBlogPosts = sortBlogPostsByDate(transformedBlogPosts);

      // Calculate pagination manually
      const total = transformedBlogPosts.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, total);
      const paginatedData = transformedBlogPosts.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching paginated blog posts:", error as Error);
      // Return empty result instead of throwing to prevent UI errors
      return {
        data: [],
        total: 0,
        totalPages: 1,
        currentPage: page,
      };
    }
  },

  getBlogPostById: async (id: number | string): Promise<BlogPost | null> => {
    // Convert string ID to number if needed (server expects numeric ID)
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    if (isNaN(numericId)) {
      console.error(`Invalid blog post ID: ${id} is not a valid number`);
      throw {
        message: `Invalid blog post ID: ${id} is not a valid number`,
        status: 400,
        code: "INVALID_BLOG_POST_ID",
      };
    }

    try {
      const response = await directHttpClient.get<
        ApiResponse<BackendBlogPost> | BackendBlogPost
      >(`/api/blog/${numericId}`);

      // Handle different response formats
      let backendBlogPost: BackendBlogPost;

      if ("data" in response && response.data) {
        backendBlogPost = response.data;
      } else if ("id" in response) {
        backendBlogPost = response as BackendBlogPost;
      } else {
        throw {
          message: `Blog post with ID ${numericId} not found`,
          status: 404,
        };
      }

      const transformedBlogPost = transformBackendBlogPost(backendBlogPost);
      return transformedBlogPost;
    } catch (error) {
      console.error(`Error fetching blog post ${numericId}:`, error as Error);
      throw {
        message:
          error instanceof Error
            ? error.message
            : `Failed to fetch blog post ${numericId}`,
        status: (error as any).status || 500,
        code: "BLOG_POST_FETCH_ERROR",
      };
    }
  },

  // Force refresh blog posts data
  refreshBlogPosts: async (): Promise<BlogPost[]> => {
    try {
      // Cache disabled for admin panel - using WebSocket updates only

      const response = await directHttpClient.get<
        | ApiResponse<BackendBlogPost[]>
        | PaginatedResponse<BackendBlogPost>
        | BackendBlogPost[]
      >("/api/blog/all");

      let data = response;

      // Handle different response formats
      let backendBlogPosts: BackendBlogPost[];

      if (Array.isArray(data)) {
        backendBlogPosts = data;
      } else if ("data" in data && Array.isArray(data.data)) {
        backendBlogPosts = data.data;
      } else {
        console.error("Unexpected response format:", data);
        backendBlogPosts = [];
      }

      // Transform backend model to frontend model
      const transformedBlogPosts = backendBlogPosts.map(transformBackendBlogPost);

      // Sort blog posts manually by creation date (newest first)
      const sortedBlogPosts = sortBlogPostsByDate(transformedBlogPosts);

      return sortedBlogPosts;
    } catch (error) {
      console.error("Error refreshing blog posts:", error as Error);
      return [];
    }
  },

  // Add admin methods
  createBlogPost: async (
    post: Omit<BlogPost, "id" | "created_at" | "updated_at">
  ): Promise<BlogPost> => {
    console.log('Creating blog post with data:', post);
    // Map frontend BlogPost type to backend structure
    const backendBlogPost = transformToBackendBlogPost(post);
    console.log('Transformed to backend format:', backendBlogPost);

    try {
      const response = await directHttpClient.post<
        ApiResponse<BackendBlogPost> | BackendBlogPost
      >("/api/blog", backendBlogPost);

      // Handle different response formats
      let newBackendBlogPost: BackendBlogPost;

      if ("data" in response && response.data) {
        newBackendBlogPost = response.data;
      } else if ("id" in response) {
        newBackendBlogPost = response as BackendBlogPost;
      } else {
        console.error(
          "Invalid response format for blog post creation:",
          response
        );
        throw new Error("Failed to create blog post - invalid response");
      }

      const transformedBlogPost = transformBackendBlogPost(newBackendBlogPost);

      // Cache disabled for admin panel - using WebSocket updates only

      return transformedBlogPost;
    } catch (error) {
      console.error("Error creating blog post:", error as Error);
      throw error;
    }
  },

  updateBlogPost: async (
    id: string | number,
    post: Partial<BlogPost>
  ): Promise<BlogPost> => {
    // Convert string ID to number if needed (server expects numeric ID)
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    if (isNaN(numericId)) {
      console.error(`Invalid blog post ID: ${id} is not a valid number`);
      throw new Error(`Invalid blog post ID: ${id} is not a valid number`);
    }

    // Map frontend BlogPost type to backend structure
    const backendBlogPost = transformToBackendBlogPost(post);

    try {
      // Make the API request with numeric ID
      const response = await directHttpClient.put<
        ApiResponse<BackendBlogPost> | BackendBlogPost
      >(`/api/blog/${numericId}`, backendBlogPost);

      // Handle different response formats
      let updatedBackendBlogPost: BackendBlogPost;

      if ("data" in response && response.data) {
        updatedBackendBlogPost = response.data;
      } else if ("id" in response) {
        updatedBackendBlogPost = response as BackendBlogPost;
      } else {
        console.error(
          `Invalid response format for blog post update ${numericId}:`,
          response
        );
        throw new Error(
          `Failed to update blog post ${numericId} - invalid response`
        );
      }

      // Transform and return the updated blog post
      const transformedBlogPost = transformBackendBlogPost(updatedBackendBlogPost);

      // Ensure the content from the original blog post is preserved in the transformed blog post
      // This fixes the issue where content might be lost after refresh
      if (
        post.content &&
        (!transformedBlogPost.content || transformedBlogPost.content === "")
      ) {
        transformedBlogPost.content = post.content;
      }

      // Cache disabled for admin panel - using WebSocket updates only

      return transformedBlogPost;
    } catch (error) {
      console.error(`Error updating blog post ${numericId}:`, error as Error);
      throw error;
    }
  },

  deleteBlogPost: async (id: string | number): Promise<void> => {
    // Convert string ID to number if needed (server expects numeric ID)
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    if (isNaN(numericId)) {
      console.error(`Invalid blog post ID: ${id} is not a valid number`);
      throw new Error(`Invalid blog post ID: ${id} is not a valid number`);
    }

    try {
      // The server will handle cache invalidation for us
      const response = await directHttpClient.delete<ApiResponse<void> | void>(
        `/api/blog/${numericId}`
      );

      // Check if the response indicates failure
      if (response && typeof response === "object" && "error" in response) {
        throw new Error(String(response.error));
      }

      console.log(`✅ Blog post ${numericId} deleted successfully`);
    } catch (error) {
      // If it's a 404 error, consider the delete successful (blog post already gone)
      if (error instanceof Error && error.message.includes("404")) {
        console.warn(
          `Blog post with ID ${numericId} not found, considering it already deleted`
        );
        return; // Return successfully as the blog post is already gone
      }

      console.error(`Error deleting blog post ${numericId}:`, error as Error);
      throw error;
    }
  },

  // Search blog posts
  searchBlogPosts: async (query: string, category?: string, limit: number = 10): Promise<SearchResponse> => {
    try {
      const params = new URLSearchParams({ q: query, limit: limit.toString() });
      if (category) params.append('category', category);
      
      const response = await directHttpClient.get<SearchResponse>(`/api/blog/search?${params}`);
      return response;
    } catch (error) {
      console.error('Error searching blog posts:', error);
      return {
        results: [],
        total: 0,
        query
      };
    }
  },
};
