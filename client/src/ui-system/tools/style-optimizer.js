#!/usr/bin/env node

/**
 * BlogPro Style Optimizer
 * Optimizes remaining CSS files after cleanup
 */

const fs = require('fs');
const path = require('path');

class StyleOptimizer {
  constructor() {
    this.optimizations = [];
    this.totalSavings = 0;
  }

  // Optimize main.css file
  optimizeMainCSS(projectPath) {
    const mainCSSPath = path.join(projectPath, 'client', 'src', 'styles', 'main.css');
    
    if (!fs.existsSync(mainCSSPath)) {
      console.log('⚠️  main.css not found, creating optimized version...');
      this.createOptimizedMainCSS(projectPath);
      return;
    }

    const originalContent = fs.readFileSync(mainCSSPath, 'utf8');
    const originalSize = originalContent.length;

    const optimizedContent = `/**
 * BlogPro Main Styles
 * Optimized UI System integration
 */

/* BlogPro UI System - Single import for all components */
@import '../ui-system/components/index.css';

/* Essential base styles only */
@import './base/reset.css';
@import './base/variables.css';
@import './base/breakpoints.css';

/* Minimal global styles */
body {
  font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  line-height: var(--line-height, 1.5);
  color: var(--text-primary);
  background: var(--bg-primary);
  margin: 0;
  padding: 0;
}

/* Focus management for accessibility */
*:focus-visible {
  outline: 2px solid var(--primary-600);
  outline-offset: 2px;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}`;

    fs.writeFileSync(mainCSSPath, optimizedContent);
    
    const newSize = optimizedContent.length;
    const savings = originalSize - newSize;
    
    this.optimizations.push({
      file: 'main.css',
      originalSize,
      newSize,
      savings,
      description: 'Optimized to use UI System imports only'
    });

    console.log(`✅ Optimized main.css (${(savings / 1024).toFixed(2)} KB saved)`);
  }

  // Create optimized main.css if it doesn't exist
  createOptimizedMainCSS(projectPath) {
    const mainCSSPath = path.join(projectPath, 'client', 'src', 'styles', 'main.css');
    const stylesDir = path.dirname(mainCSSPath);
    
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }

    const content = `/**
 * BlogPro Main Styles
 * UI System integration + minimal globals
 */

/* BlogPro UI System */
@import '../ui-system/components/index.css';

/* Base styles */
@import './base/reset.css';
@import './base/variables.css';
@import './base/breakpoints.css';

/* Global styles (minimal) */
body {
  font-family: var(--font-family);
  line-height: var(--line-height);
  color: var(--text-primary);
  background: var(--bg-primary);
}`;

