import { Router } from "express";
import { storage } from "../../services/storage";
import { blogPosts } from "../../../shared/types/schema";
import { createInsertSchema } from "drizzle-zod";

// Create insert schema from the blogPosts table
const insertBlogPostSchema = createInsertSchema(blogPosts);
import { z } from "zod";
import { asyncHandler } from "../../middleware/errorHandler";
import { BadRequestError, NotFoundError, ValidationError } from "../../../shared/utils/errors";
import { createSuccessResponse, createPaginatedResponse } from "../../../shared/types/api-responses";
import { broadcastUpdate } from "../../websocket";
import { clearApiCache } from "../../middleware/apiCache";
import { advancedCache, invalidateCache } from "../../middleware/advancedCache";
import { setCacheHeaders } from "../../middleware/cacheHeaders";
import * as blogService from "../../services/blogService";
import { pool } from "../../db/db";
import './swagger';

// Transform snake_case database result to camelCase for API response
const transformFromDbFormat = (data: any) => {
  if (!data) return data;
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    content: data.content,
    categoryId: data.categoryId || data.category_id,
    imageUrl: data.imageUrl || data.image_url,
    thumbnailUrl: data.thumbnailUrl || data.thumbnail_url,
    projectUrl: data.projectUrl || data.project_url,
    technologies: data.technologies || [],
    tags: data.tags || [],
    slug: data.slug,
    status: data.status,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
  };
};

const router = Router();

// Database health check endpoint
router.get("/health", asyncHandler(async (_, res) => {
  try {
    console.log('🏥 Health check: Testing database connection...');
    const testQuery = await storage.getBlogPosts();
    console.log(`🏥 Health check: Database query successful, found ${testQuery.length} posts`);
    res.json({
      success: true,
      message: 'Database connection healthy',
      postsCount: testQuery.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🏥 Health check: Database connection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}));

// Search blog posts
router.get("/search",
  setCacheHeaders({ public: true, maxAge: 300, etag: true }),
  advancedCache({
    ttl: 300,
    tags: ['blog', 'search'],
    keyGenerator: (req) => `blog:search:${req.query.q}:${req.query.lang || 'en'}:${req.query.limit || 10}`
  }),
  asyncHandler(async (req, res) => {
    try {
      const { q: query, lang = 'en', limit = 10 } = req.query;
      
      if (!query || typeof query !== 'string') {
        throw new BadRequestError('Search query is required');
      }
      
      const { searchService } = await import('../../services/searchService');
      const results = await searchService.searchBlog(
        query,
        lang as 'en' | 'ru',
        parseInt(limit as string)
      );
      
      res.json({
        results,
        total: results.length,
        query,
        language: lang
      });
    } catch (error) {
      console.error('Blog search error:', error);
      throw error;
    }
  })
);

// Get all blog posts (without pagination)
router.get("/all", asyncHandler(async (_, res) => {
  try {
    console.log('📚 /all endpoint: Starting to fetch blog posts...');
    
    // Direct database call to bypass potential issues
    const posts = await blogService.getBlogPosts();
    console.log(`📚 /all endpoint: Retrieved ${posts.length} posts directly`);
    
    // Add comment counts to posts - direct database query
    const transformedPosts = await Promise.all(
      posts.map(async (post) => {
        const postAny = post as any;
        
        // Direct database query for comment count
        const countResult = await pool.query('SELECT COUNT(*) FROM comments WHERE post_id = $1', [post.id]);
        const commentCount = parseInt(countResult.rows[0].count);
        
        return {
          id: post.id,
          title: post.title || '',
          description: post.description || '',
          content: post.content || '',
          categoryId: post.categoryId || postAny.category_id,
          imageUrl: post.imageUrl || postAny.image_url,
          thumbnailUrl: post.thumbnailUrl || postAny.thumbnail_url,
          projectUrl: post.projectUrl || postAny.project_url,
          technologies: post.technologies || [],
          tags: post.tags || [],
          slug: post.slug,
          status: post.status || 'draft',
          createdAt: postAny.created_at || post.createdAt,
          updatedAt: postAny.updated_at || post.updatedAt,
          comment_count: commentCount
        };
      })
    );
    
    console.log(`📚 /all endpoint: Transformed ${transformedPosts.length} posts`);
    if (transformedPosts.length > 0) {
      console.log('📚 Sample transformed post dates:', {
        id: transformedPosts[0].id,
        createdAt: transformedPosts[0].createdAt,
        updatedAt: transformedPosts[0].updatedAt,
        createdAtType: typeof transformedPosts[0].createdAt,
        updatedAtType: typeof transformedPosts[0].updatedAt
      });
    }
    
    // Simple response
    const response = {
      success: true,
      data: transformedPosts,
      message: 'Blog posts retrieved successfully',
      timestamp: new Date().toISOString()
    };
    
    console.log('📚 /all endpoint: Sending response...');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error in /all endpoint:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : 'No stack'
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve blog posts',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}));

// Get all blog posts with pagination
router.get("/", 
  setCacheHeaders({ public: true, maxAge: 300, etag: true }),
  advancedCache({ 
    ttl: 300, 
    tags: ['blog', 'posts'],
    keyGenerator: (req) => `blog:list:${req.query.page || 1}:${req.query.limit || 10}`
  }),
  asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const { data, total } = await storage.getBlogPostsPaginated(page, limit);
  res.json(createPaginatedResponse(data.map(transformFromDbFormat), page, limit, total));
}));

// Get blog post by ID
router.get("/:id", 
  setCacheHeaders({ public: true, maxAge: 600, etag: true }),
  advancedCache({ 
    ttl: 600, 
    tags: ['blog', 'post'],
    keyGenerator: (req) => `blog:post:${req.params.id}`
  }), 
  asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    throw new BadRequestError("Invalid blog post ID");
  }
  
  const post = await storage.getBlogPost(id);
  
  if (!post) {
    throw new NotFoundError("Blog post not found");
  }
  
  res.json(createSuccessResponse(transformFromDbFormat(post), 'Blog post retrieved successfully'));
}));

// Create new blog post
router.post("/", asyncHandler(async (req, res) => {
  try {
    console.log('📝 Creating blog post with data:', req.body);
    const validatedData = insertBlogPostSchema.parse(req.body);
    console.log('✅ Validation passed:', validatedData);
    const post = await storage.createBlogPost(validatedData);
    
    // Clear blog-related caches
    await clearApiCache("GET:/api/blog");
    await clearApiCache("GET:/api/blog/all");
    await invalidateCache('blog:*');
    
    // Broadcast the new blog post to all connected clients
    broadcastUpdate(null, 'blog_created', transformFromDbFormat(post));
    
    res.status(201).json(createSuccessResponse(transformFromDbFormat(post), 'Blog post created successfully'));
  } catch (error) {
    console.error('❌ Blog post creation error:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      throw new ValidationError("Invalid blog post data", error.errors);
    }
    throw error;
  }
}));

// Update blog post
router.put("/:id", asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    throw new BadRequestError("Invalid blog post ID");
  }
  
  try {
    const validatedData = insertBlogPostSchema.partial().parse(req.body);
    const post = await storage.updateBlogPost(id, validatedData);
    
    if (!post) {
      throw new NotFoundError("Blog post not found");
    }
    
    // Clear blog-related caches
    await clearApiCache("GET:/api/blog");
    await clearApiCache("GET:/api/blog/all");
    await clearApiCache(`GET:/api/blog/${id}`);
    await invalidateCache('blog:*');
    
    // Broadcast the updated blog post to all connected clients
    broadcastUpdate(null, 'blog_updated', transformFromDbFormat(post));
    
    res.json(createSuccessResponse(transformFromDbFormat(post), 'Blog post updated successfully'));
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Invalid blog post data", error.errors);
    }
    throw error;
  }
}));

