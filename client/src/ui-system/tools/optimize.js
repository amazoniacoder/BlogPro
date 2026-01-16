#!/usr/bin/env node

/**
 * BlogPro Optimization Runner
 * Runs all optimization tools
 */

const BundleAnalyzer = require('./bundle-analyzer');
const CSSOptimizer = require('./css-optimizer');
const path = require('path');

async function runOptimization() {
  console.log('🚀 Starting BlogPro UI System Optimization\n');
  
  const uiSystemPath = path.join(__dirname, '..');
  
  // 1. Bundle Analysis
  console.log('📊 Running Bundle Analysis...');
  const bundleAnalyzer = new BundleAnalyzer();
  bundleAnalyzer.analyzeDirectory(uiSystemPath);
  const bundleReport = bundleAnalyzer.generateReport();
  
  // 2. CSS Optimization
  console.log('\n🎨 Running CSS Analysis...');
  const cssOptimizer = new CSSOptimizer();
  cssOptimizer.analyzeDirectory(uiSystemPath);
  const cssReport = cssOptimizer.generateReport();
  
  // 3. Generate Summary Report
  console.log('\n📋 Optimization Summary');
  console.log('======================');
  console.log(`Bundle Size: ${(bundleReport.totalSize / 1024).toFixed(2)} KB`);
  console.log(`Components: ${bundleReport.componentCount}`);
  console.log(`CSS Rules: ${cssReport.totalRules}`);
  console.log(`Duplicate CSS Groups: ${cssReport.duplicateGroups}`);
  console.log(`Potential CSS Savings: ${cssReport.potentialSavings} rules`);
  
  // 4. Recommendations
  console.log('\n💡 Optimization Recommendations');
  console.log('===============================');
  
  if (bundleReport.optimizationCandidates.length > 0) {
    console.log('🔄 Consider lazy loading these large components:');
    bundleReport.optimizationCandidates.forEach(name => {
      console.log(`   - ${name}`);
    });
  }
  
  if (cssReport.potentialSavings > 0) {
    console.log(`🎨 Remove ${cssReport.potentialSavings} duplicate CSS rules`);
    console.log('   Run CSS optimizer to clean up duplicates');
  }
  
  if (bundleReport.totalSize > 100000) { // > 100KB
    console.log('📦 Consider code splitting for better performance');
  }
  
  console.log('\n✅ Optimization analysis complete!');
  
  return {
    bundle: bundleReport,
    css: cssReport
  };
}

// Run if called directly
if (require.main === module) {
  runOptimization().catch(console.error);
}

module.exports = runOptimization;