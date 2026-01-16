#!/usr/bin/env node

/**
 * Page-by-Page Style Analysis Script
 * Analyzes actual page templates to identify only necessary missing styles
 */

const fs = require('fs');
const path = require('path');

// Directories to analyze
const pagesDir = path.join(__dirname, '../../../src/pages');
const componentsDir = path.join(__dirname, '../../../src/components');
const uiSystemDir = path.join(__dirname, '..');

/**
 * Extract classes from HTML/JSX content
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
 * Find all page files
 */
function findPageFiles(dir) {
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
      } else if (item.match(/\.(tsx|jsx|ts|js)$/)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Analyze specific page and extract its classes
 */
function analyzePage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const classes = extractClassesFromContent(content);
    return {
      path: filePath,
      classes: Array.from(classes),
      content: content.substring(0, 500) // First 500 chars for context
    };
  } catch (error) {
    return { path: filePath, classes: [], error: error.message };
  }
}

/**
 * Get UI System classes for comparison
 */
function getUISystemClasses() {
  const uiClasses = new Set();
  const cssFiles = findPageFiles(uiSystemDir).filter(f => f.endsWith('.css'));
  
  for (const filePath of cssFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const classRegex = /\.([a-zA-Z0-9_-]+)(?:[:\s,{]|$)/g;
      let match;
      
      while ((match = classRegex.exec(content)) !== null) {
        uiClasses.add(match[1]);
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return uiClasses;
}

/**
 * Categorize classes by component type
 */
function categorizeClasses(classes) {
  const categories = {
    layout: [],
    hero: [],
    blog: [],
    cta: [],
    navigation: [],
    footer: [],
    forms: [],
    admin: [],
    buttons: [],
    other: []
  };
  
  for (const cls of classes) {
    if (cls.includes('layout')) categories.layout.push(cls);
    else if (cls.includes('hero')) categories.hero.push(cls);
    else if (cls.includes('blog')) categories.blog.push(cls);
    else if (cls.includes('cta')) categories.cta.push(cls);
    else if (cls.includes('nav') || cls.includes('menu')) categories.navigation.push(cls);
    else if (cls.includes('footer')) categories.footer.push(cls);
    else if (cls.includes('form') || cls.includes('input')) categories.forms.push(cls);
    else if (cls.includes('admin')) categories.admin.push(cls);
    else if (cls.includes('button') || cls.includes('btn')) categories.buttons.push(cls);
    else categories.other.push(cls);
  }
  
  return categories;
}

/**
 * Analyze component patterns for universality
 */
function analyzeComponentPatterns(pageAnalysis) {
  const patterns = {};
  
  for (const page of pageAnalysis) {
    for (const cls of page.classes) {
      // Extract base component name (before __ or --)
      const baseComponent = cls.split(/__|--/)[0];
      
      if (!patterns[baseComponent]) {
        patterns[baseComponent] = {
          baseClass: baseComponent,
          variants: new Set(),
          usedInPages: new Set(),
          totalUsage: 0
        };
      }
      
      patterns[baseComponent].variants.add(cls);
      patterns[baseComponent].usedInPages.add(path.basename(page.path));
      patterns[baseComponent].totalUsage++;
    }
  }
  
  // Convert Sets to Arrays for JSON serialization
  Object.keys(patterns).forEach(key => {
    patterns[key].variants = Array.from(patterns[key].variants);
    patterns[key].usedInPages = Array.from(patterns[key].usedInPages);
  });
  
  return patterns;
}

/**
 * Generate focused migration plan
 */
function generateFocusedPlan(pageAnalysis, uiSystemClasses, patterns) {
  console.log('📊 PAGE-BY-PAGE STYLE ANALYSIS\n');
  console.log('='.repeat(50));
  
  // Summary by page
  console.log('\n📄 PAGE ANALYSIS SUMMARY:\n');
  
  for (const page of pageAnalysis) {
    const pageName = path.basename(page.path, path.extname(page.path));
    const missingClasses = page.classes.filter(cls => !uiSystemClasses.has(cls));
    
    console.log(`📍 ${pageName.toUpperCase()}`);
    console.log(`   Total classes: ${page.classes.length}`);
    console.log(`   Missing classes: ${missingClasses.length}`);
    
    if (missingClasses.length > 0 && missingClasses.length <= 10) {
      console.log(`   Missing: ${missingClasses.join(', ')}`);
    } else if (missingClasses.length > 10) {
      console.log(`   Sample missing: ${missingClasses.slice(0, 5).join(', ')}...`);
    }
    console.log('');
  }
  
  // Universal component analysis
  console.log('\n🔧 UNIVERSAL COMPONENT OPPORTUNITIES:\n');
  
  const sortedPatterns = Object.values(patterns)
    .filter(p => p.usedInPages.length > 1) // Used in multiple pages
    .sort((a, b) => b.totalUsage - a.totalUsage);
  
  for (const pattern of sortedPatterns.slice(0, 15)) {
    console.log(`📦 ${pattern.baseClass.toUpperCase()}`);
    console.log(`   Used in: ${pattern.usedInPages.length} pages`);
    console.log(`   Total usage: ${pattern.totalUsage} times`);
    console.log(`   Variants: ${pattern.variants.length}`);
    if (pattern.variants.length <= 5) {
      console.log(`   Classes: ${pattern.variants.join(', ')}`);
    }
    console.log('');
  }
  
  // Priority recommendations
  console.log('\n🎯 PRIORITY MIGRATION RECOMMENDATIONS:\n');
  
  const allMissingClasses = new Set();
  pageAnalysis.forEach(page => {
    page.classes.forEach(cls => {
      if (!uiSystemClasses.has(cls)) {
        allMissingClasses.add(cls);
      }
    });
  });
  
  const categorized = categorizeClasses(Array.from(allMissingClasses));
  
  console.log('🔥 CRITICAL (Page Structure):');
  console.log(`   Layout: ${categorized.layout.length} classes`);
  console.log(`   Hero: ${categorized.hero.length} classes`);
  console.log(`   Navigation: ${categorized.navigation.length} classes`);
  
  console.log('\n⚠️  HIGH (Content Display):');
  console.log(`   Blog: ${categorized.blog.length} classes`);
  console.log(`   CTA: ${categorized.cta.length} classes`);
  console.log(`   Footer: ${categorized.footer.length} classes`);
  
  console.log('\n📋 MEDIUM (Interactions):');
  console.log(`   Forms: ${categorized.forms.length} classes`);
  console.log(`   Buttons: ${categorized.buttons.length} classes`);
  console.log(`   Admin: ${categorized.admin.length} classes`);
  
  console.log(`\n📊 TOTAL ACTUALLY NEEDED: ${allMissingClasses.size} classes`);
  console.log(`📊 REDUCTION FROM ORIGINAL: ${2090 - allMissingClasses.size} classes eliminated`);
  
  return {
    totalMissing: allMissingClasses.size,
    categories: categorized,
    patterns: sortedPatterns,
    pageBreakdown: pageAnalysis.map(p => ({
      page: path.basename(p.path),
      totalClasses: p.classes.length,
      missingClasses: p.classes.filter(cls => !uiSystemClasses.has(cls)).length
    }))
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Page-by-Page Style Analysis...\n');
  
  // Analyze pages
  const pageFiles = [
    ...findPageFiles(pagesDir),
    ...findPageFiles(componentsDir)
  ];
  
  console.log(`📁 Found ${pageFiles.length} page/component files\n`);
  
  const pageAnalysis = pageFiles.map(analyzePage).filter(p => p.classes.length > 0);
  const uiSystemClasses = getUISystemClasses();
  const patterns = analyzeComponentPatterns(pageAnalysis);
  
  // Generate focused analysis
  const analysis = generateFocusedPlan(pageAnalysis, uiSystemClasses, patterns);
  
  // Save detailed report
  const report = {
    summary: {
      totalPagesAnalyzed: pageAnalysis.length,
      totalMissingClasses: analysis.totalMissing,
      reductionFromOriginal: 2090 - analysis.totalMissing
    },
    pageBreakdown: analysis.pageBreakdown,
    categories: analysis.categories,
    universalComponents: analysis.patterns,
    detailedPageAnalysis: pageAnalysis
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../docs/PAGE_ANALYSIS_REPORT.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n💾 Detailed report saved to: docs/PAGE_ANALYSIS_REPORT.json');
  console.log('\n✨ Page-by-page analysis complete!');
}

// Run the analysis
main();