import { z } from "zod";

// User deletion status enum
export type UserDeletionStatus = "active" | "scheduled_for_deletion" | "deleted";

// Request to schedule user deletion
export const scheduleUserDeletionSchema = z.object({
  reason: z.string().optional().default("User requested deletion"),
});

export type ScheduleUserDeletionRequest = z.infer<typeof scheduleUserDeletionSchema>;

// Response for deletion status
export const userDeletionStatusSchema = z.object({
  isScheduledForDeletion: z.boolean(),
  deletionScheduledAt: z.date().nullable(),
  deletionReason: z.string().nullable(),
  hoursUntilDeletion: z.number().nullable(),
});

export type UserDeletionStatusResponse = z.infer<typeof userDeletionStatusSchema>;

// WebSocket event for user deletion updates
export interface UserDeletionUpdateEvent {
  type: 'user_deletion_scheduled' | 'user_deletion_cancelled' | 'user_deleted';
  userId: string;
  deletionScheduledAt?: Date;
  deletionReason?: string;
}