    fs.writeFileSync(mainCSSPath, content);
    console.log('✅ Created optimized main.css');
  }

  // Optimize admin-base.css file
  optimizeAdminCSS(projectPath) {
    const adminCSSPath = path.join(projectPath, 'client', 'src', 'styles', 'admin', 'admin-base.css');
    
    if (!fs.existsSync(adminCSSPath)) {
      console.log('⚠️  admin-base.css not found, creating optimized version...');
      this.createOptimizedAdminCSS(projectPath);
      return;
    }

    const originalContent = fs.readFileSync(adminCSSPath, 'utf8');
    const originalSize = originalContent.length;

    const optimizedContent = `/**
 * BlogPro Admin Base Styles
 * Optimized UI System integration for admin panel
 */

/* BlogPro UI System - Includes all admin components */
@import '../../ui-system/components/index.css';

/* Base styles */
@import '../base/reset.css';
@import '../base/variables.css';
@import '../base/breakpoints.css';

/* Admin-specific optimizations */
.admin-layout {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
}

/* Admin performance optimizations */
.admin-content {
  will-change: transform;
}

/* Admin accessibility enhancements */
.admin-skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-600);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 10000;
}

.admin-skip-link:focus {
  top: 6px;
}`;

    fs.writeFileSync(adminCSSPath, optimizedContent);
    
    const newSize = optimizedContent.length;
    const savings = originalSize - newSize;
    
    this.optimizations.push({
      file: 'admin-base.css',
      originalSize,
      newSize,
      savings,
      description: 'Optimized admin styles with UI System integration'
    });

    console.log(`✅ Optimized admin-base.css (${(savings / 1024).toFixed(2)} KB saved)`);
  }

  // Create optimized admin-base.css if it doesn't exist
  createOptimizedAdminCSS(projectPath) {
    const adminCSSPath = path.join(projectPath, 'client', 'src', 'styles', 'admin', 'admin-base.css');
    const adminDir = path.dirname(adminCSSPath);
    
    if (!fs.existsSync(adminDir)) {
      fs.mkdirSync(adminDir, { recursive: true });
    }

    const content = `/**
 * BlogPro Admin Base Styles
 * UI System integration + admin globals
 */

/* BlogPro UI System */
@import '../../ui-system/components/index.css';

/* Base styles */
@import '../base/reset.css';
@import '../base/variables.css';
@import '../base/breakpoints.css';

/* Admin layout */
.admin-layout {
  min-height: 100vh;
  background: var(--bg-primary);
}`;

    fs.writeFileSync(adminCSSPath, content);
    console.log('✅ Created optimized admin-base.css');
  }

  // Remove duplicate imports from CSS files
  removeDuplicateImports(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const seenImports = new Set();
    const optimizedLines = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('@import')) {
        if (!seenImports.has(trimmedLine)) {
          seenImports.add(trimmedLine);
          optimizedLines.push(line);
        }
      } else {
        optimizedLines.push(line);
      }
    });

    const optimizedContent = optimizedLines.join('\n');
    
    if (content !== optimizedContent) {
      fs.writeFileSync(filePath, optimizedContent);
      const savings = content.length - optimizedContent.length;
      this.totalSavings += savings;
      console.log(`✅ Removed duplicate imports from ${path.basename(filePath)} (${savings} bytes saved)`);
    }
  }

  // Minimize global styles
  minimizeGlobalStyles(projectPath) {
    console.log('\n🎯 Minimizing Global Styles...');

    const globalFiles = [
      path.join(projectPath, 'client', 'src', 'styles', 'main.css'),
      path.join(projectPath, 'client', 'src', 'styles', 'admin', 'admin-base.css')
    ];

    globalFiles.forEach(file => {
      this.removeDuplicateImports(file);
    });

    console.log('✅ Global styles minimized');
  }

  // Generate optimization report
  generateOptimizationReport() {
    console.log('\n📊 BlogPro Style Optimization Report');
    console.log('===================================\n');

    if (this.optimizations.length === 0) {
      console.log('✅ No optimizations needed - styles already optimized!');
      return;
    }

    console.log('🎯 Optimizations Applied:');
    this.optimizations.forEach(opt => {
      console.log(`   ${opt.file}:`);
      console.log(`     Description: ${opt.description}`);
      console.log(`     Size reduction: ${(opt.savings / 1024).toFixed(2)} KB`);
      console.log(`     Before: ${(opt.originalSize / 1024).toFixed(2)} KB`);
      console.log(`     After: ${(opt.newSize / 1024).toFixed(2)} KB`);
      console.log('');
    });

    const totalSavings = this.optimizations.reduce((sum, opt) => sum + opt.savings, 0) + this.totalSavings;
    
    console.log(`📈 Total Optimization Impact:`);
    console.log(`   Files optimized: ${this.optimizations.length}`);
    console.log(`   Total space saved: ${(totalSavings / 1024).toFixed(2)} KB`);
    
    console.log('\n✨ Optimization Benefits:');
    console.log('   ✅ Single UI System import reduces HTTP requests');
    console.log('   ✅ Eliminated duplicate CSS imports');
    console.log('   ✅ Minimal global styles improve performance');
    console.log('   ✅ Better browser caching with component-based CSS');
    console.log('   ✅ Reduced bundle size for faster loading');

    return {
      optimizations: this.optimizations.length,
      totalSavings,
      files: this.optimizations.map(opt => opt.file)
    };
  }

  // Run all optimizations
  runOptimizations(projectPath) {
    console.log('🚀 Starting BlogPro Style Optimization...\n');

    this.optimizeMainCSS(projectPath);
    this.optimizeAdminCSS(projectPath);
    this.minimizeGlobalStyles(projectPath);

    const results = this.generateOptimizationReport();
    
    console.log('\n🎉 Style optimization completed!');
    return results;
  }
}

// CLI usage
if (require.main === module) {
  const optimizer = new StyleOptimizer();
  const projectPath = path.join(__dirname, '..', '..', '..');
  
  optimizer.runOptimizations(projectPath);
}

module.exports = StyleOptimizer;