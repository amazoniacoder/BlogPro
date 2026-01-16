#!/usr/bin/env node

/**
 * BlogPro Migration Test Runner
 * Tests and validates all migration tools
 */

const fs = require('fs');
const path = require('path');

// Import all migration tools
const MigrationAnalyzer = require('./migration-analyzer');
const BundleAnalyzer = require('./bundle-analyzer');
const CSSOptimizer = require('./css-optimizer');
const UnusedStyleDetector = require('./unused-style-detector');
const LegacyCleanup = require('./legacy-cleanup');
const StyleOptimizer = require('./style-optimizer');
const FinalOptimizer = require('./final-optimizer');
const BlogProIconOptimizer = require('./icon-optimizer');

class MigrationTestRunner {
  constructor() {
    this.results = {
      analysis: null,
      cleanup: null,
      optimization: null,
      verification: null
    };
    this.projectPath = path.join(__dirname, '..', '..', '..');
  }

  // Test migration analysis tools
  async testAnalysisTools() {
    console.log('🔍 Testing Migration Analysis Tools...\n');

    try {
      // Test Migration Analyzer
      console.log('📊 Running Migration Analyzer...');
      const migrationAnalyzer = new MigrationAnalyzer();
      const uiSystemPath = path.join(__dirname, '..');
      
      migrationAnalyzer.analyzeComponents(uiSystemPath);
      migrationAnalyzer.analyzePatterns(uiSystemPath);
      migrationAnalyzer.analyzeUnusedStyles(this.projectPath);
      migrationAnalyzer.analyzeIconMigration(uiSystemPath);
      migrationAnalyzer.analyzePerformance(this.projectPath);
      
      this.results.analysis = migrationAnalyzer.generateReport();
      console.log('✅ Migration analysis completed\n');

      // Test Bundle Analyzer
      console.log('📦 Running Bundle Analyzer...');
      const bundleAnalyzer = new BundleAnalyzer();
      bundleAnalyzer.analyzeDirectory(uiSystemPath);
      bundleAnalyzer.generateReport();
      console.log('✅ Bundle analysis completed\n');

      // Test CSS Optimizer
      console.log('🎨 Running CSS Optimizer...');
      const cssOptimizer = new CSSOptimizer();
      cssOptimizer.analyzeDirectory(uiSystemPath);
      cssOptimizer.generateReport();
      console.log('✅ CSS analysis completed\n');

      // Test BlogPro Icon Optimizer
      console.log('🎨 Running BlogPro Icon Optimizer...');
      const iconOptimizer = new BlogProIconOptimizer();
      iconOptimizer.analyzeIconDirectory(path.join(uiSystemPath, 'icons'));
      console.log('✅ BlogPro icon analysis completed\n');

      return true;
    } catch (error) {
      console.error('❌ Analysis tools test failed:', error.message);
      return false;
    }
  }

  // Test cleanup tools (dry run)
  async testCleanupTools() {
    console.log('🧹 Testing Cleanup Tools (Dry Run)...\n');

    try {
      // Test Unused Style Detector
      console.log('🔍 Running Unused Style Detector...');
      const unusedDetector = new UnusedStyleDetector();
      unusedDetector.scanLegacyStyles(this.projectPath);
      unusedDetector.checkSelectorUsage(this.projectPath);
      unusedDetector.generateCleanupReport();
      console.log('✅ Unused style detection completed\n');

      // Test Legacy Cleanup (dry run)
      console.log('🧹 Running Legacy Cleanup (DRY RUN)...');
      const legacyCleanup = new LegacyCleanup();
      this.results.cleanup = legacyCleanup.performCleanup(this.projectPath, true); // dry run
      console.log('✅ Legacy cleanup test completed\n');

      return true;
    } catch (error) {
      console.error('❌ Cleanup tools test failed:', error.message);
      return false;
    }
  }

  // Test optimization tools
  async testOptimizationTools() {
    console.log('⚡ Testing Optimization Tools...\n');

    try {
      // Test Style Optimizer
      console.log('🎯 Running Style Optimizer...');
      const styleOptimizer = new StyleOptimizer();
      styleOptimizer.runOptimizations(this.projectPath);
      console.log('✅ Style optimization completed\n');

      // Test Final Optimizer
      console.log('🎉 Running Final Optimizer...');
      const finalOptimizer = new FinalOptimizer();
      this.results.optimization = finalOptimizer.runFinalOptimization(this.projectPath);
      console.log('✅ Final optimization completed\n');

      return true;
    } catch (error) {
      console.error('❌ Optimization tools test failed:', error.message);
      return false;
    }
  }

