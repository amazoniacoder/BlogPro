/**
 * Fix CSS Composes Paths
 * Updates CSS Modules composes statements to use correct paths
 */

const fs = require('fs').promises;
const path = require('path');

async function fixCSSComposes() {
  console.log('🔧 Fixing CSS composes paths...');
  
  const stylesPath = path.resolve(__dirname, '..', '..', 'styles');
  const files = await findCSSFiles(stylesPath);
  
  let fixedCount = 0;
  
  for (const filePath of files) {
    const result = await fixFileComposes(filePath);
    if (result) fixedCount++;
  }
  
  console.log(`✅ CSS composes fix complete: ${fixedCount} files updated`);
}

async function findCSSFiles(basePath) {
  const files = [];
  
  async function scanDirectory(dirPath) {
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory() && !['node_modules', '.git', 'dist'].includes(item)) {
          await scanDirectory(itemPath);
        } else if (item.endsWith('.css')) {
          const content = await fs.readFile(itemPath, 'utf8');
          if (content.includes('composes:') && content.includes('ui-system')) {
            files.push(itemPath);
          }
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  await scanDirectory(basePath);
  return files;
}

async function fixFileComposes(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Replace relative ui-system paths with absolute paths from src
    const newContent = content.replace(
      /composes:\s*([^;]+)\s+from\s+['"]\.\.\/\.\.\/ui-system\/([^'"]+)['"]/g,
      "composes: $1 from 'src/ui-system/$2'"
    );
    
    if (newContent !== content) {
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

fixCSSComposes().catch(console.error);