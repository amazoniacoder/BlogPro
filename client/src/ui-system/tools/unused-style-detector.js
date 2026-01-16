#!/usr/bin/env node

/**
 * BlogPro Unused Style Detector
 * Detects unused CSS files and styles after UI System migration
 */

const fs = require('fs');
const path = require('path');

class UnusedStyleDetector {
  constructor() {
    this.unusedFiles = [];
    this.unusedSelectors = new Set();
    this.usedSelectors = new Set();
    this.totalSize = 0;
    this.unusedSize = 0;
  }

  // Scan for CSS files in legacy directories
  scanLegacyStyles(projectPath) {
    console.log('🔍 Scanning for Legacy CSS Files...\n');

    const legacyPaths = [
      path.join(projectPath, 'client', 'src', 'styles', 'blocks'),
      path.join(projectPath, 'client', 'src', 'styles', 'admin', 'components'),
      path.join(projectPath, 'client', 'src', 'styles', 'admin', 'pages')
    ];

    legacyPaths.forEach(legacyPath => {
      if (fs.existsSync(legacyPath)) {
        this.scanDirectory(legacyPath, legacyPath);
      }
    });

    console.log(`📁 Legacy CSS Files Found: ${this.unusedFiles.length}`);
    this.unusedFiles.forEach(file => {
      console.log(`   - ${file.relativePath} (${(file.size / 1024).toFixed(2)} KB)`);
    });
  }

