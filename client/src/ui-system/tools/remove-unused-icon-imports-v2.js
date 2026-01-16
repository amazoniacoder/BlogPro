/**
 * Remove Unused Icon Imports v2
 * More precise detection - removes imports where Icon is only used in strings/comments
 */

const fs = require('fs').promises;
const path = require('path');

async function removeUnusedIconImports() {
  console.log('🗑️ Removing unused Icon imports (v2)...');
  
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
    
    // Remove import line first to check actual usage
    const contentWithoutImport = content.replace(/import\s*{\s*Icon\s*}\s*from\s*['"'][^'"]*['"];?\s*\n?/g, '');
    
    // Check for ACTUAL Icon usage (not in strings or comments)
    const actualIconUsagePatterns = [
      /<Icon\s+[^>]*>/,                    // JSX: <Icon ...>
      /React\.createElement\(Icon/,         // React.createElement(Icon
      /\bIcon\s*\(/,                       // Function call: Icon(
      /\bIcon\s*\./,                       // Property access: Icon.
      /\bIcon\s*\[/,                       // Array access: Icon[
      /return\s+Icon/,                     // return Icon
      /export\s+.*Icon/,                   // export Icon
      /const\s+\w+\s*=\s*Icon/,           // const x = Icon
      /let\s+\w+\s*=\s*Icon/,             // let x = Icon
      /var\s+\w+\s*=\s*Icon/              // var x = Icon
    ];
    
    const hasActualUsage = actualIconUsagePatterns.some(pattern => 
      pattern.test(contentWithoutImport)
    );
    
    if (!hasActualUsage) {
      // Remove the Icon import line
      const newContent = contentWithoutImport;
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