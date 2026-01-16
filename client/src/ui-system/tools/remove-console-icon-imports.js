/**
 * Remove Console Icon Imports
 * Removes Icon imports that are only used in console.log strings
 */

const fs = require('fs').promises;
const path = require('path');

async function removeConsoleIconImports() {
  console.log('🗑️ Removing Icon imports used only in console.log...');
  
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
  console.log(`   🗑️  Removed console-only imports: ${removedCount} files`);
  console.log(`   ✅ Kept actual imports: ${keptCount} files`);
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
    
    // Check if Icon is only used in console.log/console.error strings
    const consoleIconPattern = /console\.(log|error|warn|info)\([^)]*<Icon[^>]*>[^)]*\)/g;
    const hasConsoleIconUsage = consoleIconPattern.test(content);
    
    if (hasConsoleIconUsage) {
      // Remove console.log Icon usage and check if there's any other usage
      const contentWithoutConsoleIcons = content.replace(consoleIconPattern, (match) => {
        return match.replace(/<Icon[^>]*>/g, '🔧'); // Replace with emoji
      });
      
      // Now check if Icon is used anywhere else
      const realIconUsagePatterns = [
        /<Icon\s+[^>]*>/,                    // JSX: <Icon ...>
        /React\.createElement\(Icon/,         // React.createElement(Icon
        /\bIcon\s*\(/,                       // Function call: Icon(
        /\bIcon\s*\./,                       // Property access: Icon.
        /return\s+Icon/,                     // return Icon
        /export\s+.*Icon/,                   // export Icon
        /const\s+\w+\s*=\s*Icon/,           // const x = Icon
      ];
      
      const hasRealUsage = realIconUsagePatterns.some(pattern => 
        pattern.test(contentWithoutConsoleIcons)
      );
      
      if (!hasRealUsage) {
        // Remove Icon import and replace console Icon usage with emojis
        let newContent = content.replace(/import\s*{\s*Icon\s*}\s*from\s*['"'][^'"]*['"];?\s*\n?/g, '');
        newContent = newContent.replace(consoleIconPattern, (match) => {
          return match.replace(/<Icon[^>]*>/g, '🔧');
        });
        
        await fs.writeFile(filePath, newContent);
        console.log(`🗑️  Removed console-only import: ${path.relative(process.cwd(), filePath)}`);
        return 'removed';
      }
    }
    
    console.log(`✅ Kept (has real usage): ${path.relative(process.cwd(), filePath)}`);
    return 'kept';
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 'error';
  }
}

removeConsoleIconImports().catch(console.error);