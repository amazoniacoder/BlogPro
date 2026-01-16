#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * CSS Migration Helper Script
 * Helps migrate remaining CSS components to BEM blocks
 */

const COMPONENTS_DIR = path.join(__dirname, '../client/src/styles/components');
const BLOCKS_DIR = path.join(__dirname, '../client/src/styles/blocks');

// Components that still need migration
const REMAINING_COMPONENTS = [
  'accessibility-menu-centered.css',
  'blog-post.css', 
  'category-sidebar.css',
  'texteditor.css'
];

function createBEMBlock(componentName, cssContent) {
  const blockName = componentName.replace('.css', '');
  const blockDir = path.join(BLOCKS_DIR, blockName);
  
  // Create block directory
  if (!fs.existsSync(blockDir)) {
    fs.mkdirSync(blockDir, { recursive: true });
    console.log(`✅ Created directory: ${blockDir}`);
  }
  
  // Convert CSS to BEM naming (basic conversion)
  const bemCSS = convertToBEM(cssContent, blockName);
  
  // Write main CSS file
  const cssFile = path.join(blockDir, `${blockName}.css`);
  fs.writeFileSync(cssFile, bemCSS);
  console.log(`✅ Created CSS file: ${cssFile}`);
  
  // Write index file
  const indexFile = path.join(blockDir, 'index.css');
  fs.writeFileSync(indexFile, `@import './${blockName}.css';`);
  console.log(`✅ Created index file: ${indexFile}`);
}

function convertToBEM(cssContent, blockName) {
  // Basic BEM conversion - replace common patterns
  let bemCSS = cssContent;
  
  // Add BEM block comment header
  bemCSS = `/* ${blockName.charAt(0).toUpperCase() + blockName.slice(1)} Block - BEM Style */\n\n${bemCSS}`;
  
  // Convert common class patterns to BEM
  // This is a basic conversion - manual review needed
  bemCSS = bemCSS.replace(/\.([\w-]+)\s*{/g, (match, className) => {
    if (className.includes('__') || className.includes('--')) {
      return match; // Already BEM-like
    }
    
    // Convert to BEM block if it matches the component name
    if (className.toLowerCase().includes(blockName.toLowerCase())) {
      return `.${blockName} {`;
    }
    
    // Convert to BEM element
    return `.${blockName}__${className} {`;
  });
  
  return bemCSS;
}

function updateMainCSS() {
  const mainCSSPath = path.join(__dirname, '../client/src/styles/main.css');
  let mainCSS = fs.readFileSync(mainCSSPath, 'utf8');
  
  // Add imports for new blocks (if not already present)
  const newImports = REMAINING_COMPONENTS.map(comp => {
    const blockName = comp.replace('.css', '');
    return `@import './blocks/${blockName}/index.css';`;
  });
  
  // Find the migrated component blocks section
  const migratedSection = '/* Import migrated component blocks */';
  const insertIndex = mainCSS.indexOf(migratedSection);
  
  if (insertIndex !== -1) {
    const endOfSection = mainCSS.indexOf('\n\n', insertIndex);
    const beforeSection = mainCSS.substring(0, endOfSection);
    const afterSection = mainCSS.substring(endOfSection);
    
    // Add new imports
    const updatedSection = beforeSection + '\n' + newImports.join('\n');
    mainCSS = updatedSection + afterSection;
    
    fs.writeFileSync(mainCSSPath, mainCSS);
    console.log('✅ Updated main.css with new imports');
  }
}

function generateMigrationReport() {
  console.log('\n📊 CSS Migration Report');
  console.log('========================');
  
  const componentsToMigrate = REMAINING_COMPONENTS.filter(comp => {
    const compPath = path.join(COMPONENTS_DIR, comp);
    return fs.existsSync(compPath);
  });
  
  console.log(`📁 Components to migrate: ${componentsToMigrate.length}`);
  componentsToMigrate.forEach(comp => {
    console.log(`   - ${comp}`);
  });
  
  const existingBlocks = fs.readdirSync(BLOCKS_DIR).filter(item => {
    return fs.statSync(path.join(BLOCKS_DIR, item)).isDirectory();
  });
  
  console.log(`\n✅ Existing BEM blocks: ${existingBlocks.length}`);
  console.log(`📈 Migration progress: ${Math.round((existingBlocks.length / (existingBlocks.length + componentsToMigrate.length)) * 100)}%`);
}

// Main execution
function main() {
  console.log('🚀 CSS Migration Helper');
  console.log('========================\n');
  
  // Generate report first
  generateMigrationReport();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--migrate')) {
    console.log('\n🔄 Starting migration...\n');
    
    REMAINING_COMPONENTS.forEach(componentFile => {
      const componentPath = path.join(COMPONENTS_DIR, componentFile);
      
      if (fs.existsSync(componentPath)) {
        const cssContent = fs.readFileSync(componentPath, 'utf8');
        const componentName = componentFile.replace('.css', '');
        
        console.log(`🔄 Migrating ${componentFile}...`);
        createBEMBlock(componentName, cssContent);
      } else {
        console.log(`⚠️  Component not found: ${componentFile}`);
      }
    });
    
    updateMainCSS();
    console.log('\n✅ Migration completed!');
    console.log('\n⚠️  Manual review required:');
    console.log('   - Check BEM class naming in generated files');
    console.log('   - Update React components to use new class names');
    console.log('   - Test visual appearance');
    console.log('   - Remove old component files after verification');
  } else {
    console.log('\n💡 Usage:');
    console.log('   node css-migration-helper.js --migrate');
    console.log('\n   This will migrate remaining CSS components to BEM blocks.');
  }
}

main();