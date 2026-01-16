/**
 * BlogPro UI Components
 * Main TypeScript exports for all components
 */

// Accessibility Components
export { AccessibilityMenu, type AccessibilityMenuProps } from './accessibility';

// Button Components
export { Button, type ButtonProps } from './button';

// Form Components
export { 
  FormField, 
  Input, 
  Textarea, 
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  FileUpload,
  type FormFieldProps,
  type InputProps,
  type TextareaProps,
  type SelectProps,
  type CheckboxProps,
  type RadioProps,
  type RadioGroupProps,
  type SwitchProps,
  type FileUploadProps
} from './form';

// Advanced Components
export { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter, 
  CardActions,
  type CardProps,
  type CardHeaderProps,
  type CardActionsProps
} from './card';

export { 
  Modal, 
  ModalBody, 
  ModalFooter,
  type ModalProps,
  type ModalFooterProps
} from './modal';

// Layout Components
export {
  Layout,
  type LayoutProps
} from './layout';

// Header Components (styles only - component is in layout)
// Header styles are available through CSS imports

// Navigation Components
export {
  Navigation,
  MobileMenu,
  UserMenu,
  type NavigationProps,
  type NavigationItem,
  type MobileMenuProps,
  type UserMenuProps,
  type UserMenuItem
} from './navigation';

// Hamburger Menu Component
export {
  HamburgerMenu
} from './hamburger';

// Footer Components
export {
  Footer,
  type FooterProps
} from './footer';

// Search Components
export {
  SearchInput,
  SearchDropdown,
  SearchResults,
  SearchToggle,
  type SearchInputProps,
  type SearchDropdownProps,
  type SearchResultsProps,
  type SearchToggleProps,
  type SearchResult
} from './search';

// Theme Components
export {
  ThemeProvider,
  ThemeToggle,
  useTheme,
  type Theme,
  type ThemeToggleProps
} from './theme';

// Typography Components
export {
  Heading,
  Text,
  Link,
  Code,
  type HeadingProps,
  type TextProps,
  type LinkProps,
  type CodeProps
} from './typography';

// Input Components
export {
  ColorPicker,
  DatePicker,
  RichTextEditor,
  type ColorPickerProps,
  type DatePickerProps,
  type RichTextEditorProps
} from './input';

// Table Components
export {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  type TableProps
} from './table';

// Pagination Components
export {
  Pagination,
  type PaginationProps
} from './pagination';

// Feedback Components
export {
  Alert,
  Toast,
  Spinner,
  Badge,
  Tooltip,
  type AlertProps,
  type ToastProps,
  type SpinnerProps,
  type BadgeProps,
  type TooltipProps
} from './feedback';

// Admin Components
export {
  AdminSidebar,
  AdminHeader,
  AdminLayout,
  AdminMenu,
  DocumentationCard,
  DocumentationForm,
  DocumentationList,
  DocumentationFilters,
  type AdminMenuItem,
  type AdminSidebarProps,
  type AdminUser,
  type AdminHeaderProps,
  type AdminLayoutProps,
  type AdminMenuItemProps,
  type AdminMenuProps,
  type Documentation,
  type DocumentationCategory,
  type DocumentationCardProps,
  type DocumentationFormProps,
  type DocumentationFormData,
  type DocumentationListProps,
  type DocumentationFiltersProps,
  type UseDocumentationDataReturn,
  type DocumentationState,
  type DocumentationAction
} from './admin';

// Comment Components
export {
  CommentThread,
  CommentItem,
  CommentReactions
} from './comments';

// User Components
export {
  CommentArchive
} from './user';

// Admin Comment Components
export {
  CommentsManager
} from './admin/comments';

// Re-export AdminLayout from admin directory
export { AdminLayout as AdminLayoutComponent } from './admin/AdminLayout';

// Overlay Components
export {
  Dialog,
  Sheet,
  Popover,
  type DialogProps,
  type SheetProps,
  type PopoverProps
} from './overlay';

// Navigation Components (Advanced)
export {
  Tabs,
  Breadcrumb,
  type TabsProps,
  type TabItem,
  type BreadcrumbProps,
  type BreadcrumbItem
} from './navigation';

// Utility Components
export {
  Divider,
  Spacer,
  Stack,
  type DividerProps,
  type SpacerProps,
  type StackProps
} from './utility';

// Documentation Components
export {
  DocumentationLayout,
  DocumentationTree,
  DocumentationContent
} from './documentation';

// E-commerce Components
export {
  Cart,
  CartItem,
  CartIcon,
  CartBadge,
  AddToCartButton,
  Checkout,
  CheckoutSteps,
  ShippingForm,
  PaymentForm,
  PaymentMethods,
  OrderSummary,
  OrderConfirmation,
  OrderCard,
  OrderStatus,
  OrderTracking,
  PaymentStatus,
  SecurityBadges,
  StripePayment,
  PayPalPayment,
  YandexPayment,
  PaymentGateway,
  OrderHistory,
  SavedAddresses,
  Wishlist,
  RealtimeOrderUpdates,
  SalesAnalytics
} from './ecommerce';

// Pattern Components
export {
  BlogCard,
  FeatureCard,
  PricingCard,
  TeamCard,
  TestimonialCard,
  ContactForm,
  HeroSection,
  FeatureSection,
  CTASection,
  DashboardCard,
  StatsCard,
  DataTable,
  FilterPanel,
  type BlogCardProps,
  type FeatureCardProps,
  type PricingCardProps,
  type PricingFeature,
  type TeamCardProps,
  type SocialLink,
  type TestimonialCardProps,
  type ContactFormProps,
  type HeroSectionProps,
  type HeroAction,
  type FeatureSectionProps,
  type Feature,
  type CTASectionProps,
  type CTAAction,
  type DashboardCardProps,
  type StatsCardProps,
  type DataTableProps,
  type DataTableColumn,
  type DataTableAction,
  type FilterPanelProps,
  type FilterField,
  type FilterOption
} from '../patterns';