// Delete blog post
router.delete("/:id", asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  console.log(`🔍 DELETE request for blog post ID: ${id}`);
  console.log(`🔍 Request params:`, req.params);
  console.log(`🔍 Parsed ID type:`, typeof id, 'value:', id);
  
  if (isNaN(id)) {
    console.log(`❌ Invalid ID - not a number`);
    throw new BadRequestError("Invalid blog post ID");
  }
  
  // First check if the post exists
  const existingPost = await storage.getBlogPost(id);
  console.log(`📋 Post exists before delete: ${existingPost ? 'YES' : 'NO'}`);
  if (existingPost) {
    console.log(`📋 Existing post details:`, {
      id: existingPost.id,
      title: existingPost.title,
      status: existingPost.status
    });
  }
  
  const deleted = await storage.deleteBlogPost(id);
  console.log(`🗑️ Delete operation result: ${deleted}`);
  
  if (!deleted) {
    console.log(`⚠️ Post not found, but considering delete successful`);
    // Don't throw error - if post doesn't exist, deletion goal is achieved
  }
  
  // Clear blog-related caches
  console.log(`🧹 Clearing caches...`);
  await clearApiCache("GET:/api/blog");
  await clearApiCache("GET:/api/blog/all");
  await clearApiCache(`GET:/api/blog/${id}`);
  await invalidateCache('blog:*');
  
  // Broadcast the deleted blog post ID to all connected clients
  console.log(`📡 Broadcasting delete event...`);
  broadcastUpdate(null, 'blog_deleted', { id });
  
  console.log(`✅ Blog post ${id} deleted successfully`);
  res.json(createSuccessResponse({ id }, 'Blog post deleted successfully'));
}));

export default router;