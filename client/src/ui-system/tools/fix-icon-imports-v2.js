/**
 * Fix Icon Import Paths v2
 * Calculates correct relative paths and removes unused imports
 */

const fs = require('fs').promises;
const path = require('path');

async function fixIconImports() {
  console.log('🔧 Fixing icon import paths (v2)...');
  
  const texteditorPath = path.resolve(__dirname, '..', '..', 'plugins', 'texteditor');
  const uiSystemPath = path.resolve(__dirname, '..');
  
  const files = await findFilesWithIconImports(texteditorPath);
  
  let fixedCount = 0;
  let removedCount = 0;
  
  for (const filePath of files) {
    const result = await fixFileImports(filePath, uiSystemPath);
    if (result === 'fixed') fixedCount++;
    if (result === 'removed') removedCount++;
  }
  
  console.log(`✅ Import fix complete:`);
  console.log(`   📝 Fixed paths: ${fixedCount} files`);
  console.log(`   🗑️  Removed unused: ${removedCount} files`);
  console.log(`   📁 Total processed: ${files.length} files`);
}

async function findFilesWithIconImports(basePath) {
  const files = [];
  
  async function scanDirectory(dirPath) {
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory() && !['node_modules', '.git', 'dist'].includes(item)) {
          await scanDirectory(itemPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          const content = await fs.readFile(itemPath, 'utf8');
          if (content.includes(`import { Icon } from`)) {
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

async function fixFileImports(filePath, uiSystemPath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check if Icon is actually used in the file
    const iconUsagePattern = /<Icon\s+name=|Icon\s*\(/;
    const isIconUsed = iconUsagePattern.test(content);
    
    if (!isIconUsed) {
      // Remove unused import line completely
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => !line.includes(`import { Icon } from`));
      const newContent = filteredLines.join('\n');
      
      await fs.writeFile(filePath, newContent);
      console.log(`🗑️  Removed unused import: ${path.relative(process.cwd(), filePath)}`);
      return 'removed';
    } else {
      // Calculate correct relative path
      const fileDir = path.dirname(filePath);
      const relativePath = path.relative(fileDir, path.join(uiSystemPath, 'icons', 'components'));
      const correctImport = `import { Icon } from '${relativePath.replace(/\\/g, '/')}';`;
      
      // Replace any existing Icon import
      const iconImportPattern = /import\s*{\s*Icon\s*}\s*from\s*['"][^'"]*['"];?/g;
      const newContent = content.replace(iconImportPattern, correctImport);
      
      await fs.writeFile(filePath, newContent);
      console.log(`🔧 Fixed import path: ${path.relative(process.cwd(), filePath)} -> ${relativePath.replace(/\\/g, '/')}`);
      return 'fixed';
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 'error';
  }
}

fixIconImports().catch(console.error);