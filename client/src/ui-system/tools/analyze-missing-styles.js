#!/usr/bin/env node

/**
 * Missing Styles Analysis Script
 * Compares frontend/admin HTML classes with UI System components
 */

const fs = require('fs');
const path = require('path');

// Directories to analyze
const frontendDir = path.join(__dirname, '../../../src');
const oldStylesDir = path.join(__dirname, '../../../styles_old');
const uiSystemDir = path.join(__dirname, '..');

/**
 * Extract CSS classes from HTML/JSX content
 */
function extractClassesFromContent(content) {
  const classes = new Set();
  
  // Match className="..." and class="..."
  const classRegex = /(?:className|class)=["']([^"']+)["']/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    const classString = match[1];
    // Split by spaces and filter out variables/expressions
    const classList = classString.split(/\s+/).filter(cls => 
      cls && !cls.includes('${') && !cls.includes('{') && cls.match(/^[a-zA-Z0-9_-]+$/)
    );
    classList.forEach(cls => classes.add(cls));
  }
  
  return classes;
}

/**
 * Extract CSS classes from CSS files
 */
function extractClassesFromCSS(content) {
  const classes = new Set();
  
  // Match .class-name selectors
  const classRegex = /\.([a-zA-Z0-9_-]+)(?:[:\s,{]|$)/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    classes.add(match[1]);
  }
  
  return classes;
}

/**
 * Find all files recursively
 */
function findFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          traverse(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Analyze frontend classes
 */
function analyzeFrontendClasses() {
  console.log('🔍 Analyzing frontend classes...\n');
  
  const frontendFiles = findFiles(frontendDir, ['.tsx', '.jsx', '.ts', '.js']);
  const usedClasses = new Set();
  
  for (const filePath of frontendFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const classes = extractClassesFromContent(content);
      classes.forEach(cls => usedClasses.add(cls));
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  console.log(`📊 Found ${usedClasses.size} unique classes in frontend`);
  return usedClasses;
}

/**
 * Analyze UI System classes
 */
function analyzeUISystemClasses() {
  console.log('🔍 Analyzing UI System classes...\n');
  
  const uiFiles = findFiles(uiSystemDir, ['.css']);
  const uiClasses = new Set();
  
  for (const filePath of uiFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const classes = extractClassesFromCSS(content);
      classes.forEach(cls => uiClasses.add(cls));
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  console.log(`📊 Found ${uiClasses.size} unique classes in UI System`);
  return uiClasses;
}

/**
 * Analyze old styles
 */
function analyzeOldStyles() {
  console.log('🔍 Analyzing old styles...\n');
  
  if (!fs.existsSync(oldStylesDir)) {
    console.log('⚠️  Old styles directory not found');
    return new Set();
  }
  
  const oldFiles = findFiles(oldStylesDir, ['.css']);
  const oldClasses = new Set();
  
  for (const filePath of oldFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const classes = extractClassesFromCSS(content);
      classes.forEach(cls => oldClasses.add(cls));
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  console.log(`📊 Found ${oldClasses.size} unique classes in old styles`);
  return oldClasses;
}

/**
 * Categorize missing classes by component type
 */
function categorizeMissingClasses(missingClasses) {
  const categories = {
    layout: [],
    hero: [],
    blog: [],
    cta: [],
    navigation: [],
    footer: [],
    forms: [],
    admin: [],
    other: []
  };
  
  for (const cls of missingClasses) {
    if (cls.includes('layout')) categories.layout.push(cls);
    else if (cls.includes('hero')) categories.hero.push(cls);
    else if (cls.includes('blog')) categories.blog.push(cls);
    else if (cls.includes('cta')) categories.cta.push(cls);
    else if (cls.includes('nav') || cls.includes('menu')) categories.navigation.push(cls);
    else if (cls.includes('footer')) categories.footer.push(cls);
    else if (cls.includes('form') || cls.includes('input')) categories.forms.push(cls);
    else if (cls.includes('admin')) categories.admin.push(cls);
    else categories.other.push(cls);
  }
  
  return categories;
}

/**
 * Generate migration roadmap
 */
function generateRoadmap(categories, oldClasses) {
  console.log('\n📋 MIGRATION ROADMAP\n');
  console.log('='.repeat(50));
  
  const phases = [
    {
      name: 'Phase 1: Critical Layout Components',
      classes: [...categories.layout, ...categories.hero],
      priority: 'HIGH',
      description: 'Essential page structure and hero sections'
    },
    {
      name: 'Phase 2: Content Blocks',
      classes: [...categories.blog, ...categories.cta],
      priority: 'HIGH',
      description: 'Blog cards, CTA sections, content areas'
    },
    {
      name: 'Phase 3: Navigation & Footer',
      classes: [...categories.navigation, ...categories.footer],
      priority: 'MEDIUM',
      description: 'Navigation menus and footer components'
    },
    {
      name: 'Phase 4: Forms & Interactions',
      classes: categories.forms,
      priority: 'MEDIUM',
      description: 'Form components and interactive elements'
    },
    {
      name: 'Phase 5: Admin Components',
      classes: categories.admin,
      priority: 'LOW',
      description: 'Admin panel specific components'
    },
    {
      name: 'Phase 6: Miscellaneous',
      classes: categories.other,
      priority: 'LOW',
      description: 'Other components and utilities'
    }
  ];
  
  phases.forEach((phase, index) => {
    if (phase.classes.length > 0) {
      console.log(`\n🎯 ${phase.name}`);
      console.log(`Priority: ${phase.priority}`);
      console.log(`Description: ${phase.description}`);
      console.log(`Classes to migrate: ${phase.classes.length}`);
      
      if (phase.classes.length <= 10) {
        console.log('Classes:', phase.classes.join(', '));
      } else {
        console.log('Sample classes:', phase.classes.slice(0, 10).join(', '), '...');
      }
    }
  });
  
  return phases;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Missing Styles Analysis...\n');
  
  // Analyze all class sources
  const frontendClasses = analyzeFrontendClasses();
  const uiSystemClasses = analyzeUISystemClasses();
  const oldClasses = analyzeOldStyles();
  
  // Find missing classes
  const missingClasses = new Set();
  for (const cls of frontendClasses) {
    if (!uiSystemClasses.has(cls)) {
      missingClasses.add(cls);
    }
  }
  
  console.log('\n📊 ANALYSIS RESULTS\n');
  console.log('='.repeat(30));
  console.log(`📁 Frontend classes: ${frontendClasses.size}`);
  console.log(`🎨 UI System classes: ${uiSystemClasses.size}`);
  console.log(`📜 Old styles classes: ${oldClasses.size}`);
  console.log(`❌ Missing classes: ${missingClasses.size}`);
  
  if (missingClasses.size > 0) {
    // Categorize missing classes
    const categories = categorizeMissingClasses(missingClasses);
    
    // Generate roadmap
    const roadmap = generateRoadmap(categories, oldClasses);
    
    // Save detailed report
    const report = {
      summary: {
        frontendClasses: frontendClasses.size,
        uiSystemClasses: uiSystemClasses.size,
        oldStylesClasses: oldClasses.size,
        missingClasses: missingClasses.size
      },
      missingClasses: Array.from(missingClasses).sort(),
      categories,
      roadmap: roadmap.map(phase => ({
        name: phase.name,
        priority: phase.priority,
        description: phase.description,
        classCount: phase.classes.length,
        classes: phase.classes
      }))
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../docs/MIGRATION_REPORT.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n💾 Detailed report saved to: docs/MIGRATION_REPORT.json');
  }
  
  console.log('\n✨ Analysis complete!');
}

// Run the analysis
main();