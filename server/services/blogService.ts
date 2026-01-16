import { db } from '../db/db';
import { blogPosts } from '../../shared/types/schema';
import { eq, or, ilike, sql, and } from 'drizzle-orm';
// Create types from the blogPosts table
type BlogPost = typeof blogPosts.$inferSelect;
type InsertBlogPost = typeof blogPosts.$inferInsert;
// Define SearchResult type locally
type SearchResult = {
  id: number;
  title: string;
  description: string;
  category: number | null;
  slug?: string;
  relevance: number;
};

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    console.log('🔍 Fetching all blog posts from database...');
    const result = await db.select().from(blogPosts).orderBy(blogPosts.createdAt);
    console.log(`✅ Successfully fetched ${result.length} blog posts`);
    if (result.length > 0) {
      console.log('📄 Sample post structure:', {
        id: result[0].id,
        title: result[0].title,
        hasContent: !!result[0].content,
        status: result[0].status,
        createdAt: result[0].createdAt,
        updatedAt: result[0].updatedAt,
        createdAtType: typeof result[0].createdAt,
        updatedAtType: typeof result[0].updatedAt
      });
    }
    return result;
  } catch (error) {
    console.error('❌ Error fetching blog posts:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error; // Re-throw to let the API handler deal with it
  }
}

export async function getBlogPostsWithCommentCounts(): Promise<(BlogPost & { comment_count: number })[]> {
  const posts = await getBlogPosts();
  
  // Return posts with comment_count set to 0 since comment counting is not implemented
  return posts.map(post => ({
    ...post,
    comment_count: 0
  }));
}

export async function getBlogPostsPaginated(page: number = 1, limit: number = 10): Promise<{ data: BlogPost[], total: number, totalPages: number }> {
  try {
    const offset = (page - 1) * limit;
    
    // Get total count
    const allPosts = await db.select().from(blogPosts);
    const total = allPosts.length;
    const totalPages = Math.ceil(total / limit);
    
    // Get paginated data
    const data = await db.select().from(blogPosts)
      .orderBy(blogPosts.createdAt)
      .limit(limit)
      .offset(offset);
    
    return {
      data,
      total,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching paginated blog posts:', error);
    return {
      data: [],
      total: 0,
      totalPages: 1
    };
  }
}

export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  return await db.select().from(blogPosts).where(eq(blogPosts.status, 'published')).orderBy(blogPosts.createdAt);
}

export async function getBlogPost(id: number): Promise<BlogPost | undefined> {
  const results = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  return results[0];
}

export async function createBlogPost(data: InsertBlogPost): Promise<BlogPost> {
  // Clean content from HTML entities
  const cleanContent = data.content
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
   
  // Map camelCase input to database fields
  const dbData = {
    title: data.title,
    description: data.description,
    content: cleanContent,
    categoryId: data.categoryId,
    imageUrl: data.imageUrl || null,
    thumbnailUrl: data.thumbnailUrl || null,
    projectUrl: data.projectUrl || null,
    technologies: data.technologies || [],
    tags: data.tags || [],
    slug: data.slug,
    status: data.status || 'draft'
  };
  
  const result = await db.insert(blogPosts).values(dbData).returning();
  return result[0];
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
  // Map camelCase input to snake_case database fields
  const dbData: any = {};
  if (data.title !== undefined) dbData.title = data.title;
  if (data.description !== undefined) dbData.description = data.description;
  if (data.content !== undefined) {
    // Clean content from HTML entities
    dbData.content = data.content
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  if (data.categoryId !== undefined) dbData.categoryId = data.categoryId;
  if (data.imageUrl !== undefined) dbData.imageUrl = data.imageUrl;
  if (data.thumbnailUrl !== undefined) dbData.thumbnailUrl = data.thumbnailUrl;
  if (data.projectUrl !== undefined) dbData.projectUrl = data.projectUrl;
  if (data.technologies !== undefined) dbData.technologies = data.technologies;
  if (data.tags !== undefined) dbData.tags = data.tags;
  if (data.slug !== undefined) dbData.slug = data.slug;
  if (data.status !== undefined) dbData.status = data.status;
  
  // Always update the updatedAt timestamp
  dbData.updatedAt = new Date();
  
  const result = await db.update(blogPosts).set(dbData).where(eq(blogPosts.id, id)).returning();
  return result[0];
}

export async function deleteBlogPost(id: number): Promise<boolean> {
  try {
    console.log(`🗑️ Attempting to delete blog post with ID: ${id}`);
    console.log(`🔍 ID type: ${typeof id}, value: ${id}`);
    
    // First check if the post exists
    const existingPost = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    console.log(`📋 Post exists check: ${existingPost.length > 0 ? 'Found' : 'Not found'}`);
    
    if (existingPost.length === 0) {
      console.log(`⚠️ Blog post with ID ${id} not found in database`);
      return false;
    }
    
    console.log(`📄 Found post to delete:`, existingPost[0]);
    
    // Perform the deletion
    console.log(`🔥 Executing DELETE query...`);
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    console.log(`✅ Delete operation result: ${result.length > 0 ? 'Success' : 'Failed'}`);
    console.log(`🔢 Deleted rows count: ${result.length}`);
    console.log(`📝 Deleted post data:`, result[0] || 'None');
    
    // Verify deletion by checking again
    const verifyPost = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    console.log(`🔍 Verification check: ${verifyPost.length === 0 ? 'Post deleted' : 'Post still exists!'}`);
    
    return result.length > 0;
  } catch (error) {
    console.error(`❌ Error deleting blog post ${id}:`, error);
    throw error;
  }
}

export async function searchBlogPosts(query: string, category?: string, limit: number = 10): Promise<SearchResult[]> {
  try {
    console.log('🔍 Search called with:', { query, category, limit });
    const searchTerm = `%${query.toLowerCase()}%`;
    console.log('🔍 Search term:', searchTerm);
    
    const searchCondition = or(
      ilike(blogPosts.title, searchTerm),
      ilike(blogPosts.description, searchTerm),
      ilike(blogPosts.content, searchTerm)
    );
    
    const whereCondition = category 
      ? and(searchCondition, eq(blogPosts.categoryId, parseInt(category)))
      : searchCondition;
    
    const results = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      description: blogPosts.description,
      category: blogPosts.categoryId,
      slug: blogPosts.slug,
      relevance: sql<number>`
        CASE 
          WHEN LOWER(${blogPosts.title}) LIKE ${searchTerm} THEN 3
          WHEN LOWER(${blogPosts.description}) LIKE ${searchTerm} THEN 2
          WHEN LOWER(${blogPosts.content}) LIKE ${searchTerm} THEN 1
          ELSE 0
        END
      `.as('relevance')
    })
    .from(blogPosts)
    .where(whereCondition)
    .orderBy(sql`relevance DESC`)
    .limit(limit);
    
    console.log('🔍 Raw results:', results.length, results);
    
    const mappedResults = results.map(result => ({
      id: result.id,
      title: result.title,
      description: result.description,
      category: result.category,
      slug: result.slug || undefined,
      relevance: result.relevance
    }));
    
    console.log('🔍 Mapped results:', mappedResults.length, mappedResults);
    return mappedResults;
  } catch (error) {
    console.error('Error searching blog posts:', error);
    return [];
  }
}