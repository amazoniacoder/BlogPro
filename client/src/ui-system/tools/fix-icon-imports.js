/**
 * Fix Icon Import Paths
 * Automatically fixes incorrect icon import paths in texteditor plugin
 */

const fs = require('fs').promises;
const path = require('path');

const INCORRECT_IMPORT = `import { Icon } from '../../../ui-system/icons/components';`;
const CORRECT_IMPORT = `import { Icon } from '../../../../../ui-system/icons/components';`;

async function fixIconImports() {
  console.log('🔧 Fixing icon import paths...');
  
  const texteditorPath = path.resolve(__dirname, '..', '..', 'plugins', 'texteditor');
  const files = await findFilesWithIncorrectImports(texteditorPath);
  
  let fixedCount = 0;
  let removedCount = 0;
  
  for (const filePath of files) {
    const result = await fixFileImports(filePath);
    if (result === 'fixed') fixedCount++;
    if (result === 'removed') removedCount++;
  }
  
  console.log(`✅ Import fix complete:`);
  console.log(`   📝 Fixed paths: ${fixedCount} files`);
  console.log(`   🗑️  Removed unused: ${removedCount} files`);
  console.log(`   📁 Total processed: ${files.length} files`);
}

async function findFilesWithIncorrectImports(basePath) {
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
          if (content.includes(INCORRECT_IMPORT)) {
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

async function fixFileImports(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check if Icon is actually used in the file
    const iconUsagePattern = /<Icon\s+name=|Icon\s*\(/;
    const isIconUsed = iconUsagePattern.test(content);
    
    if (!isIconUsed) {
      // Remove unused import
      const newContent = content.replace(INCORRECT_IMPORT + '\n', '');
      await fs.writeFile(filePath, newContent);
      console.log(`🗑️  Removed unused import: ${path.relative(process.cwd(), filePath)}`);
      return 'removed';
    } else {
      // Fix import path
      const newContent = content.replace(INCORRECT_IMPORT, CORRECT_IMPORT);
      await fs.writeFile(filePath, newContent);
      console.log(`🔧 Fixed import path: ${path.relative(process.cwd(), filePath)}`);
      return 'fixed';
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 'error';
  }
}

fixIconImports().catch(console.error);