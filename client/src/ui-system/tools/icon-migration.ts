/**
 * BlogPro Icon System Migration
 * Consolidates and optimizes BlogPro's custom icon system
 */

// BlogPro Custom Icon System - Designed specifically for BlogPro website
// These icons are proprietary to BlogPro and optimized for the platform's needs

export const BLOGPRO_ICON_MAPPING = {
  // Navigation icons - BlogPro custom navigation set
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down', 
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'chevron-up': 'arrow-up',
  'chevron-down': 'arrow-down',
  'chevron-left': 'arrow-left', 
  'chevron-right': 'arrow-right',
  'home': 'house',
  'menu': 'hamburger',
  'search': 'search',

  // Action icons - BlogPro custom action set
  'plus': 'add',
  'edit': 'edit',
  'trash': 'delete',
  'save': 'save',
  'close': 'x',
  'x': 'x',
  'login': 'login',
  'logout': 'logout',
  'log-out': 'logout',

  // User icons - BlogPro custom user set
  'user': 'user',
  'users': 'users',
  'admin': 'admin',

  // Content icons - BlogPro custom content set
  'image': 'image',
  'book': 'book',
  'file': 'book',

  // Theme icons - BlogPro custom theme set
  'sun': 'sun',
  'moon': 'moon',
  'light': 'sun',
  'dark': 'moon',

  // Tool icons - BlogPro custom tool set
  'settings': 'gear',
  'gear': 'gear',
  'wrench': 'wrench',
  'tools': 'wrench',

  // Analytics icons - BlogPro custom analytics set
  'analytics': 'monkey-running',
  'performance': 'rocket-diamond',
  'growth': 'tree-diamond',
  'success': 'smile-diamond',

  // Alert icons - BlogPro custom alert set
  'alert': 'alert-circle',
  'warning': 'alert-circle',
  'error': 'alert-circle',
  'info': 'alert-circle'
} as const;

export type BlogProIconName = keyof typeof BLOGPRO_ICON_MAPPING;
export type BlogProIconValue = typeof BLOGPRO_ICON_MAPPING[BlogProIconName];

// Icon migration utility
export const migrateIconName = (iconName: string): BlogProIconValue | null => {
  const normalizedName = iconName.toLowerCase().replace(/[_-]/g, '-');
  return BLOGPRO_ICON_MAPPING[normalizedName as BlogProIconName] || null;
};

// Validate BlogPro icon usage
export const validateBlogProIcon = (iconName: string): boolean => {
  const validIcons = Object.values(BLOGPRO_ICON_MAPPING);
  return validIcons.includes(iconName as BlogProIconValue);
};

// Get all available BlogPro icons
export const getAllBlogProIcons = (): BlogProIconValue[] => {
  return Array.from(new Set(Object.values(BLOGPRO_ICON_MAPPING)));
};

// Icon usage analyzer
export class BlogProIconAnalyzer {
  private iconUsage = new Map<string, number>();
  private externalIcons = new Set<string>();

  analyzeComponent(componentContent: string, filePath: string) {
    // Find icon usage patterns in BlogPro components
    const iconPatterns = [
      /name=['"]([^'"]+)['"]/g,  // Icon component name prop
      /icon=['"]([^'"]+)['"]/g,  // Generic icon prop
      /iconName=['"]([^'"]+)['"]/g // IconName prop
    ];

    iconPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(componentContent)) !== null) {
        const iconName = match[1];
        
        if (validateBlogProIcon(iconName)) {
          // This is a valid BlogPro icon
          this.iconUsage.set(iconName, (this.iconUsage.get(iconName) || 0) + 1);
        } else {
          // This might be an external icon that needs migration
          const migratedIcon = migrateIconName(iconName);
          if (migratedIcon) {
            console.warn(`📦 BlogPro Icon Migration: "${iconName}" in ${filePath} should use "${migratedIcon}"`);
          } else {
            this.externalIcons.add(iconName);
            console.warn(`⚠️  Unknown icon "${iconName}" in ${filePath} - not part of BlogPro icon system`);
          }
        }
      }
    });
  }

  generateReport() {
    console.log('\n🎨 BlogPro Icon System Analysis Report');
    console.log('=====================================');
    console.log('BlogPro uses a custom-designed icon system optimized for the platform\n');
    
    console.log('📊 BlogPro Icon Usage:');
    const sortedUsage = Array.from(this.iconUsage.entries())
      .sort(([,a], [,b]) => b - a);
    
    sortedUsage.forEach(([icon, count]) => {
      console.log(`   ${icon}: ${count} uses`);
    });

    if (this.externalIcons.size > 0) {
      console.log('\n⚠️  External Icons Found (need migration):');
      this.externalIcons.forEach(icon => {
        const suggestion = migrateIconName(icon);
        if (suggestion) {
          console.log(`   ${icon} → ${suggestion} (BlogPro equivalent)`);
        } else {
          console.log(`   ${icon} → No BlogPro equivalent found`);
        }
      });
    }

    console.log(`\n✅ Total BlogPro icons in use: ${this.iconUsage.size}`);
    console.log(`📦 Available BlogPro icons: ${getAllBlogProIcons().length}`);
    console.log(`⚠️  External icons to migrate: ${this.externalIcons.size}`);

    return {
      blogProIconsUsed: this.iconUsage.size,
      totalUsage: Array.from(this.iconUsage.values()).reduce((a, b) => a + b, 0),
      externalIcons: this.externalIcons.size,
      mostUsedIcons: sortedUsage.slice(0, 10)
    };
  }
}

// BlogPro icon optimization recommendations
export const getBlogProIconOptimizations = () => {
  return {
    recommendations: [
      '🎨 All icons are custom-designed for BlogPro platform',
      '📦 Icons are organized by category (navigation, actions, users, etc.)',
      '⚡ SVG icons are optimized for performance and accessibility',
      '🎯 Icon names follow BlogPro naming conventions',
      '📱 Icons work perfectly with BlogPro theme system',
      '♿ All icons include proper ARIA labels and accessibility features'
    ],
    
    benefits: [
      'Consistent visual language across BlogPro platform',
      'Optimized file sizes for better performance', 
      'No external dependencies or licensing issues',
      'Perfect integration with BlogPro design system',
      'Custom analytics and theme icons for BlogPro features'
    ]
  };
};
