// server/services/categoryService.ts
import { db } from '../db/db';
import { blogCategories, blogPosts } from '../../shared/types/schema';
import { BlogCategory, CategoryTreeNode, CategoryWithPosts } from '../../shared/types/api';
import { CreateCategoryInput, UpdateCategoryInput } from '../../shared/validation/categories';
import { eq, sql, desc, asc } from 'drizzle-orm';

export class CategoryService {
  // Get all categories as hierarchical tree
  async getCategoriesTree(): Promise<CategoryTreeNode[]> {
    try {
      console.log('Attempting to fetch categories from database...');
      
      // First try a simple select without the complex SQL
      const categories = await db
        .select({
          id: blogCategories.id,
          name: blogCategories.name,
          slug: blogCategories.slug,
          description: blogCategories.description,
          parentId: blogCategories.parentId,
          sortOrder: blogCategories.sortOrder,
          createdAt: blogCategories.createdAt,
          updatedAt: blogCategories.updatedAt,
          postCount: sql<number>`0` // Simplified for now
        })
        .from(blogCategories)
        .orderBy(asc(blogCategories.sortOrder), asc(blogCategories.name));

      console.log('Successfully fetched categories:', categories.length);
      return this.buildCategoryTree(categories);
    } catch (error) {
      console.error('Error in getCategoriesTree:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw error;
    }
  }

  // Get category by ID with optional children and posts
  async getCategoryById(id: number, includeChildren = true): Promise<BlogCategory | null> {
    const category = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        description: blogCategories.description,
        parentId: blogCategories.parentId,
        sortOrder: blogCategories.sortOrder,
        createdAt: blogCategories.createdAt,
        updatedAt: blogCategories.updatedAt,
        postCount: sql<number>`(
          SELECT COUNT(*) FROM blog_posts 
          WHERE category_id = ${blogCategories.id}
        )`
      })
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);

    if (!category.length) return null;

    const result: BlogCategory = {
      ...category[0],
      description: category[0].description || undefined,
      parentId: category[0].parentId || undefined,
      sortOrder: category[0].sortOrder || 0,
      createdAt: category[0].createdAt ? category[0].createdAt.toISOString() : new Date().toISOString(),
      updatedAt: category[0].updatedAt ? category[0].updatedAt.toISOString() : new Date().toISOString()
    };

    if (includeChildren) {
      result.children = await this.getCategoryChildren(id);
    }

    return result;
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
    const category = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        description: blogCategories.description,
        parentId: blogCategories.parentId,
        sortOrder: blogCategories.sortOrder,
        createdAt: blogCategories.createdAt,
        updatedAt: blogCategories.updatedAt,
        postCount: sql<number>`(
          SELECT COUNT(*) FROM blog_posts 
          WHERE category_id = ${blogCategories.id}
        )`
      })
      .from(blogCategories)
      .where(eq(blogCategories.slug, slug))
      .limit(1);

    if (!category.length) return null;
    return {
      ...category[0],
      description: category[0].description || undefined,
      parentId: category[0].parentId || undefined,
      sortOrder: category[0].sortOrder || 0,
      createdAt: category[0].createdAt ? category[0].createdAt.toISOString() : new Date().toISOString(),
      updatedAt: category[0].updatedAt ? category[0].updatedAt.toISOString() : new Date().toISOString()
    };
  }

  // Create new category
  async createCategory(data: CreateCategoryInput): Promise<BlogCategory> {
    const result = await db
      .insert(blogCategories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId,
        sortOrder: data.sortOrder
      })
      .returning();

    const category = (result as any[])[0];

    return {
      ...category,
      createdAt: category.createdAt ? category.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: category.updatedAt ? category.updatedAt.toISOString() : new Date().toISOString(),
      postCount: 0
    };
  }

  // Update category
  async updateCategory(id: number, data: UpdateCategoryInput): Promise<BlogCategory | null> {
    const result = await db
      .update(blogCategories)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(blogCategories.id, id))
      .returning();

    if (!(result as any[]).length) return null;
    const category = (result as any[])[0];

    return {
      ...category,
      createdAt: category.createdAt ? category.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: category.updatedAt ? category.updatedAt.toISOString() : new Date().toISOString(),
      postCount: 0
    };
  }

  // Delete category
  async deleteCategory(id: number): Promise<boolean> {
    // Move posts to parent category or null
    const category = await this.getCategoryById(id, false);
    if (!category) return false;

    await db
      .update(blogPosts)
      .set({ categoryId: category.parentId || null })
      .where(eq(blogPosts.categoryId, id));

    await db
      .delete(blogCategories)
      .where(eq(blogCategories.id, id));

    return true;
  }

  // Get posts in category (including subcategories)
  async getCategoryPosts(categoryId: number, includeSubcategories = true): Promise<CategoryWithPosts | null> {
    const category = await this.getCategoryById(categoryId, false);
    if (!category) return null;

    let categoryIds = [categoryId];
    
    if (includeSubcategories) {
      const descendants = await this.getCategoryDescendants(categoryId);
      categoryIds = [...categoryIds, ...descendants.map(d => d.id)];
    }

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        description: blogPosts.description,
        content: blogPosts.content,
        categoryId: blogPosts.categoryId,
        imageUrl: blogPosts.imageUrl,
        thumbnailUrl: blogPosts.thumbnailUrl,
        projectUrl: blogPosts.projectUrl,
        technologies: blogPosts.technologies,
        tags: blogPosts.tags,
        slug: blogPosts.slug,
        status: blogPosts.status,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt
      })
      .from(blogPosts)
      .where(sql`${blogPosts.categoryId} = ANY(${categoryIds})`)
      .orderBy(desc(blogPosts.createdAt));

    return {
      ...category,
      posts: posts.map(post => ({
        ...post,
        id: post.id.toString(),
        categoryId: post.categoryId || undefined,
        imageUrl: post.imageUrl || undefined,
        thumbnailUrl: post.thumbnailUrl || undefined,
        projectUrl: post.projectUrl || undefined,
        slug: post.slug || undefined,
        status: (post.status as 'draft' | 'published' | 'archived') || 'draft',
        technologies: post.technologies || [],
        tags: post.tags || [],
        created_at: post.createdAt ? post.createdAt.toISOString() : new Date().toISOString(),
        updated_at: post.updatedAt ? post.updatedAt.toISOString() : new Date().toISOString()
      }))
    };
  }

  // Get category path (breadcrumb)
  async getCategoryPath(categoryId: number): Promise<BlogCategory[]> {
    const path: BlogCategory[] = [];
    let currentId: number | null = categoryId;

    while (currentId) {
      const category = await this.getCategoryById(currentId, false);
      if (!category) break;
      
      path.unshift(category);
      currentId = category.parentId || null;
    }

    return path;
  }

  // Private helper methods
  private async getCategoryChildren(parentId: number): Promise<BlogCategory[]> {
    const children = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        description: blogCategories.description,
        parentId: blogCategories.parentId,
        sortOrder: blogCategories.sortOrder,
        createdAt: blogCategories.createdAt,
        updatedAt: blogCategories.updatedAt,
        postCount: sql<number>`(
          SELECT COUNT(*) FROM blog_posts 
          WHERE category_id = ${blogCategories.id}
        )`
      })
      .from(blogCategories)
      .where(eq(blogCategories.parentId, parentId))
      .orderBy(asc(blogCategories.sortOrder), asc(blogCategories.name));

    return children.map(child => ({
      ...child,
      description: child.description || undefined,
      parentId: child.parentId || undefined,
      sortOrder: child.sortOrder || 0,
      createdAt: child.createdAt ? child.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: child.updatedAt ? child.updatedAt.toISOString() : new Date().toISOString()
    }));
  }

  private async getCategoryDescendants(parentId: number): Promise<BlogCategory[]> {
    // Simple recursive approach to get all descendants
    const descendants: BlogCategory[] = [];
    const children = await this.getCategoryChildren(parentId);
    
    for (const child of children) {
      descendants.push(child);
      const childDescendants = await this.getCategoryDescendants(child.id);
      descendants.push(...childDescendants);
    }
    
    return descendants;
  }

  private buildCategoryTree(categories: any[]): CategoryTreeNode[] {
    const categoryMap = new Map<number, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // Create category nodes
    categories.forEach(cat => {
      const node: CategoryTreeNode = {
        ...cat,
        createdAt: cat.createdAt ? cat.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: cat.updatedAt ? cat.updatedAt.toISOString() : new Date().toISOString(),
        children: [],
        level: 0,
        path: []
      };
      categoryMap.set(cat.id, node);
    });

    // Build tree structure
    categories.forEach(cat => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(node);
          node.level = parent.level + 1;
          node.path = [...parent.path, parent.name];
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }
}

export const categoryService = new CategoryService();