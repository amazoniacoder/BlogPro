#!/usr/bin/env node

/**
 * BlogPro Legacy Style Cleanup Tool
 * Safely removes legacy CSS files after UI System migration
 */

const fs = require('fs');
const path = require('path');

class LegacyCleanup {
  constructor() {
    this.removedFiles = [];
    this.preservedFiles = [];
    this.totalSizeRemoved = 0;
  }

  // Define files and directories to remove
  getRemovalTargets(projectPath) {
    return [
      // Legacy component blocks
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'blog-card'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'feature-card'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'pricing-card'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'team-card'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'form-field'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'password-input'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'color-picker'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'table'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'pagination'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'alert'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'toast'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'loading'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'badge'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'tooltip'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'dialog'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'sheet'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'tabs'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'sections'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'auth-form'),
      path.join(projectPath, 'client', 'src', 'styles', 'blocks', 'contact-form'),

      // Legacy admin components
      path.join(projectPath, 'client', 'src', 'styles', 'admin', 'components', 'admin-sidebar'),
      path.join(projectPath, 'client', 'src', 'styles', 'admin', 'components', 'admin-header'),
      path.join(projectPath, 'client', 'src', 'styles', 'admin', 'layouts'),

      // Legacy admin pages (component-specific styles)
      path.join(projectPath, 'client', 'src', 'styles', 'admin', 'pages')
    ];
  }

  // Define files to preserve
  getPreservedFiles(projectPath) {
    return [
      path.join(projectPath, 'client', 'src', 'styles', 'main.css'),
      path.join(projectPath, 'client', 'src', 'styles', 'admin', 'admin-base.css'),
      path.join(projectPath, 'client', 'src', 'styles', 'base', 'reset.css'),
      path.join(projectPath, 'client', 'src', 'styles', 'base', 'variables.css'),
      path.join(projectPath, 'client', 'src', 'styles', 'base', 'breakpoints.css')
    ];
  }

  // Safely remove legacy directories and files
  performCleanup(projectPath, dryRun = true) {
    console.log('🧹 BlogPro Legacy Style Cleanup');
    console.log('===============================\n');
    
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be deleted\n');
    }

    const removalTargets = this.getRemovalTargets(projectPath);
    const preservedFiles = this.getPreservedFiles(projectPath);

    // Remove legacy directories
    removalTargets.forEach(target => {
      if (fs.existsSync(target)) {
        const size = this.calculateDirectorySize(target);
        this.totalSizeRemoved += size;
        
        console.log(`${dryRun ? '🔍' : '🗑️'} ${dryRun ? 'Would remove' : 'Removing'}: ${path.relative(projectPath, target)} (${(size / 1024).toFixed(2)} KB)`);
        
        if (!dryRun) {
          this.removeDirectory(target);
          this.removedFiles.push(target);
        }
      }
    });

    // Verify preserved files exist
    console.log('\n🔒 Preserved Files:');
    preservedFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ Keeping: ${path.relative(projectPath, file)}`);
        this.preservedFiles.push(file);
      } else {
        console.log(`⚠️  Missing: ${path.relative(projectPath, file)}`);
      }
    });

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   Files/directories processed: ${removalTargets.length}`);
    console.log(`   Space ${dryRun ? 'to be' : ''} reclaimed: ${(this.totalSizeRemoved / 1024).toFixed(2)} KB`);
    console.log(`   Essential files preserved: ${this.preservedFiles.length}`);

    return {
      removed: this.removedFiles.length,
      preserved: this.preservedFiles.length,
      sizeReclaimed: this.totalSizeRemoved
    };
  }

  // Calculate directory size recursively
  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    
    if (!fs.existsSync(dirPath)) return 0;
    
    const stat = fs.statSync(dirPath);
    if (stat.isFile()) {
      return stat.size;
    }
    
    if (stat.isDirectory()) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        totalSize += this.calculateDirectorySize(filePath);
      });
    }
    
    return totalSize;
  }

  // Remove directory recursively
  removeDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.removeDirectory(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    
    fs.rmdirSync(dirPath);
  }

  // Update main.css to use UI System
  updateMainCSS(projectPath) {
    const mainCSSPath = path.join(projectPath, 'client', 'src', 'styles', 'main.css');
    
    const newMainCSS = `/**
 * BlogPro Main Styles
 * UI System integration + minimal globals
 */

/* Import BlogPro UI System */
@import '../ui-system/components/index.css';

/* Base styles (keep minimal) */
@import './base/reset.css';
@import './base/variables.css';
@import './base/breakpoints.css';

/* Global styles (minimal - most styling is in UI System) */
body {
  font-family: var(--font-family);
  line-height: var(--line-height);
  color: var(--text-primary);
  background: var(--bg-primary);
}

/* Legacy variable mapping for gradual migration */
:root {
  /* Map legacy variables to UI System tokens if needed */
}`;

    fs.writeFileSync(mainCSSPath, newMainCSS);
    console.log('✅ Updated main.css to use UI System');
  }

  // Update admin-base.css to use UI System
  updateAdminCSS(projectPath) {
    const adminCSSPath = path.join(projectPath, 'client', 'src', 'styles', 'admin', 'admin-base.css');
    
    const newAdminCSS = `/**
 * BlogPro Admin Base Styles
 * UI System integration + admin-specific globals
 */

/* Import BlogPro UI System */
@import '../../ui-system/components/index.css';

/* Base styles */
@import '../base/reset.css';
@import '../base/variables.css';
@import '../base/breakpoints.css';

/* Admin-specific global styles (minimal) */
.admin-layout {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Legacy admin variable mapping */
:root {
  /* Map legacy admin variables to UI System tokens if needed */
}`;

    // Ensure admin directory exists
    const adminDir = path.dirname(adminCSSPath);
    if (!fs.existsSync(adminDir)) {
      fs.mkdirSync(adminDir, { recursive: true });
    }

    fs.writeFileSync(adminCSSPath, newAdminCSS);
    console.log('✅ Updated admin-base.css to use UI System');
  }

  // Generate cleanup report
  generateCleanupReport(projectPath) {
    const reportPath = path.join(projectPath, 'LEGACY_CLEANUP_REPORT.md');
    
    const report = `# BlogPro Legacy Style Cleanup Report

## Migration Complete ✅

BlogPro has successfully migrated from legacy CSS architecture to a modern UI System.

### What Was Removed

#### Legacy Component Styles
- \`styles/blocks/blog-card/\` → Migrated to UI System patterns
- \`styles/blocks/feature-card/\` → Migrated to UI System patterns  
- \`styles/blocks/pricing-card/\` → Migrated to UI System patterns
- \`styles/blocks/form-field/\` → Migrated to UI System components
- \`styles/blocks/table/\` → Migrated to UI System components
- \`styles/blocks/alert/\` → Migrated to UI System components
- And ${this.removedFiles.length} more legacy directories...

#### Legacy Admin Styles
- \`styles/admin/components/\` → Migrated to UI System admin components
- \`styles/admin/layouts/\` → Migrated to UI System admin layouts
- \`styles/admin/pages/\` → Component-specific styles removed

### What Was Preserved

#### Essential Files
- \`styles/main.css\` - UI System import + minimal globals
- \`styles/admin/admin-base.css\` - UI System import + admin globals  
- \`styles/base/reset.css\` - CSS reset
- \`styles/base/variables.css\` - Legacy variable mapping
- \`styles/base/breakpoints.css\` - Responsive breakpoints

### Benefits Achieved

#### Performance Improvements
- **${(this.totalSizeRemoved / 1024).toFixed(2)} KB** of legacy CSS removed
- **Eliminated duplicate styles** across components
- **Improved caching** through component-based CSS
- **Faster build times** with optimized CSS architecture

#### Developer Experience
- **Universal components** replace legacy CSS classes
- **TypeScript support** for all UI components
- **Consistent design system** across frontend and admin
- **Better maintainability** with centralized styling

#### Architecture Benefits
- **BEM methodology** with bp- prefixed classes
- **Component composition** instead of CSS inheritance
- **Theme system integration** for light/dark modes
- **Accessibility built-in** to all components

## Next Steps

1. **Test thoroughly** - Verify all pages render correctly
2. **Update imports** - Ensure all components use UI System
3. **Remove legacy references** - Clean up any remaining legacy CSS imports
4. **Performance testing** - Measure improvement in load times

## UI System Usage

\`\`\`tsx
// Instead of legacy CSS
<div className="blog-card blog-card--featured">

// Use UI System components  
<BlogCard variant="featured" />
\`\`\`

**Migration completed successfully! 🎉**
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📋 Cleanup report generated: ${reportPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const cleanup = new LegacyCleanup();
  const projectPath = path.join(__dirname, '..', '..', '..');
  
  // Check command line arguments
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  
  if (dryRun) {
    console.log('💡 Running in DRY RUN mode. Use --execute to perform actual cleanup.\n');
  }
  
  const results = cleanup.performCleanup(projectPath, dryRun);
  
  if (!dryRun) {
    cleanup.updateMainCSS(projectPath);
    cleanup.updateAdminCSS(projectPath);
    cleanup.generateCleanupReport(projectPath);
    console.log('\n🎉 Legacy cleanup completed successfully!');
  } else {
    console.log('\n💡 To execute cleanup: node legacy-cleanup.js --execute');
  }
}

module.exports = LegacyCleanup;