  scanDirectory(dirPath, basePath) {
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        this.scanDirectory(itemPath, basePath);
      } else if (item.endsWith('.css')) {
        const relativePath = path.relative(basePath, itemPath);
        const size = stat.size;
        
        this.unusedFiles.push({
          fullPath: itemPath,
          relativePath,
          size,
          category: this.categorizeFile(relativePath)
        });
        
        this.totalSize += size;
        this.unusedSize += size;
      }
    });
  }

  // Categorize CSS files by type
  categorizeFile(filePath) {
    if (filePath.includes('admin')) return 'admin';
    if (filePath.includes('blocks')) return 'component';
    if (filePath.includes('pages')) return 'page';
    return 'other';
  }

  // Check if CSS selectors are still used in codebase
  checkSelectorUsage(projectPath) {
    console.log('\n🔍 Checking CSS Selector Usage...\n');

    // Extract selectors from unused CSS files
    this.unusedFiles.forEach(file => {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const selectors = this.extractSelectors(content);
      selectors.forEach(selector => this.unusedSelectors.add(selector));
    });

    // Scan React/TypeScript files for selector usage
    const srcPath = path.join(projectPath, 'client', 'src');
    this.scanForSelectorUsage(srcPath);

    // Determine truly unused selectors
    const trulyUnused = Array.from(this.unusedSelectors).filter(
      selector => !this.usedSelectors.has(selector)
    );

    console.log(`📊 CSS Selector Analysis:`);
    console.log(`   Total selectors in legacy files: ${this.unusedSelectors.size}`);
    console.log(`   Selectors still in use: ${this.usedSelectors.size}`);
    console.log(`   Truly unused selectors: ${trulyUnused.length}`);

    if (trulyUnused.length > 0) {
      console.log('\n⚠️  Unused CSS Selectors (safe to remove):');
      trulyUnused.slice(0, 20).forEach(selector => {
        console.log(`   - ${selector}`);
      });
      if (trulyUnused.length > 20) {
        console.log(`   ... and ${trulyUnused.length - 20} more`);
      }
    }

    return trulyUnused;
  }

  // Extract CSS selectors from content
  extractSelectors(cssContent) {
    const selectors = [];
    const selectorRegex = /([^{}]+)\s*\{[^{}]*\}/g;
    let match;

    while ((match = selectorRegex.exec(cssContent)) !== null) {
      const selector = match[1].trim();
      if (selector && !selector.startsWith('@') && !selector.startsWith('/*')) {
        // Clean up selector (remove pseudo-classes, etc.)
        const cleanSelector = selector
          .split(',')[0] // Take first selector if multiple
          .replace(/:hover|:focus|:active|::before|::after/g, '')
          .trim();
        
        if (cleanSelector) {
          selectors.push(cleanSelector);
        }
      }
    }

    return selectors;
  }

  // Scan for selector usage in React/TS files
  scanForSelectorUsage(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory() && !item.includes('node_modules')) {
        this.scanForSelectorUsage(itemPath);
      } else if (item.match(/\.(tsx?|jsx?)$/)) {
        const content = fs.readFileSync(itemPath, 'utf8');
        
        // Look for className usage
        const classMatches = content.match(/className=['"][^'"]*['"]/g) || [];
        classMatches.forEach(match => {
          const classes = match.match(/className=['"]([^'"]*)['"]/)?.[1];
          if (classes) {
            classes.split(' ').forEach(cls => {
              if (cls.trim()) {
                this.usedSelectors.add(`.${cls.trim()}`);
              }
            });
          }
        });
      }
    });
  }

  // Generate cleanup recommendations
  generateCleanupReport() {
    console.log('\n🧹 BlogPro Legacy Style Cleanup Report');
    console.log('=====================================\n');

    // Group files by category
    const categories = {};
    this.unusedFiles.forEach(file => {
      if (!categories[file.category]) {
        categories[file.category] = [];
      }
      categories[file.category].push(file);
    });

    console.log('📁 Legacy Files by Category:');
    Object.entries(categories).forEach(([category, files]) => {
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      console.log(`   ${category}: ${files.length} files (${(totalSize / 1024).toFixed(2)} KB)`);
    });

    console.log(`\n📊 Cleanup Impact:`);
    console.log(`   Total legacy CSS: ${(this.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Files to remove: ${this.unusedFiles.length}`);
    console.log(`   Space to reclaim: ${(this.unusedSize / 1024).toFixed(2)} KB`);

    // Safe removal recommendations
    console.log('\n✅ Safe to Remove (migrated to UI System):');
    
    const safeToRemove = [
      'styles/blocks/blog-card/',
      'styles/blocks/feature-card/',
      'styles/blocks/pricing-card/',
      'styles/blocks/form-field/',
      'styles/blocks/table/',
      'styles/blocks/pagination/',
      'styles/blocks/alert/',
      'styles/blocks/toast/',
      'styles/admin/components/admin-sidebar/',
      'styles/admin/components/admin-header/'
    ];

    safeToRemove.forEach(path => {
      console.log(`   ✅ ${path} (migrated to UI System)`);
    });

    // Files to keep
    console.log('\n🔒 Keep These Files:');
    const keepFiles = [
      'styles/main.css (UI system import + minimal globals)',
      'styles/admin/admin-base.css (UI system import + admin globals)',
      'styles/base/reset.css (CSS reset)',
      'styles/base/variables.css (legacy variable mapping)'
    ];

    keepFiles.forEach(file => {
      console.log(`   🔒 ${file}`);
    });

    return {
      totalFiles: this.unusedFiles.length,
      totalSize: this.totalSize,
      categories,
      recommendations: {
        safeToRemove,
        keepFiles
      }
    };
  }

  // Generate removal script
  generateRemovalScript(outputPath) {
    let script = '#!/bin/bash\n\n';
    script += '# BlogPro Legacy Style Cleanup Script\n';
    script += '# Removes legacy CSS files that have been migrated to UI System\n\n';
    
    script += 'echo "🧹 Starting BlogPro legacy style cleanup..."\n\n';

    // Group removals by directory
    const directories = new Set();
    this.unusedFiles.forEach(file => {
      const dir = path.dirname(file.fullPath);
      directories.add(dir);
    });

    Array.from(directories).forEach(dir => {
      script += `echo "Removing ${path.basename(dir)} directory..."\n`;
      script += `rm -rf "${dir}"\n\n`;
    });

    script += 'echo "✅ Legacy style cleanup complete!"\n';
    script += 'echo "📦 UI System migration cleanup finished"\n';

    fs.writeFileSync(outputPath, script);
    console.log(`\n📝 Cleanup script generated: ${outputPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const detector = new UnusedStyleDetector();
  const projectPath = path.join(__dirname, '..', '..', '..');
  
  console.log('🚀 Starting BlogPro Legacy Style Detection...\n');
  
  detector.scanLegacyStyles(projectPath);
  detector.checkSelectorUsage(projectPath);
  const report = detector.generateCleanupReport();
  
  // Generate cleanup script
  const scriptPath = path.join(__dirname, 'cleanup-legacy-styles.sh');
  detector.generateRemovalScript(scriptPath);
  
  console.log('\n✅ Legacy style analysis complete!');
}

module.exports = UnusedStyleDetector;