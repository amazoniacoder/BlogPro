/**
 * Remove Unused Icon Imports
 * Removes all unused Icon imports from texteditor files
 */

const fs = require('fs').promises;
const path = require('path');

async function removeUnusedIconImports() {
  console.log('🗑️ Removing unused Icon imports...');
  
  const texteditorPath = path.resolve(__dirname, '..', '..', 'plugins', 'texteditor');
  const files = await findFilesWithIconImports(texteditorPath);
  
  let removedCount = 0;
  let keptCount = 0;
  
  for (const filePath of files) {
    const result = await processFile(filePath);
    if (result === 'removed') removedCount++;
    if (result === 'kept') keptCount++;
  }
  
  console.log(`✅ Cleanup complete:`);
  console.log(`   🗑️  Removed unused imports: ${removedCount} files`);
  console.log(`   ✅ Kept used imports: ${keptCount} files`);
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

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check if Icon is actually used in the file content
    const iconUsagePatterns = [
      /<Icon\s+name=/,           // JSX usage: <Icon name="..."
      /Icon\s*\(/,               // Function call: Icon(
      /\bIcon\b(?!\s*from)/      // Variable reference (not in import)
    ];
    
    const isIconUsed = iconUsagePatterns.some(pattern => pattern.test(content));
    
    if (!isIconUsed) {
      // Remove the Icon import line
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => 
        !line.trim().startsWith(`import { Icon } from`) &&
        !line.trim().startsWith(`import{Icon}from`)
      );
      
      const newContent = filteredLines.join('\n');
      await fs.writeFile(filePath, newContent);
      
      console.log(`🗑️  Removed: ${path.relative(process.cwd(), filePath)}`);
      return 'removed';
    } else {
      console.log(`✅ Kept: ${path.relative(process.cwd(), filePath)}`);
      return 'kept';
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 'error';
  }
}

removeUnusedIconImports().catch(console.error);