#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BEMValidator {
  constructor() {
    this.stats = {
      totalClasses: 0,
      bemCompliant: 0,
      nonCompliant: 0,
      issues: []
    };
  }

  // BEM pattern: block__element--modifier
  isBEMCompliant(className) {
    // Valid BEM patterns
    const bemPatterns = [
      /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, // block or block-name
      /^[a-z][a-z0-9]*(-[a-z0-9]+)*__[a-z][a-z0-9]*(-[a-z0-9]+)*$/, // block__element
      /^[a-z][a-z0-9]*(-[a-z0-9]+)*--[a-z][a-z0-9]*(-[a-z0-9]+)*$/, // block--modifier
      /^[a-z][a-z0-9]*(-[a-z0-9]+)*__[a-z][a-z0-9]*(-[a-z0-9]+)*--[a-z][a-z0-9]*(-[a-z0-9]+)*$/ // block__element--modifier
    ];

    return bemPatterns.some(pattern => pattern.test(className));
  }

  extractClasses(cssContent) {
    // Extract all CSS class selectors
    const classRegex = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
    const classes = [];
    let match;

    while ((match = classRegex.exec(cssContent)) !== null) {
      const className = match[1];
      // Skip pseudo-classes and states
      if (!className.includes(':') && !className.includes('[')) {
        classes.push(className);
      }
    }

    return [...new Set(classes)]; // Remove duplicates
  }

  validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const classes = this.extractClasses(content);
    const fileIssues = [];

    classes.forEach(className => {
      this.stats.totalClasses++;
      
      if (this.isBEMCompliant(className)) {
        this.stats.bemCompliant++;
      } else {
        this.stats.nonCompliant++;
        fileIssues.push({
          file: filePath,
          class: className,
          issue: this.getIssueType(className)
        });
      }
    });

    if (fileIssues.length > 0) {
      this.stats.issues.push(...fileIssues);
    }
  }

  getIssueType(className) {
    if (className.includes('_') && !className.includes('__')) {
      return 'Single underscore (should be double __)';
    }
    if (className.includes('-') && !className.includes('--') && className.split('-').length > 2) {
      return 'Multiple hyphens without modifier (--) syntax';
    }
    if (/^[A-Z]/.test(className)) {
      return 'Starts with uppercase (should be lowercase)';
    }
    if (className.includes('__') && className.includes('__', className.indexOf('__') + 2)) {
      return 'Multiple elements (BEM allows only one level)';
    }
    return 'Non-BEM naming pattern';
  }

  generateReport() {
    const complianceRatio = ((this.stats.bemCompliant / this.stats.totalClasses) * 100).toFixed(1);
    
    console.log('\n=== BEM Compliance Report ===');
    console.log(`Total Classes: ${this.stats.totalClasses}`);
    console.log(`BEM Compliant: ${this.stats.bemCompliant}`);
    console.log(`Non-Compliant: ${this.stats.nonCompliant}`);
    console.log(`Compliance Ratio: ${complianceRatio}%`);
    
    if (this.stats.issues.length > 0) {
      console.log('\n=== Issues Found ===');
      
      // Group issues by type
      const issuesByType = {};
      this.stats.issues.forEach(issue => {
        if (!issuesByType[issue.issue]) {
          issuesByType[issue.issue] = [];
        }
        issuesByType[issue.issue].push(issue);
      });

      Object.keys(issuesByType).forEach(issueType => {
        console.log(`\n${issueType}:`);
        issuesByType[issueType].slice(0, 10).forEach(issue => {
          console.log(`  - .${issue.class} in ${issue.file}`);
        });
        if (issuesByType[issueType].length > 10) {
          console.log(`  ... and ${issuesByType[issueType].length - 10} more`);
        }
      });
    }

    // Generate action items
    console.log('\n=== Next Actions ===');
    if (complianceRatio < 70) {
      console.log('🔴 CRITICAL: Start with Phase 1 - Foundation Cleanup');
      console.log('   Focus on renaming the most common non-BEM classes');
    } else if (complianceRatio < 85) {
      console.log('🟡 MODERATE: Continue with Phase 2-3 - Structure & Duplicates');
      console.log('   Reorganize directories and eliminate duplicates');
    } else if (complianceRatio < 95) {
      console.log('🟢 GOOD: Phase 4-5 - Final standardization');
      console.log('   Focus on edge cases and specificity optimization');
    } else {
      console.log('✅ EXCELLENT: Nearly complete! Final validation needed');
    }

    return complianceRatio;
  }

  run() {
    const stylesDir = path.join(__dirname, '../client/src/styles');
    const cssFiles = glob.sync('**/*.css', { cwd: stylesDir });

    console.log(`Analyzing ${cssFiles.length} CSS files...`);

    cssFiles.forEach(file => {
      const fullPath = path.join(stylesDir, file);
      this.validateFile(fullPath);
    });

    return this.generateReport();
  }
}

// Run validator
const validator = new BEMValidator();
const complianceRatio = validator.run();

// Exit with error code if compliance is too low
process.exit(complianceRatio >= 100 ? 0 : 1);