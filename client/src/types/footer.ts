// Footer Visual Editor Types
export interface FooterConfig {
  id?: string;
  version: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  layout: FooterLayout;
  blocks: FooterBlock[];
  styles: FooterStyles;
  responsive: ResponsiveConfig;
  visibility: VisibilityConfig;
}

export interface FooterLayout {
  type: 'grid' | 'flex' | 'columns';
  columns: number;
  gap: string;
  maxWidth: string;
}

export interface FooterBlock {
  id: string;
  type: 'brand' | 'links' | 'contact' | 'social' | 'newsletter' | 'custom';
  position: { x: number; y: number };
  size: { width: string; height: string };
  content: any;
  styles: any;
}

export interface FooterStyles {
  theme: 'light' | 'dark' | 'custom';
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  borderColor: string;
  padding: string;
  margin: string;
}

export interface ResponsiveConfig {
  mobile: Partial<FooterConfig>;
  tablet: Partial<FooterConfig>;
}

export interface VisibilityConfig {
  showOnScroll: boolean;
  hideOnPages: string[];
  showOnlyOnPages: string[];
}