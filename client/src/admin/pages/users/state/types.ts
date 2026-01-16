// client/src/admin/pages/users/state/types.ts
import { UserRole } from '@/types/user';

export interface User {
  id: string;
  username?: string;
  email: string;
  password?: string; // For creation only, never returned from API
  firstName?: string; // Maps to first_name in DB
  lastName?: string;  // Maps to last_name in DB
  role: UserRole;
  emailVerified?: boolean; // Maps to email_verified in DB
  verificationToken?: string; // Maps to verification_token in DB
  resetPasswordToken?: string; // Maps to reset_password_token in DB
  resetPasswordExpires?: string; // Maps to reset_password_expires in DB
  profileImageUrl?: string; // Maps to profile_image_url in DB
  isScheduledForDeletion?: boolean; // Maps to is_scheduled_for_deletion in DB
  deletionScheduledAt?: string; // Maps to deletion_scheduled_at in DB
  deletionReason?: string; // Maps to deletion_reason in DB
  createdAt: string; // Maps to created_at in DB
  updatedAt?: string; // Maps to updated_at in DB
  lastActivity?: string; // Last activity timestamp
  // Client-side computed fields
  status: "active" | "inactive" | "banned" | "under_deletion";
  isBlocked?: boolean;
  isAdmin?: boolean;
  lastLogin?: string;
}

export interface UsersState {
  users: User[];
  filteredUsers: User[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  sortField: string;
  sortDirection: "asc" | "desc";
  filters: {
    search: string;
    status: string;
    role: string;
    dateFrom?: string;
    dateTo?: string;
    emailVerified?: string;
  };
  selectedUsers: string[];
  deleteModalOpen: boolean;
  userToDelete: string | null;
  editor: {
    isOpen: boolean;
    loading: boolean;
    mode: 'create' | 'edit';
    currentUser: User | null;
    formData: Partial<User>;
  };
}

export type UsersAction =
  | { type: "USERS/FETCH_START" }
  | { type: "USERS/FETCH_SUCCESS"; payload: User[] }
  | { type: "USERS/FETCH_FAILURE"; error: string }
  | { type: "USERS/SET_PAGE"; page: number }
  | { type: "USERS/SET_ITEMS_PER_PAGE"; count: number }
  | { type: "USERS/SET_SORT"; field: string; direction: "asc" | "desc" }
  | { type: "USERS/SET_FILTER"; field: keyof UsersState["filters"]; value: string }
  | { type: "USERS/TOGGLE_SELECTION"; userId: string }
  | { type: "USERS/SELECT_ALL"; selected: boolean }
  | { type: "USERS/CLEAR_SELECTION" }
  | { type: "USERS/SHOW_DELETE_MODAL"; userId: string }
  | { type: "USERS/HIDE_DELETE_MODAL" }
  | { type: "USERS/DELETE_START"; userId: string }
  | { type: "USERS/DELETE_SUCCESS"; userId: string }
  | { type: "USERS/DELETE_FAILURE"; error: string }
  | { type: "USERS/UPDATE_STATUS"; userId: string; status: "active" | "inactive" | "banned" }
  | { type: "USERS/CREATE_SUCCESS"; user: User }
  | { type: "USERS/UPDATE_SUCCESS"; user: User }
  | { type: "USERS/OPERATION_FAILURE"; error: string }
  | { type: "USERS/CLEAR_ERROR" }
  | { type: "EDITOR/OPEN"; user?: User; mode: 'create' | 'edit' }
  | { type: "EDITOR/CLOSE" }
  | { type: "EDITOR/SET_LOADING"; loading: boolean }
  | { type: "EDITOR/UPDATE_FIELD"; field: string; value: any }
  | { type: "WEBSOCKET/INIT" }
  | { type: "WEBSOCKET/CLEANUP" };
