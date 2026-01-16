// client/src/types/blog.ts

export type BlogStatus = "published" | "draft" | "archived";

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  categoryId?: number;
  imageUrl: string | null;
  thumbnailUrl?: string | null;
  projectUrl?: string | null;
  technologies?: string[];
  status: BlogStatus;
  slug?: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  author_id?: string;
  author_name?: string;
  author_bio?: string;
  author_avatar?: string;
  _timestamp?: number;
}

export type InsertBlogPost = Omit<BlogPost, "id" | "created_at" | "updated_at">;
