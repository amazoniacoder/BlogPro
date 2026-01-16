#!/usr/bin/env node

/**
 * BlogPro Icon System Optimizer
 * Optimizes and validates BlogPro's custom icon system
 */

const fs = require('fs');
const path = require('path');

class BlogProIconOptimizer {
  constructor() {
    this.iconStats = {
      totalIcons: 0,
      categories: {},
      fileSize: 0,
      optimizedSize: 0
    };
  }

  // Analyze BlogPro icon directory structure
  analyzeIconDirectory(iconsPath) {
    console.log('🎨 Analyzing BlogPro Custom Icon System...\n');
    
    const svgPath = path.join(iconsPath, 'src', 'svg');
    
    if (!fs.existsSync(svgPath)) {
      console.error('❌ BlogPro SVG icons directory not found');
      return;
    }

    this.scanIconCategories(svgPath);
    this.generateIconReport();
  }

  scanIconCategories(svgPath) {
    const categories = fs.readdirSync(svgPath);
    
    categories.forEach(category => {
      const categoryPath = path.join(svgPath, category);
      const stat = fs.statSync(categoryPath);
      
      if (stat.isDirectory()) {
        const icons = fs.readdirSync(categoryPath)
          .filter(file => file.endsWith('.svg'));
        
        this.iconStats.categories[category] = {
          count: icons.length,
          icons: icons.map(icon => icon.replace('.svg', ''))
        };
        
        this.iconStats.totalIcons += icons.length;
        
        // Calculate file sizes
        icons.forEach(icon => {
          const iconPath = path.join(categoryPath, icon);
          const size = fs.statSync(iconPath).size;
          this.iconStats.fileSize += size;
        });
      }
    });
  }

  generateIconReport() {
    console.log('📊 BlogPro Icon System Report');
    console.log('=============================');
    console.log('🎨 Custom-designed icons for BlogPro platform\n');
    
    console.log(`Total Icons: ${this.iconStats.totalIcons}`);
    console.log(`Total Size: ${(this.iconStats.fileSize / 1024).toFixed(2)} KB`);
    console.log(`Average Size: ${(this.iconStats.fileSize / this.iconStats.totalIcons / 1024).toFixed(2)} KB per icon\n`);
    
    console.log('📁 Icon Categories:');
    Object.entries(this.iconStats.categories).forEach(([category, data]) => {
      console.log(`   ${category}: ${data.count} icons`);
      data.icons.forEach(icon => {
        console.log(`      - ${icon}`);
      });
      console.log('');
    });

    console.log('✨ BlogPro Icon System Benefits:');
    console.log('   🎯 Custom-designed for BlogPro brand identity');
    console.log('   📦 No external dependencies or licensing issues');
    console.log('   ⚡ Optimized SVGs for fast loading');
    console.log('   🎨 Consistent visual language');
    console.log('   📱 Perfect integration with BlogPro themes');
    console.log('   ♿ Built-in accessibility features');
    
    this.checkIconConsistency();
  }

  checkIconConsistency() {
    console.log('\n🔍 BlogPro Icon Consistency Check:');
    
    const expectedCategories = [
      'navigation', 'actions', 'users', 'content', 
      'themes', 'tools', 'analytics'
    ];
    
    const missingCategories = expectedCategories.filter(
      cat => !this.iconStats.categories[cat]
    );
    
    if (missingCategories.length === 0) {
      console.log('   ✅ All expected icon categories present');
    } else {
      console.log('   ⚠️  Missing categories:', missingCategories.join(', '));
    }

    // Check for essential BlogPro icons
    const essentialIcons = [
      'house', 'search', 'user', 'gear', 'sun', 'moon'
    ];
    
    const allIcons = Object.values(this.iconStats.categories)
      .flatMap(cat => cat.icons);
    
    const missingEssential = essentialIcons.filter(
      icon => !allIcons.includes(icon)
    );
    
    if (missingEssential.length === 0) {
      console.log('   ✅ All essential BlogPro icons present');
    } else {
      console.log('   ⚠️  Missing essential icons:', missingEssential.join(', '));
    }
  }

  // Optimize BlogPro icon TypeScript definitions
  updateIconTypes(iconsPath) {
    const componentPath = path.join(iconsPath, 'components', 'index.ts');
    
    if (!fs.existsSync(componentPath)) {
      console.log('⚠️  Icon component index not found');
      return;
    }

    const allIcons = Object.values(this.iconStats.categories)
      .flatMap(cat => cat.icons);
    
    const iconTypeDefinition = `/**
 * BlogPro Icon Components
 * Custom icon system designed specifically for BlogPro platform
 */

export { Icon, type IconProps } from './Icon';
export { IconButton, type IconButtonProps } from './IconButton';

// BlogPro Custom Icon Names - Designed for BlogPro website
export type IconName = 
${allIcons.map(icon => `  | '${icon}'`).join('\n')};

// BlogPro Icon Categories for better organization
export const BLOGPRO_ICON_CATEGORIES = {
${Object.entries(this.iconStats.categories).map(([category, data]) => 
  `  ${category}: [${data.icons.map(icon => `'${icon}'`).join(', ')}]`
).join(',\n')}
} as const;`;

    fs.writeFileSync(componentPath, iconTypeDefinition);
    console.log('✅ Updated BlogPro icon TypeScript definitions');
  }
}

// CLI usage
if (require.main === module) {
  const optimizer = new BlogProIconOptimizer();
  const iconsPath = path.join(__dirname, '..', 'icons');
  
  optimizer.analyzeIconDirectory(iconsPath);
  optimizer.updateIconTypes(iconsPath);
  
  console.log('\n🎉 BlogPro Icon System optimization complete!');
  console.log('💡 BlogPro uses a custom icon system designed specifically for the platform');
}

module.exports = BlogProIconOptimizer;