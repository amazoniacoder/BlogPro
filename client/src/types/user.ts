export type UserRole = 'admin' | 'editor' | 'user';

export interface User {
  id: string;
  username?: string; // Maps to username in DB
  email: string;
  password?: string; // For creation/update only, never returned from API
  firstName?: string; // Maps to first_name in DB
  lastName?: string;  // Maps to last_name in DB
  name?: string; // Computed field (firstName + lastName)
  role: UserRole;
  emailVerified?: boolean; // Maps to email_verified in DB
  verificationToken?: string; // Maps to verification_token in DB
  resetPasswordToken?: string; // Maps to reset_password_token in DB
  resetPasswordExpires?: string; // Maps to reset_password_expires in DB
  profileImageUrl?: string; // Maps to profile_image_url in DB
  isScheduledForDeletion?: boolean; // Maps to is_scheduled_for_deletion in DB
  deletionScheduledAt?: string; // Maps to deletion_scheduled_at in DB
  deletionReason?: string; // Maps to deletion_reason in DB
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  isBlocked?: boolean;
  createdAt: string; // Maps to created_at in DB
  updatedAt: string; // Maps to updated_at in DB
}
