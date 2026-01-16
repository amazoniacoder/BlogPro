#!/usr/bin/env node

/**
 * BlogPro Migration Verification Script
 * Verifies the migration was completed successfully
 */

const fs = require('fs');
const path = require('path');

class MigrationVerifier {
  constructor() {
    this.projectPath = path.join(__dirname, '..', '..', '..');
    this.issues = [];
    this.successes = [];
  }

  // Check if legacy directories were removed
  checkLegacyRemoval() {
    console.log('🔍 Checking Legacy File Removal...\n');

    const legacyPaths = [
      'client/src/styles/blocks/blog-card',
      'client/src/styles/blocks/feature-card',
      'client/src/styles/blocks/pricing-card',
      'client/src/styles/blocks/form-field',
      'client/src/styles/blocks/table',
      'client/src/styles/blocks/alert',
      'client/src/styles/admin/components/admin-sidebar',
      'client/src/styles/admin/components/admin-header',
      'client/src/styles/admin/layouts',
      'client/src/styles/admin/pages'
    ];

    legacyPaths.forEach(legacyPath => {
      const fullPath = path.join(this.projectPath, legacyPath);
      if (fs.existsSync(fullPath)) {
        this.issues.push(`❌ Legacy directory still exists: ${legacyPath}`);
      } else {
        this.successes.push(`✅ Legacy directory removed: ${legacyPath}`);
      }
    });
  }

  // Check if essential files are preserved
  checkEssentialFiles() {
    console.log('🔒 Checking Essential File Preservation...\n');

    const essentialFiles = [
      'client/src/styles/main.css',
      'client/src/styles/admin/admin-base.css',
      'client/src/styles/base/reset.css',
      'client/src/styles/base/variables.css',
      'client/src/ui-system/components/index.css',
      'client/src/ui-system/components/index.ts'
    ];

    essentialFiles.forEach(file => {
      const fullPath = path.join(this.projectPath, file);
      if (fs.existsSync(fullPath)) {
        this.successes.push(`✅ Essential file preserved: ${file}`);
      } else {
        this.issues.push(`❌ Essential file missing: ${file}`);
      }
    });
  }

  // Check main.css content
  checkMainCSSContent() {
    console.log('📄 Checking main.css Content...\n');

    const mainCSSPath = path.join(this.projectPath, 'client/src/styles/main.css');
    
    if (fs.existsSync(mainCSSPath)) {
      const content = fs.readFileSync(mainCSSPath, 'utf8');
      
      // Check for UI System import
      if (content.includes('@import \'../ui-system/components/index.css\'')) {
        this.successes.push('✅ main.css imports UI System');
      } else {
        this.issues.push('❌ main.css missing UI System import');
      }

      // Check for minimal global styles
      if (content.includes('body {') && content.length < 1000) {
        this.successes.push('✅ main.css has minimal global styles');
      } else {
        this.issues.push('❌ main.css may have excessive global styles');
      }
    } else {
      this.issues.push('❌ main.css file not found');
    }
  }

  // Check UI System structure
  checkUISystemStructure() {
    console.log('🏗️  Checking UI System Structure...\n');

    const requiredDirs = [
      'client/src/ui-system/components',
      'client/src/ui-system/patterns',
      'client/src/ui-system/themes',
      'client/src/ui-system/icons',
      'client/src/ui-system/tools'
    ];

    requiredDirs.forEach(dir => {
      const fullPath = path.join(this.projectPath, dir);
      if (fs.existsSync(fullPath)) {
        this.successes.push(`✅ UI System directory exists: ${dir}`);
      } else {
        this.issues.push(`❌ UI System directory missing: ${dir}`);
      }
    });
  }

  // Count components and patterns
  countComponents() {
    console.log('📊 Counting Components and Patterns...\n');

    const componentsPath = path.join(this.projectPath, 'client/src/ui-system/components');
    const patternsPath = path.join(this.projectPath, 'client/src/ui-system/patterns');

    let componentCount = 0;
    let patternCount = 0;

    // Count components
    if (fs.existsSync(componentsPath)) {
      const categories = fs.readdirSync(componentsPath).filter(item => {
        const itemPath = path.join(componentsPath, item);
        return fs.statSync(itemPath).isDirectory();
      });

      categories.forEach(category => {
        const categoryPath = path.join(componentsPath, category);
        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.tsx'));
        componentCount += files.length;
      });
    }

    // Count patterns
    if (fs.existsSync(patternsPath)) {
      const mainPatterns = fs.readdirSync(patternsPath).filter(file => file.endsWith('.tsx'));
      patternCount += mainPatterns.length;

      const adminPatternsPath = path.join(patternsPath, 'admin');
      if (fs.existsSync(adminPatternsPath)) {
        const adminPatterns = fs.readdirSync(adminPatternsPath).filter(file => file.endsWith('.tsx'));
        patternCount += adminPatterns.length;
      }
    }

    console.log(`📦 Components found: ${componentCount}`);
    console.log(`🎨 Patterns found: ${patternCount}`);

    if (componentCount >= 30) {
      this.successes.push(`✅ Sufficient components migrated: ${componentCount}`);
    } else {
      this.issues.push(`❌ Low component count: ${componentCount}`);
    }

    if (patternCount >= 10) {
      this.successes.push(`✅ Sufficient patterns migrated: ${patternCount}`);
    } else {
      this.issues.push(`❌ Low pattern count: ${patternCount}`);
    }

    return { componentCount, patternCount };
  }

