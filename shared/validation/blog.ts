import { z } from "zod";

// Define the blog post schema directly
export const insertBlogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  imageUrl: z.string().url("Image URL must be a valid URL"),
  thumbnailUrl: z.string().url("Thumbnail URL must be a valid URL").optional(),
  published: z.boolean().default(false).optional(),
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

// Search validation schema
export const searchBlogPostSchema = z.object({
  query: z.string().min(1, "Search query is required").max(100, "Query too long"),
  category: z.string().optional(),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(20)).default("10").optional(),
});

export type SearchBlogPost = z.infer<typeof searchBlogPostSchema>;