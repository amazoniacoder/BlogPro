// Footer Visual Editor Types
export interface FooterConfig {
  id?: number;
  version: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  
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
  content: BlockContent;
  styles: BlockStyles;
}

export interface BlockContent {
  // Brand block
  logo?: string;
  title?: string;
  description?: string;
  
  // Links block
  links?: Array<{
    label: string;
    url: string;
    target?: '_blank' | '_self';
  }>;
  
  // Contact block
  address?: string;
  phone?: string;
  email?: string;
  
  // Social block
  socialLinks?: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
  
  // Newsletter block
  placeholder?: string;
  buttonText?: string;
  
  // Custom block
  html?: string;
  text?: string;
}

export interface BlockStyles {
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  border?: string;
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

export interface FooterHistory {
  id: number;
  footerConfigId: number;
  config: FooterConfig;
  changeDescription: string;
  createdAt: string;
  createdBy: string;
}

// API Response types
export interface FooterConfigResponse {
  success: boolean;
  data: FooterConfig;
  message?: string;
}

export interface FooterConfigsResponse {
  success: boolean;
  data: FooterConfig[];
  message?: string;
}

export interface FooterHistoryResponse {
  success: boolean;
  data: FooterHistory[];
  message?: string;
}