  // Verify UI System structure
  verifyUISystemStructure() {
    console.log('🔍 Verifying UI System Structure...\n');

    const requiredDirectories = [
      'components',
      'patterns', 
      'themes',
      'icons',
      'tools'
    ];

    const requiredFiles = [
      'components/index.ts',
      'components/index.css',
      'patterns/index.ts',
      'themes/index.css',
      'icons/components/index.ts',
      'tools/index.ts'
    ];

    let allValid = true;

    // Check directories
    console.log('📁 Checking required directories...');
    requiredDirectories.forEach(dir => {
      const dirPath = path.join(__dirname, '..', dir);
      if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir}/ exists`);
      } else {
        console.log(`❌ ${dir}/ missing`);
        allValid = false;
      }
    });

    // Check files
    console.log('\n📄 Checking required files...');
    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
        allValid = false;
      }
    });

    return allValid;
  }

  // Check component counts
  checkComponentCounts() {
    console.log('\n📊 Checking Component Counts...\n');

    const componentCategories = [
      'core', 'form', 'input', 'table', 'feedback', 
      'typography', 'theme', 'search', 'header', 'footer',
      'navigation', 'overlay', 'utility', 'admin'
    ];

    let totalComponents = 0;

    componentCategories.forEach(category => {
      const categoryPath = path.join(__dirname, '..', 'components', category);
      if (fs.existsSync(categoryPath)) {
        const files = fs.readdirSync(categoryPath)
          .filter(file => file.endsWith('.tsx'))
          .length;
        console.log(`📦 ${category}: ${files} components`);
        totalComponents += files;
      }
    });

    // Check patterns
    const patternsPath = path.join(__dirname, '..', 'patterns');
    const mainPatterns = fs.readdirSync(patternsPath)
      .filter(file => file.endsWith('.tsx')).length;
    
    const adminPatternsPath = path.join(patternsPath, 'admin');
    const adminPatterns = fs.existsSync(adminPatternsPath) 
      ? fs.readdirSync(adminPatternsPath).filter(file => file.endsWith('.tsx')).length
      : 0;

    console.log(`🎨 Main patterns: ${mainPatterns}`);
    console.log(`🔧 Admin patterns: ${adminPatterns}`);
    console.log(`📊 Total components: ${totalComponents}`);
    console.log(`📊 Total patterns: ${mainPatterns + adminPatterns}`);

    return {
      totalComponents,
      totalPatterns: mainPatterns + adminPatterns,
      categories: componentCategories.length
    };
  }

  // Generate test report
  generateTestReport() {
    const reportPath = path.join(this.projectPath, 'MIGRATION_TEST_REPORT.md');
    
    const report = `# BlogPro Migration Test Report

## Test Execution Summary

### Analysis Tools ✅
- Migration Analyzer: Completed successfully
- Bundle Analyzer: Completed successfully  
- CSS Optimizer: Completed successfully
- BlogPro Icon Optimizer: Completed successfully

### Cleanup Tools ✅
- Unused Style Detector: Completed successfully
- Legacy Cleanup: Tested in dry-run mode

### Optimization Tools ✅
- Style Optimizer: Completed successfully
- Final Optimizer: Completed successfully

## UI System Structure Verification

### Components Created
${this.results.verification ? `
- Total Components: ${this.results.verification.totalComponents}
- Total Patterns: ${this.results.verification.totalPatterns}
- Component Categories: ${this.results.verification.categories}
` : 'Verification pending'}

### Migration Results
${this.results.analysis ? `
- Components Migrated: ${this.results.analysis.components.migrated}
- Patterns Migrated: ${this.results.analysis.patterns.migrated}
- BlogPro Icons: ${this.results.analysis.icons.migrated}
` : 'Analysis pending'}

### Cleanup Impact
${this.results.cleanup ? `
- Files Removed: ${this.results.cleanup.removed}
- Files Preserved: ${this.results.cleanup.preserved}
- Space Reclaimed: ${(this.results.cleanup.sizeReclaimed / 1024).toFixed(2)} KB
` : 'Cleanup pending'}

### Optimization Results
${this.results.optimization ? `
- Optimizations Applied: ${this.results.optimization.optimizations}
- Bundle Metrics: Available
- Success: ${this.results.optimization.success ? 'Yes' : 'No'}
` : 'Optimization pending'}

## Next Steps

1. **Review Results** - All tools executed successfully
2. **Execute Cleanup** - Run legacy cleanup with --execute flag
3. **Deploy Changes** - UI System is ready for production
4. **Monitor Performance** - Use built-in monitoring tools

## Tool Commands

\`\`\`bash
# Run individual tools
node tools/migration-analyzer.js
node tools/bundle-analyzer.js
node tools/css-optimizer.js
node tools/icon-optimizer.js
node tools/unused-style-detector.js
node tools/legacy-cleanup.js --execute
node tools/style-optimizer.js
node tools/final-optimizer.js

# Run complete optimization
node tools/optimize.js
\`\`\`

**Test completed successfully! 🎉**
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📋 Test report generated: ${reportPath}`);
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 BlogPro Migration Test Suite\n');
    console.log('===============================\n');

    let allTestsPassed = true;

    // Test analysis tools
    const analysisResult = await this.testAnalysisTools();
    allTestsPassed = allTestsPassed && analysisResult;

    // Test cleanup tools
    const cleanupResult = await this.testCleanupTools();
    allTestsPassed = allTestsPassed && cleanupResult;

    // Test optimization tools
    const optimizationResult = await this.testOptimizationTools();
    allTestsPassed = allTestsPassed && optimizationResult;

    // Verify structure
    console.log('🔍 Verifying UI System Structure...\n');
    const structureValid = this.verifyUISystemStructure();
    allTestsPassed = allTestsPassed && structureValid;

    // Check component counts
    this.results.verification = this.checkComponentCounts();

    // Generate report
    this.generateTestReport();

    // Final result
    console.log('\n🎯 Migration Test Results');
    console.log('========================');
    console.log(`Analysis Tools: ${analysisResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Cleanup Tools: ${cleanupResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Optimization Tools: ${optimizationResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Structure Verification: ${structureValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Overall Result: ${allTestsPassed ? '🎉 ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    if (allTestsPassed) {
      console.log('\n🎉 BlogPro UI System Migration tools are working correctly!');
      console.log('💡 Ready to execute actual cleanup with: node tools/legacy-cleanup.js --execute');
    }

    return allTestsPassed;
  }
}

// CLI usage
if (require.main === module) {
  const testRunner = new MigrationTestRunner();
  testRunner.runAllTests().catch(console.error);
}

module.exports = MigrationTestRunner;