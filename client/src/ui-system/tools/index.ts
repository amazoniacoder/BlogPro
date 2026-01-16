/**
 * BlogPro Performance & Optimization Tools
 * Development and optimization utilities
 */

// Lazy loading utilities
export { 
  createLazyComponent,
  LazyDialog,
  LazySheet,
  LazyDataTable,
  LazyRichTextEditor,
  LazyColorPicker,
  LazyDatePicker
} from './lazy-loading';

// Tree shaking optimization
export {
  createOptimizedImports,
  bundleConfig,
  performanceMonitor
} from './tree-shaking';

// Performance monitoring
export {
  usePerformanceMonitor,
  PerformanceMonitor,
  withPerformanceMonitoring,
  trackBundleSize,
  ProfiledComponent
} from './performance-monitor';

// Accessibility utilities
export {
  aria,
  useKeyboardNavigation,
  useFocusManagement,
  useScreenReader,
  SkipLink,
  AccessibleHeading,
  LiveRegion,
  FocusIndicator
} from './accessibility';

// Accessibility testing
export {
  AccessibilityTester,
  AccessibilityTestRunner
} from './accessibility-test';

// Enhanced keyboard navigation
export {
  useEnhancedKeyboardNavigation,
  KeyboardNavigationProvider,
  FocusTrap
} from './keyboard-navigation';

// BlogPro Icon System Migration
export {
  BLOGPRO_ICON_MAPPING,
  migrateIconName,
  validateBlogProIcon,
  getAllBlogProIcons,
  BlogProIconAnalyzer,
  getBlogProIconOptimizations
} from './icon-migration';

// External Icon Removal
export {
  ExternalIconRemover,
  validateBlogProIconUsage,
  generateBlogProIconDocs
} from './external-icon-remover';

// Migration Analysis Tools
export {
  ComponentVerifier,
  PerformanceComparator
} from './component-verifier';

// Legacy Cleanup Tools (JavaScript modules - no TypeScript export)
// Use: const LegacyCleanup = require('./legacy-cleanup');
// Use: const StyleOptimizer = require('./style-optimizer');
// Use: const FinalOptimizer = require('./final-optimizer');

// Migration Testing and Execution Tools
// Use: const MigrationTestRunner = require('./run-migration-test');
// Use: const MigrationVerifier = require('./verify-migration');
// Execute: node tools/execute-cleanup.js

// Import styles
import './performance-monitor.css';
import './accessibility.css';

export type { PerformanceMetrics } from './performance-monitor';
export type { AccessibilityIssue } from './accessibility-test';
export type { BlogProIconName, BlogProIconValue } from './icon-migration';
export type { ComponentVerificationResult } from './component-verifier';
