import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock database before importing the service
vi.mock('../../db/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
  }
}));

import * as blogService from '../../services/blogService';
import { db } from '../../db/db';

const mockDb = db as any;

describe('BlogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBlogPosts', () => {
    it('returns paginated blog posts', async () => {
      const mockPosts = [
        { id: 1, title: 'Test Post 1', content: 'Content 1' },
        { id: 2, title: 'Test Post 2', content: 'Content 2' }
      ];

      // Mock the final query execution
      mockDb.offset.mockResolvedValue(mockPosts);

      const result = await blogService.getBlogPosts();

      expect(result).toEqual(mockPosts);
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('createBlogPost', () => {
    it('creates a new blog post', async () => {
      const newPost = {
        title: 'New Post',
        content: 'New Content',
        description: 'New Excerpt',
        category: 'Tech',
        imageUrl: '/image.jpg',
        technologies: ['React', 'TypeScript'],
        tags: ['web', 'development'],
        status: 'published' as const,
        slug: 'new-post'
      };

      const mockCreatedPost = { id: 1, ...newPost };
      // Mock the final query execution
      mockDb.returning.mockResolvedValue([mockCreatedPost]);

      const result = await blogService.createBlogPost(newPost);

      expect(result).toEqual(mockCreatedPost);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(newPost);
    });
  });
});