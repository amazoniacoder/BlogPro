#!/usr/bin/env node

/**
 * Remove BP Prefixes Script
 * Removes .bp- prefixes from all UI System CSS files to match site classes
 */

const fs = require('fs');
const path = require('path');

// Get the UI System directory
const uiSystemDir = path.join(__dirname, '..');

/**
 * Recursively find all CSS, TS, TSX, JS, JSX files in a directory
 */
function findFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          traverse(fullPath);
        }
      } else if (item.match(/\.(css|ts|tsx|js|jsx)$/)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Remove bp- prefixes from content (CSS classes, TypeScript className strings, and CSS variables)
 */
function removeBpPrefixes(content) {
  let updatedContent = content;
  
  // Replace .bp- class selectors in CSS
  updatedContent = updatedContent.replace(/\.bp-([a-zA-Z0-9_-]+)/g, '.$1');
  
  // Replace 'bp-' className strings in TypeScript/JavaScript
  updatedContent = updatedContent.replace(/'bp-([a-zA-Z0-9_-]+)'/g, "'$1'");
  updatedContent = updatedContent.replace(/"bp-([a-zA-Z0-9_-]+)"/g, '"$1"');
  updatedContent = updatedContent.replace(/`bp-([a-zA-Z0-9_-]+)`/g, '`$1`');
  
  // Replace bp- in template literals like `alert--${variant}`
  updatedContent = updatedContent.replace(/bp-([a-zA-Z0-9_-]+)--/g, '$1--');
  updatedContent = updatedContent.replace(/bp-([a-zA-Z0-9_-]+)__/g, '$1__');
  
  // Replace --bp- CSS variables with -- (remove bp- but keep --)
  updatedContent = updatedContent.replace(/--bp-([a-zA-Z0-9_-]+)/g, '--$1');
  
  return updatedContent;
}

/**
 * Process a single file (CSS, TS, TSX, JS, JSX)
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = removeBpPrefixes(content);
    
    // Only write if content changed
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${path.relative(uiSystemDir, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting BP prefix removal...\n');
  
  const files = findFiles(uiSystemDir);
  console.log(`📁 Found ${files.length} files (CSS, TS, TSX, JS, JSX)\n`);
  
  let updatedCount = 0;
  
  for (const filePath of files) {
    if (processFile(filePath)) {
      updatedCount++;
    }
  }
  
  console.log(`\n✨ Complete! Updated ${updatedCount} files`);
  console.log(`📊 Total files processed: ${files.length}`);
  
  if (updatedCount > 0) {
    console.log('\n🎉 BP prefixes removed successfully!');
    console.log('💡 UI System classes now match site classes (.header, .button, etc.)');
  } else {
    console.log('\n📝 No changes needed - prefixes already removed or no BP classes found');
  }
}

// Run the script
main();