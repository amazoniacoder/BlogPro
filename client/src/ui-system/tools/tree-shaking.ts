/**
 * BlogPro Tree Shaking Optimization
 * Utilities for optimal tree shaking
 */

// Re-export components with proper tree shaking
export type { 
  // Core Components
  ButtonProps,
  CardProps,
  InputProps,
  FormFieldProps,
  
  // Layout Components
  FooterProps,
  NavigationProps,
  
  // Form Components
  SelectProps,
  CheckboxProps,
  RadioProps,
  SwitchProps,
  FileUploadProps,
  
  // Input Components
  ColorPickerProps,
  DatePickerProps,
  RichTextEditorProps,
  
  // Table Components
  TableProps,
  PaginationProps,
  
  // Feedback Components
  AlertProps,
  ToastProps,
  SpinnerProps,
  BadgeProps,
  TooltipProps,
  
  // Typography Components
  HeadingProps,
  TextProps,
  LinkProps,
  CodeProps,
  
  // Theme Components
  Theme,
  ThemeToggleProps,
  
  // Search Components
  SearchInputProps,
  SearchDropdownProps,
  SearchResultsProps,
  SearchToggleProps,
  
  // Overlay Components
  DialogProps,
  SheetProps,
  PopoverProps,
  
  // Navigation Components
  TabsProps,
  TabItem,
  BreadcrumbProps,
  BreadcrumbItem,
  
  // Utility Components
  DividerProps,
  SpacerProps,
  StackProps,
  
  // Admin Components
  AdminSidebarProps,
  AdminHeaderProps,
  AdminLayoutProps,
  AdminMenuProps,
  
  // Pattern Components
  BlogCardProps,
  FeatureCardProps,
  PricingCardProps,
  TeamCardProps,
  TestimonialCardProps,
  ContactFormProps,
  HeroSectionProps,
  FeatureSectionProps,
  CTASectionProps,
  DashboardCardProps,
  StatsCardProps,
  DataTableProps,
  FilterPanelProps
} from '../components';

// Tree-shakable component imports
export const createOptimizedImports = () => ({
  // Core components - always included
  Button: () => import('../components/button/Button'),
  Card: () => import('../components/card/Card'),
  Input: () => import('../components/form/FormField').then(m => ({ default: m.Input })),
  
  // Heavy components - lazy loaded
  Dialog: () => import('../components/overlay/Dialog'),
  Sheet: () => import('../components/overlay/Sheet'),
  DataTable: () => import('../patterns/admin/DataTable'),
  RichTextEditor: () => import('../components/input/RichTextEditor'),
  ColorPicker: () => import('../components/input/ColorPicker'),
  DatePicker: () => import('../components/input/DatePicker'),
  
  // Admin components - conditionally loaded
  AdminLayout: () => import('../components/admin/AdminLayout'),
  AdminSidebar: () => import('../components/admin/AdminSidebar'),
  DashboardCard: () => import('../patterns/admin/DashboardCard'),
  StatsCard: () => import('../patterns/admin/StatsCard'),
  FilterPanel: () => import('../patterns/admin/FilterPanel')
});

// Bundle splitting configuration
export const bundleConfig = {
  core: [
    'Button',
    'Card', 
    'Input',
    'FormField',
    'Text',
    'Heading',
    'Link'
  ],
  
  forms: [
    'Select',
    'Checkbox',
    'Radio',
    'Switch',
    'FileUpload',
    'Textarea'
  ],
  
  advanced: [
    'ColorPicker',
    'DatePicker', 
    'RichTextEditor'
  ],
  
  data: [
    'Table',
    'TableHeader',
    'TableRow',
    'TableCell',
    'Pagination',
    'DataTable'
  ],
  
  feedback: [
    'Alert',
    'Toast',
    'Spinner',
    'Badge',
    'Tooltip'
  ],
  
  overlay: [
    'Dialog',
    'Sheet',
    'Popover'
  ],
  
  navigation: [
    'Tabs',
    'Breadcrumb',
    'Navigation',
    'MobileMenu'
  ],
  
  admin: [
    'AdminLayout',
    'AdminSidebar',
    'AdminHeader',
    'AdminMenu',
    'DashboardCard',
    'StatsCard',
    'FilterPanel'
  ],
  
  patterns: [
    'BlogCard',
    'FeatureCard',
    'PricingCard',
    'TeamCard',
    'TestimonialCard',
    'AuthForm',
    'ContactForm',

    'HeroSection',
    'FeatureSection',
    'CTASection'
  ]
};

// Performance monitoring
export const performanceMonitor = {
  measureComponentRender: (componentName: string) => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (duration > 16) { // > 1 frame at 60fps
        console.warn(`Slow component render: ${componentName} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    };
  },
  
  measureBundleLoad: (bundleName: string) => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      console.log(`Bundle loaded: ${bundleName} in ${duration.toFixed(2)}ms`);
      return duration;
    };
  }
};
