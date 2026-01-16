/**
 * BlogPro Navigation Components
 * Navigation component exports (updated)
 */

export { Navigation } from './Navigation';
export { MobileMenu } from './MobileMenu';
export { UserMenu } from './UserMenu';
export { HeaderDropdown } from './HeaderDropdown';
export { Tabs } from './Tabs';
export { Breadcrumb } from './Breadcrumb';

export type { NavigationProps, NavigationItem } from './Navigation';
export type { MobileMenuProps } from './MobileMenu';
export type { UserMenuProps, UserMenuItem } from './UserMenu';
export type { HeaderDropdownProps, DropdownItem } from './HeaderDropdown';
export type { TabsProps, TabItem } from './Tabs';
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb';

// Import navigation styles
import './user-menu.css';
import './navigation.css';
import './menu-links.css';
import './breadcrumb.css';
