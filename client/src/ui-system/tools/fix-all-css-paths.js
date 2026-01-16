/**
 * Fix All CSS Paths
 * Comprehensive fix for all CSS import and compose paths
 */

const fs = require('fs').promises;
const path = require('path');

async function fixAllCSSPaths() {
  console.log('🔧 Fixing ALL CSS paths...');
  
  const clientPath = path.resolve(__dirname, '..', '..', '..');
  const files = await findAllCSSFiles(clientPath);
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    const result = await fixFilePaths(filePath);
    if (result) fixedCount++;
  }
  
  console.log(`✅ All CSS paths fix complete: ${fixedCount} files updated`);
}

async function findAllCSSFiles(basePath) {
  const files = [];
  
  async function scanDirectory(dirPath) {
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
          await scanDirectory(itemPath);
        } else if (item.endsWith('.css')) {
          files.push(itemPath);
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  await scanDirectory(basePath);
  return files;
}

async function fixFilePaths(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    // Fix relative paths that go up to ui-system
    const relativeUISystemPattern = /@import\s+['"]\.\.\/\.\.\/ui-system\/([^'"]+)['"]/g;
    if (relativeUISystemPattern.test(content)) {
      newContent = newContent.replace(relativeUISystemPattern, "@import '../ui-system/$1'");
      hasChanges = true;
    }
    
    // Fix composes with relative ui-system paths
    const composesUISystemPattern = /composes:\s*([^;]+)\s+from\s+['"]\.\.\/\.\.\/ui-system\/([^'"]+)['"]/g;
    if (composesUISystemPattern.test(content)) {
      newContent = newContent.replace(composesUISystemPattern, "composes: $1 from '../ui-system/$2'");
      hasChanges = true;
    }
    
    // Fix any src/ prefixed paths back to relative
    const srcPrefixPattern = /@import\s+['"]src\/ui-system\/([^'"]+)['"]/g;
    if (srcPrefixPattern.test(content)) {
      newContent = newContent.replace(srcPrefixPattern, "@import '../ui-system/$1'");
      hasChanges = true;
    }
    
    const srcComposesPattern = /composes:\s*([^;]+)\s+from\s+['"]src\/ui-system\/([^'"]+)['"]/g;
    if (srcComposesPattern.test(content)) {
      newContent = newContent.replace(srcComposesPattern, "composes: $1 from '../ui-system/$2'");
      hasChanges = true;
    }
    
    if (hasChanges) {
      await fs.writeFile(filePath, newContent);
      console.log(`🔧 Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

fixAllCSSPaths().catch(console.error);