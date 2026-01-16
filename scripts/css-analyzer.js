#!/usr/bin/env node

/**
 * BlogPro CSS Analyzer
 * Analyzes CSS for duplicates, performance issues, and compliance
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class CSSAnalyzer {
  constructor() {
    this.cssFiles = [];
    this.duplicates = [];
    this.stats = {
      totalFiles: 0,
      totalRules: 0,
      duplicateRules: 0,
      bundleSize: 0
    };
  }

  // Find all CSS files
  findCSSFiles(directory) {
    const pattern = path.join(directory, '**/*.css');
    this.cssFiles = glob.sync(pattern);
    this.stats.totalFiles = this.cssFiles.length;
    console.log(`📁 Found ${this.stats.totalFiles} CSS files`);
  }

  // Parse CSS and extract rules
  parseCSS(content) {
    const rules = [];
    const ruleRegex = /([^{}]+)\s*\{([^{}]*)\}/g;
    let match;

    while ((match = ruleRegex.exec(content)) !== null) {
      const selector = match[1].trim();
      const properties = match[2].trim();
      
      if (selector && properties) {
        rules.push({
          selector,
          properties: this.normalizeProperties(properties)
        });
      }
    }

    return rules;
  }

  // Normalize CSS properties for comparison
  normalizeProperties(properties) {
    return properties
      .split(';')
      .map(prop => prop.trim())
      .filter(prop => prop.length > 0)
      .sort()
      .join(';');
  }

  // Find duplicate CSS rules
  findDuplicates() {
    const ruleMap = new Map();
    
    this.cssFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const rules = this.parseCSS(content);
      
      rules.forEach(rule => {
        const key = `${rule.selector}:${rule.properties}`;
        
        if (ruleMap.has(key)) {
          ruleMap.get(key).files.push(file);
        } else {
          ruleMap.set(key, {
            selector: rule.selector,
            properties: rule.properties,
            files: [file]
          });
        }
      });
      
      this.stats.totalRules += rules.length;
    });

    // Find actual duplicates
    ruleMap.forEach(rule => {
      if (rule.files.length > 1) {
        this.duplicates.push(rule);
        this.stats.duplicateRules++;
      }
    });
  }

  // Calculate bundle size
  calculateBundleSize() {
    let totalSize = 0;
    
    this.cssFiles.forEach(file => {
      const stats = fs.statSync(file);
      totalSize += stats.size;
    });
    
    this.stats.bundleSize = totalSize;
  }

  // Check BEM compliance
  checkBEMCompliance() {
    const bemViolations = [];
    const bemRegex = /^[a-z][a-z0-9-]*(__[a-z][a-z0-9-]*)?(--[a-z][a-z0-9-]*)?$/;
    
    this.cssFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const selectors = content.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g) || [];
      
      selectors.forEach(selector => {
        const className = selector.substring(1); // Remove the dot
        if (!bemRegex.test(className) && !className.startsWith('bp-')) {
          bemViolations.push({
            file: path.relative(process.cwd(), file),
            selector: className
          });
        }
      });
    });
    
    return bemViolations;
  }

  // Generate report
  generateReport() {
    console.log('\n📊 CSS Analysis Report');
    console.log('========================');
    
    // Basic stats
    console.log(`📁 Total Files: ${this.stats.totalFiles}`);
    console.log(`📏 Total Rules: ${this.stats.totalRules}`);
    console.log(`📦 Bundle Size: ${(this.stats.bundleSize / 1024).toFixed(2)} KB`);
    
    // Duplicates
    if (this.duplicates.length > 0) {
      console.log(`\n⚠️  Found ${this.duplicates.length} duplicate rules:`);
      this.duplicates.slice(0, 5).forEach(duplicate => {
        console.log(`   ${duplicate.selector}`);
        console.log(`   Files: ${duplicate.files.map(f => path.basename(f)).join(', ')}`);
      });
      
      if (this.duplicates.length > 5) {
        console.log(`   ... and ${this.duplicates.length - 5} more`);
      }
    } else {
      console.log('\n✅ No duplicate rules found');
    }
    
    // BEM compliance
    const bemViolations = this.checkBEMCompliance();
    if (bemViolations.length > 0) {
      console.log(`\n⚠️  BEM violations found: ${bemViolations.length}`);
      bemViolations.slice(0, 5).forEach(violation => {
        console.log(`   .${violation.selector} in ${violation.file}`);
      });
    } else {
      console.log('\n✅ BEM compliance: 100%');
    }
    
    // Performance score
    const performanceScore = this.calculatePerformanceScore();
    console.log(`\n🚀 Performance Score: ${performanceScore}/100`);
    
    return {
      stats: this.stats,
      duplicates: this.duplicates,
      bemViolations,
      performanceScore
    };
  }

  // Calculate performance score
  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct for duplicates
    score -= Math.min(this.duplicates.length * 5, 30);
    
    // Deduct for large bundle size (>100KB)
    if (this.stats.bundleSize > 100 * 1024) {
      score -= 20;
    }
    
    // Deduct for BEM violations
    const bemViolations = this.checkBEMCompliance();
    score -= Math.min(bemViolations.length * 2, 20);
    
    return Math.max(score, 0);
  }

  // Run full analysis
  analyze(directory = './client/src/ui-system/components') {
    console.log('🔍 Starting CSS Analysis...');
    
    this.findCSSFiles(directory);
    this.findDuplicates();
    this.calculateBundleSize();
    
    return this.generateReport();
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new CSSAnalyzer();
  const directory = process.argv[2] || './client/src/ui-system/components';
  
  try {
    analyzer.analyze(directory);
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

module.exports = CSSAnalyzer;