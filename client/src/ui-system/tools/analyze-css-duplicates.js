#!/usr/bin/env node

/**
 * CSS Duplicate Analysis Script
 * Analyzes all UI System CSS files for duplicates, conflicts, and redundancies
 */

const fs = require('fs');
const path = require('path');

// Get the UI System directory
const uiSystemDir = path.join(__dirname, '..');

/**
 * Parse CSS content to extract class selectors and their properties
 */
function parseCssClasses(cssContent, filePath) {
  const classes = new Map();
  
  // Remove comments and normalize whitespace
  const cleanCss = cssContent
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Match CSS rules: .class-name { properties }
  const ruleRegex = /(\.[a-zA-Z0-9_-]+(?::[a-zA-Z0-9_-]+)?(?:::[a-zA-Z0-9_-]+)?)\s*\{([^}]+)\}/g;
  
  let match;
  while ((match = ruleRegex.exec(cleanCss)) !== null) {
    const selector = match[1].trim();
    const properties = match[2].trim();
    
    if (!classes.has(selector)) {
      classes.set(selector, []);
    }
    
    classes.get(selector).push({
      properties,
      file: filePath,
      line: (cssContent.substring(0, match.index).match(/\n/g) || []).length + 1
    });
  }
  
  return classes;
}

/**
 * Find all CSS files recursively
 */
function findCssFiles(dir) {
  const cssFiles = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          traverse(fullPath);
        }
      } else if (item.endsWith('.css')) {
        cssFiles.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return cssFiles;
}

/**
 * Analyze CSS files for duplicates and conflicts
 */
function analyzeCssFiles() {
  const cssFiles = findCssFiles(uiSystemDir);
  const allClasses = new Map();
  const fileContents = new Map();
  
  console.log('🔍 Analyzing CSS files...\n');
  
  // Parse all CSS files
  for (const filePath of cssFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      fileContents.set(filePath, content);
      
      const classes = parseCssClasses(content, filePath);
      
      for (const [selector, definitions] of classes) {
        if (!allClasses.has(selector)) {
          allClasses.set(selector, []);
        }
        allClasses.get(selector).push(...definitions);
      }
    } catch (error) {
      console.error(`❌ Error reading ${filePath}:`, error.message);
    }
  }
  
  return { allClasses, cssFiles, fileContents };
}

/**
 * Find duplicate class definitions
 */
function findDuplicates(allClasses) {
  const duplicates = [];
  const conflicts = [];
  
  for (const [selector, definitions] of allClasses) {
    if (definitions.length > 1) {
      // Check if properties are identical (duplicates) or different (conflicts)
      const uniqueProperties = new Set(definitions.map(d => d.properties));
      
      if (uniqueProperties.size === 1) {
        // Identical definitions = duplicate
        duplicates.push({
          selector,
          definitions,
          type: 'duplicate'
        });
      } else {
        // Different definitions = conflict
        conflicts.push({
          selector,
          definitions,
          type: 'conflict'
        });
      }
    }
  }
  
  return { duplicates, conflicts };
}

/**
 * Generate report
 */
function generateReport(duplicates, conflicts, cssFiles) {
  console.log('📊 CSS ANALYSIS REPORT\n');
  console.log('='.repeat(50));
  
  // Summary
  console.log(`\n📁 Total CSS files analyzed: ${cssFiles.length}`);
  console.log(`🔄 Duplicate class definitions: ${duplicates.length}`);
  console.log(`⚠️  Conflicting class definitions: ${conflicts.length}`);
  
  // Critical duplicates (same class, same properties, different files)
  if (duplicates.length > 0) {
    console.log('\n🔄 CRITICAL DUPLICATES (Same class, identical properties):');
    console.log('-'.repeat(60));
    
    duplicates.forEach(({ selector, definitions }) => {
      console.log(`\n📍 Class: ${selector}`);
      console.log(`   Identical definitions in ${definitions.length} files:`);
      definitions.forEach(def => {
        const relativePath = path.relative(uiSystemDir, def.file);
        console.log(`   • ${relativePath}:${def.line}`);
      });
    });
  }
  
  // Critical conflicts (same class, different properties)
  if (conflicts.length > 0) {
    console.log('\n⚠️  CRITICAL CONFLICTS (Same class, different properties):');
    console.log('-'.repeat(60));
    
    // Show only the most critical conflicts (header, button, etc.)
    const criticalClasses = ['.header', '.button', '.card', '.modal', '.form-field', '.footer'];
    const criticalConflicts = conflicts.filter(c => 
      criticalClasses.some(cc => c.selector.startsWith(cc))
    );
    
    if (criticalConflicts.length > 0) {
      console.log('\n🚨 HIGH PRIORITY CONFLICTS:');
      criticalConflicts.forEach(({ selector, definitions }) => {
        console.log(`\n📍 Class: ${selector}`);
        console.log(`   Different definitions in ${definitions.length} files:`);
        definitions.forEach(def => {
          const relativePath = path.relative(uiSystemDir, def.file);
          console.log(`   • ${relativePath}:${def.line}`);
          console.log(`     Properties: ${def.properties.substring(0, 80)}${def.properties.length > 80 ? '...' : ''}`);
        });
      });
    }
    
    console.log(`\n📊 Total conflicts: ${conflicts.length} (showing ${criticalConflicts.length} critical)`);
  }
  
  // File redundancy analysis
  console.log('\n🗂️  REDUNDANT FILES:');
  console.log('-'.repeat(30));
  
  const redundantFiles = [
    { files: ['components/header/header.css', 'components/layout/header.css'], issue: 'Duplicate header styles' },
    { files: ['components/footer/footer.css', 'components/layout/footer.css'], issue: 'Duplicate footer styles' },
    { files: ['components/typography/typography.css', 'tokens/typography.css'], issue: 'Typography defined in two places' }
  ];
  
  redundantFiles.forEach(({ files, issue }) => {
    const existingFiles = files.filter(f => {
      const fullPath = path.join(uiSystemDir, f);
      return fs.existsSync(fullPath);
    });
    
    if (existingFiles.length > 1) {
      console.log(`\n📍 Issue: ${issue}`);
      existingFiles.forEach(file => {
        console.log(`   • ${file}`);
      });
    }
  });
  
  // Recommendations
  console.log('\n💡 PRIORITY RECOMMENDATIONS:');
  console.log('-'.repeat(40));
  
  if (duplicates.length > 0) {
    console.log('🔥 URGENT: Remove duplicate class definitions - choose one file per class');
  }
  
  if (conflicts.filter(c => ['.header', '.button', '.card'].some(cc => c.selector.startsWith(cc))).length > 0) {
    console.log('🔥 URGENT: Resolve critical component conflicts (.header, .button, .card)');
  }
  
  console.log('📋 MEDIUM: Consolidate layout vs component files');
  console.log('📋 MEDIUM: Establish clear component ownership');
  console.log('📋 LOW: Clean up utility class variants');
  
  console.log('\n✨ Analysis complete!');
}

/**
 * Main execution
 */
function main() {
  const { allClasses, cssFiles } = analyzeCssFiles();
  const { duplicates, conflicts } = findDuplicates(allClasses);
  
  generateReport(duplicates, conflicts, cssFiles);
}

// Run the analysis
main();