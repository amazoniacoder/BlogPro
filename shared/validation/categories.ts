// shared/validation/categories.ts
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  parentId: z.number().optional(),
  sortOrder: z.number().default(0)
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  description: z.string().optional(),
  parentId: z.number().optional(),
  sortOrder: z.number().optional()
});

export const categoryQuerySchema = z.object({
  includeChildren: z.boolean().default(true),
  includePosts: z.boolean().default(false),
  includePostCount: z.boolean().default(true)
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;