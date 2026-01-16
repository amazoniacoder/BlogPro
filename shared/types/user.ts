import { z } from "zod";
import { users } from "./schema";

export type User = typeof users.$inferSelect;

export const upsertUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;