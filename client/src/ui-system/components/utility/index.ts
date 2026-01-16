/**
 * BlogPro Utility Components
 * Layout and spacing utility exports
 */

export { Divider } from './Divider';
export { Spacer } from './Spacer';
export { Container } from './Container';
export { Stack } from './Stack';
export { LanguageDetector } from './LanguageDetector';
export { LanguageSwitcher } from './LanguageSwitcher';
export { SEOHead } from './SEOHead';
export { BlogStructuredData, WebsiteStructuredData } from './StructuredData';
export { getUserDisplayName, getUserAvatar, getUserInitials } from './userUtils';

export type { DividerProps } from './Divider';
export type { SpacerProps } from './Spacer';
export type { ContainerProps } from './Container';
export type { StackProps } from './Stack';
export type { LanguageSwitcherProps } from './LanguageSwitcher';
export type { SEOHeadProps } from './SEOHead';
export type { BlogStructuredDataProps, WebsiteStructuredDataProps } from './StructuredData';

// Import utility styles
import './utility.css';