  // Check for generated reports
  checkReports() {
    console.log('📋 Checking Generated Reports...\n');

    const reports = [
      'LEGACY_CLEANUP_REPORT.md',
      'MIGRATION_SUCCESS_REPORT.md'
    ];

    reports.forEach(report => {
      const reportPath = path.join(this.projectPath, report);
      if (fs.existsSync(reportPath)) {
        this.successes.push(`✅ Report generated: ${report}`);
      } else {
        this.issues.push(`❌ Report missing: ${report}`);
      }
    });
  }

  // Calculate bundle size
  calculateBundleSize() {
    console.log('📦 Calculating Bundle Size...\n');

    const uiSystemPath = path.join(this.projectPath, 'client/src/ui-system');
    const stylesPath = path.join(this.projectPath, 'client/src/styles');

    const calculateSize = (dirPath) => {
      if (!fs.existsSync(dirPath)) return 0;
      
      let totalSize = 0;
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          totalSize += calculateSize(itemPath);
        } else {
          totalSize += stat.size;
        }
      });
      
      return totalSize;
    };

    const uiSystemSize = calculateSize(uiSystemPath);
    const stylesSize = calculateSize(stylesPath);
    const totalSize = uiSystemSize + stylesSize;

    console.log(`UI System: ${(uiSystemSize / 1024).toFixed(2)} KB`);
    console.log(`Remaining Styles: ${(stylesSize / 1024).toFixed(2)} KB`);
    console.log(`Total Bundle: ${(totalSize / 1024).toFixed(2)} KB`);

    if (stylesSize < uiSystemSize * 0.1) {
      this.successes.push(`✅ Minimal remaining styles: ${(stylesSize / 1024).toFixed(2)} KB`);
    } else {
      this.issues.push(`❌ Too many remaining styles: ${(stylesSize / 1024).toFixed(2)} KB`);
    }

    return { uiSystemSize, stylesSize, totalSize };
  }

  // Generate verification report
  generateVerificationReport(componentStats, bundleStats) {
    const reportPath = path.join(this.projectPath, 'MIGRATION_VERIFICATION_REPORT.md');
    
    const report = `# BlogPro Migration Verification Report

## Verification Status: ${this.issues.length === 0 ? '✅ PASSED' : '❌ ISSUES FOUND'}

## Component Migration
- Components: ${componentStats.componentCount}
- Patterns: ${componentStats.patternCount}
- Total: ${componentStats.componentCount + componentStats.patternCount}

## Bundle Analysis
- UI System: ${(bundleStats.uiSystemSize / 1024).toFixed(2)} KB
- Remaining Styles: ${(bundleStats.stylesSize / 1024).toFixed(2)} KB
- Total Bundle: ${(bundleStats.totalSize / 1024).toFixed(2)} KB

## Verification Results

### Successes ✅
${this.successes.map(success => `- ${success}`).join('\n')}

${this.issues.length > 0 ? `### Issues Found ❌\n${this.issues.map(issue => `- ${issue}`).join('\n')}\n\n## Recommended Actions\n${this.issues.map(issue => `- Fix: ${issue.replace('❌ ', '')}`).join('\n')}` : '### No Issues Found ✅\nAll verification checks passed successfully!'}

## Migration Status
${this.issues.length === 0 ? 
  '🎉 **MIGRATION COMPLETED SUCCESSFULLY**\n\nBlogPro UI System migration has been verified and is ready for production!' :
  '⚠️ **MIGRATION NEEDS ATTENTION**\n\nPlease address the issues listed above before considering the migration complete.'
}

---
*Verification completed on ${new Date().toLocaleString()}*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📋 Verification report saved: ${reportPath}`);
  }

  // Run all verification checks
  runVerification() {
    console.log('🔍 BlogPro Migration Verification\n');
    console.log('=================================\n');

    this.checkLegacyRemoval();
    this.checkEssentialFiles();
    this.checkMainCSSContent();
    this.checkUISystemStructure();
    const componentStats = this.countComponents();
    this.checkReports();
    const bundleStats = this.calculateBundleSize();

    console.log('\n📊 Verification Summary');
    console.log('======================');
    console.log(`✅ Successes: ${this.successes.length}`);
    console.log(`❌ Issues: ${this.issues.length}`);
    console.log(`📦 Components: ${componentStats.componentCount}`);
    console.log(`🎨 Patterns: ${componentStats.patternCount}`);
    console.log(`📦 Bundle Size: ${(bundleStats.totalSize / 1024).toFixed(2)} KB`);

    this.generateVerificationReport(componentStats, bundleStats);

    if (this.issues.length === 0) {
      console.log('\n🎉 VERIFICATION PASSED - Migration completed successfully!');
    } else {
      console.log('\n⚠️  VERIFICATION ISSUES FOUND - Please review and fix issues');
      console.log('\nIssues to address:');
      this.issues.forEach(issue => console.log(`  ${issue}`));
    }

    return this.issues.length === 0;
  }
}

// CLI usage
if (require.main === module) {
  const verifier = new MigrationVerifier();
  const success = verifier.runVerification();
  process.exit(success ? 0 : 1);
}

module.exports = MigrationVerifier;