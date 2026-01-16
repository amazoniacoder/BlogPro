/**
 * BlogPro Admin Components
 * Admin-specific component exports
 */

export { AdminSidebar } from './AdminSidebar';
export { AdminHeader } from './AdminHeader';
export { AdminLayout } from './AdminLayout';
export { AdminMenu } from './AdminMenu';
export { AdminSlidingMenu } from './AdminSlidingMenu';
export { AdminTable } from './AdminTable';
export { AdminEditor } from './AdminEditor';
export { CategoryTree } from './CategoryTree';
export { CategoryForm } from './CategoryForm';
export { CategoryTreeSelector } from './CategoryTreeSelector';

// Analytics components
export * from './analytics';

// Dashboard components
export * from './dashboard';

// Media components
export * from './media';

// Documentation components
export * from './documentation';

// Users components
export * from './users';

// Products components
export * from './products';

// Shop components
export * from './shop';

// Categories components
export * from './categories';

// Website Editor components
export * from './website-editor';

// Import dashboard styles
import './dashboard/index.css';
// Import admin layout styles
import './admin-layout.css';

export type { AdminMenuItem, AdminSidebarProps } from './AdminSidebar';
export type { AdminUser, AdminHeaderProps } from './AdminHeader';
export type { AdminLayoutProps } from './AdminLayout';
export type { AdminMenuItemProps, AdminMenuProps } from './AdminMenu';
export type { AdminSlidingMenuProps } from './AdminSlidingMenu';
export type { AdminTableProps, AdminTableColumn, AdminTableAction } from './AdminTable';
export type { AdminEditorProps, AdminEditorField } from './AdminEditor';
export type { CategoryTreeProps } from './CategoryTree';
export type { CategoryFormProps } from './CategoryForm';
export type { CategoryTreeSelectorProps } from './CategoryTreeSelector';

// Documentation component types
export type {
  Documentation,
  DocumentationCategory,
  DocumentationCardProps,
  DocumentationFormProps,
  DocumentationFormData,
  DocumentationListProps,
  DocumentationFiltersProps,
  UseDocumentationDataReturn,
  DocumentationState,
  DocumentationAction
} from './documentation';

// Shop component types
export type {
  ShopStats,
  RevenueData,
  Order,
  Product as ShopProduct,
  PaymentTransaction,
  Customer,
  ShopSettingsData
} from './shop';

// Admin styles are imported via ui-system/admin/index.css
