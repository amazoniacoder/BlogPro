// client/src/admin/pages/blog/state/types.ts
import { BlogPost as BaseBlogPost } from "@/types/blog";
import { mediaFiles } from "@/../../shared/types/schema";

// Define MediaFile type based on the schema
type MediaFile = typeof mediaFiles.$inferSelect;

// Re-export the BlogPost type from the main types to ensure consistency
export type { BlogPost } from "@/types/blog";
export type BlogStatus = "published" | "draft" | "archived";

// Form data type for blog editor
export interface BlogFormData {
  title: string;
  slug?: string;
  description: string;
  content: string;
  status: BlogStatus;
  category: string;
  tags: string[];
  imageUrl: string | null;
  thumbnailUrl?: string | null;
  projectUrl?: string | null;
  technologies?: string[];
}

export interface BlogEditorState {
  loading: boolean;
  formData: Partial<BaseBlogPost>;
  error: string | null;
}

export interface BlogState {
  posts: BaseBlogPost[];
  filteredPosts: BaseBlogPost[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  sortField: string;
  sortDirection: "asc" | "desc";
  filters: {
    search: string;
    status: string;
    category: string;
  };
  selectedPosts: string[];
  deleteModalOpen: boolean;
  postToDelete: string | null;
  editor: {
    isOpen: boolean;
    loading: boolean;
    currentPost: BaseBlogPost | null;
    formData: Partial<BaseBlogPost>;
  };
  mediaModalOpen: boolean;
  mediaItems: MediaFile[];
  mediaLoading: boolean;
}

export type BlogAction =
  | { type: "BLOG/FETCH_START" }
  | { type: "BLOG/FETCH_SUCCESS"; payload: BaseBlogPost[]; totalItems: number; totalPages: number }
  | { type: "BLOG/FETCH_FAILURE"; error: string }
  | { type: "BLOG/SET_PAGE"; page: number }
  | { type: "BLOG/SET_ITEMS_PER_PAGE"; count: number }
  | { type: "BLOG/SET_SORT"; field: string; direction: "asc" | "desc" }
  | { type: "BLOG/SET_FILTER"; field: string; value: string }
  | { type: "BLOG/TOGGLE_POST_SELECTION"; postId: string }
  | { type: "BLOG/SELECT_ALL_POSTS"; selected: boolean }
  | { type: "BLOG/SHOW_DELETE_MODAL"; postId: string }
  | { type: "BLOG/HIDE_DELETE_MODAL" }
  | { type: "BLOG/DELETE_START"; postId: string }
  | { type: "BLOG/DELETE_SUCCESS"; postId: string }
  | { type: "BLOG/DELETE_FAILURE"; error: string }
  | { type: "BLOG/CREATE_SUCCESS"; post: BaseBlogPost }
  | { type: "BLOG/UPDATE_SUCCESS"; post: BaseBlogPost }
  | { type: "BLOG/OPERATION_FAILURE"; error: string }
  | { type: "BLOG/CLEAR_ERROR" }
  | { type: "EDITOR/OPEN"; post?: BaseBlogPost }
  | { type: "EDITOR/CLOSE" }
  | { type: "EDITOR/SET_LOADING"; loading: boolean }
  | { type: "EDITOR/UPDATE_FIELD"; field: string; value: any }
  | { type: "EDITOR/UPDATE_TITLE"; value: string }
  | { type: "MEDIA/SHOW_MODAL" }
  | { type: "MEDIA/HIDE_MODAL" }
  | { type: "MEDIA/FETCH_START" }
  | { type: "MEDIA/FETCH_SUCCESS"; payload: MediaFile[] }
  | { type: "MEDIA/FETCH_FAILURE"; error: string }
  | { type: "MEDIA/SELECT_IMAGE"; url: string }
  | { type: "WEBSOCKET/INIT" }
  | { type: "WEBSOCKET/CLEANUP" };

export type BlogEditorAction =
  | { type: "EDITOR_SET_LOADING"; loading: boolean }
  | { type: "EDITOR_SET_FORM_DATA"; data: Partial<BaseBlogPost> }
  | { type: "EDITOR_UPDATE_FIELD"; field: string; value: any }
  | { type: "EDITOR_UPDATE_TITLE"; value: string }
  | { type: "EDITOR_SET_ERROR"; error: string | null }
  | { type: "EDITOR_INIT_NEW_POST" };
