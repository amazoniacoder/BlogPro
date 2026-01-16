import { z } from "zod";

// Define the media file schema directly
export const insertMediaFileSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().positive("File size must be positive"),
  url: z.string().url("URL must be valid"),
  thumbnailUrl: z.string().url("Thumbnail URL must be valid").optional(),
});

export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;