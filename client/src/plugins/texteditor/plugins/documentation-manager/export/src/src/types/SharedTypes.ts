/**
 * Shared Types for Documentation Manager Plugin
 * Centralized type definitions for multi-library system
 * Max 200 lines - strict TypeScript compliance
 */

// Core library types
export type LibraryType = 'texteditor' | 'site';
export type UserRole = 'admin' | 'editor' | 'user' | null;
export type ContentStatus = 'draft' | 'review' | 'published';
export type AdminView = 'content' | 'sections' | 'versions';

// Base interfaces
export interface BaseDocumentationProps {
  readonly libraryType: LibraryType;
  readonly userRole: UserRole;
}

export interface LibraryContext {
  readonly libraryType: LibraryType;
  readonly libraryName: string;
  readonly baseRoute: string;
  readonly features: LibraryFeatures;
}

export interface LibraryFeatures {
  readonly codeBlocks: boolean;
  readonly mediaUpload: boolean;
  readonly advancedFormatting: boolean;
}

// Content types
export interface ContentItem {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly excerpt?: string;
  readonly sectionId?: string;
  readonly libraryType: LibraryType;
  readonly isPublished: boolean;
  readonly orderIndex: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy?: string;
  readonly updatedBy?: string;
}

export interface Section {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly parentId?: string;
  readonly level: number;
  readonly orderIndex: number;
  readonly icon?: string;
  readonly isActive: boolean;
  readonly libraryType: LibraryType;
  readonly children?: Section[];
}

// Version control types
export interface ContentVersion {
  readonly id: string;
  readonly contentId: string;
  readonly version: number;
  readonly title: string;
  readonly content: string;
  readonly excerpt?: string;
  readonly changeSummary?: string;
  readonly createdBy: string;
  readonly createdAt: string;
}

export interface ContentLock {
  readonly id: string;
  readonly contentId: string;
  readonly userId: string;
  readonly userName: string;
  readonly lockedAt: string;
  readonly expiresAt: string;
}

// UI state types
export interface ContextMenuState {
  readonly isVisible: boolean;
  readonly x: number;
  readonly y: number;
  readonly actions: ContextMenuAction[];
}

export interface ContextMenuAction {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly disabled?: boolean;
  readonly action: () => void;
}

export interface AdminPanelState {
  readonly isOpen: boolean;
  readonly activePanel: AdminView;
  readonly selectedContentId?: string;
  readonly selectedSectionId?: string;
}

export interface ExportModalState {
  readonly isOpen: boolean;
  readonly contentId: string | null;
  readonly contentTitle: string;
}

// Hook return types
export interface UseUserRoleReturn {
  readonly userRole: UserRole;
  readonly canEdit: boolean;
  readonly canManage: boolean;
  readonly isAuthenticated: boolean;
}

export interface UseLibraryContentReturn {
  readonly sections: Section[];
  readonly content: ContentItem[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly reload: () => Promise<void>;
  readonly getContentBySlug: (slug: string) => ContentItem | undefined;
  readonly getSectionBySlug: (slug: string) => Section | undefined;
}

export interface UseAdminFeaturesReturn {
  readonly isAdminMode: boolean;
  readonly setIsAdminMode: (mode: boolean) => void;
  readonly contextMenu: ContextMenuState;
  readonly enableInlineEdit: (element: HTMLElement) => void;
  readonly handleContextMenu: (e: React.MouseEvent) => void;
}

// API types
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
}

export interface SearchResult {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly libraryType: LibraryType;
  readonly sectionName?: string;
  readonly rank: number;
}

// Component prop types
export interface LibraryWrapperProps extends BaseDocumentationProps {
  readonly children: React.ReactNode;
  readonly showAdminControls?: boolean;
}

export interface ContentManagerProps {
  readonly libraryType: LibraryType;
  readonly textEditor: React.ReactNode;
}

export interface SectionManagerProps {
  readonly libraryType: LibraryType;
}

export interface VersionManagerProps {
  readonly libraryType: LibraryType;
}

// Utility types
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
