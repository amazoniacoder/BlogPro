/**
 * BlogPro Icon Migration Script
 * Replaces emoji icons with SVG icons in text editor
 */

const fs = require('fs').promises;
const path = require('path');

const iconMigrationMap = {
  '🖼️': 'image',
  '🎆': 'bold', 
  '💾': 'save',
  '✏️': 'edit',
  '🗑️': 'delete',
  '➕': 'add',
  '🔍': 'search',
  '⚙️': 'gear',
  '📖': 'book',
  '❌': 'x',
  '☀️': 'sun',
  '🌙': 'moon'
};

async function migrateIcons() {
  console.log('🎨 Starting icon migration...');
  
  const textEditorPath = path.resolve(__dirname, '..', '..', 'plugins', 'texteditor');
  
  // Find all files that might contain emoji icons
  const filesToCheck = await findFilesToMigrate(textEditorPath);
  
  let migratedFiles = 0;
  let replacedIcons = 0;
  
  for (const filePath of filesToCheck) {
    const result = await migrateFileIcons(filePath);
    if (result.changed) {
      migratedFiles++;
      replacedIcons += result.replacements;
    }
  }
  
  console.log(`✅ Icon migration completed:`);
  console.log(`   📁 Files migrated: ${migratedFiles}`);
  console.log(`   🎨 Icons replaced: ${replacedIcons}`);
}

async function findFilesToMigrate(basePath) {
  const files = [];
  
  async function scanDirectory(dir) {
    try {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          await scanDirectory(itemPath);
        } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js'))) {
          files.push(itemPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  await scanDirectory(basePath);
  return files;
}

async function migrateFileIcons(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const originalContent = content;
    let replacements = 0;
    
    // Replace emoji icons with Icon components
    for (const [emoji, iconName] of Object.entries(iconMigrationMap)) {
      const emojiRegex = new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(emojiRegex);
      
      if (matches) {
        // Replace emoji in JSX with Icon component
        content = content.replace(
          new RegExp(`<span[^>]*>${emoji}</span>`, 'g'),
          `<Icon name="${iconName}" size={16} />`
        );
        
        // Replace standalone emoji
        content = content.replace(emojiRegex, `<Icon name="${iconName}" size={16} />`);
        
        replacements += matches.length;
      }
    }
    
    // Add Icon import if we made replacements and it's not already imported
    if (replacements > 0 && !content.includes('import { Icon }')) {
      const importMatch = content.match(/^(import.*from.*['"][^'"]*['"];?\s*\n)*/m);
      if (importMatch) {
        const importSection = importMatch[0];
        const iconImport = "import { Icon } from '../../../ui-system/icons/components';\n";
        content = content.replace(importSection, importSection + iconImport);
      }
    }
    
    if (content !== originalContent) {
      await fs.writeFile(filePath, content);
      console.log(`   📝 Updated: ${path.relative(process.cwd(), filePath)} (${replacements} icons)`);
      return { changed: true, replacements };
    }
    
    return { changed: false, replacements: 0 };
  } catch (error) {
    console.warn(`   ⚠️  Could not migrate ${filePath}:`, error.message);
    return { changed: false, replacements: 0 };
  }
}

migrateIcons().catch(console.error);