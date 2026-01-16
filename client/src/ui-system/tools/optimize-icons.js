/**
 * BlogPro Icon Optimization Script
 * Optimizes icon system and replaces inline SVGs
 */

const fs = require('fs').promises;
const path = require('path');

const iconReplacements = {
  // Login icon
  'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4': 'login',
  // Logout icon  
  'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4': 'logout',
  // Admin icon
  'rect x="3" y="3" width="7" height="7"': 'admin',
  // User icon
  'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2': 'user'
};

async function optimizeIcons() {
  console.log('🎨 Starting icon optimization...');
  
  const srcPath = path.resolve(__dirname, '..', '..');
  
  // Find and replace inline SVGs in components
  const componentFiles = await findComponentFiles(srcPath);
  
  let optimizedFiles = 0;
  let replacedSVGs = 0;
  
  for (const filePath of componentFiles) {
    const result = await optimizeFileIcons(filePath);
    if (result.changed) {
      optimizedFiles++;
      replacedSVGs += result.replacements;
    }
  }
  
  // Rebuild icon system with new icons
  await rebuildIconSystem();
  
  console.log(`✅ Icon optimization completed:`);
  console.log(`   📁 Files optimized: ${optimizedFiles}`);
  console.log(`   🎨 SVGs replaced: ${replacedSVGs}`);
}

async function findComponentFiles(basePath) {
  const files = [];
  const excludeDirs = ['node_modules', '.git', 'dist', 'build'];
  
  async function scanDirectory(dir) {
    try {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        if (excludeDirs.includes(item)) continue;
        
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          await scanDirectory(itemPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
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

async function optimizeFileIcons(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const originalContent = content;
    let replacements = 0;
    
    // Replace inline SVGs with Icon components
    for (const [svgPath, iconName] of Object.entries(iconReplacements)) {
      const svgRegex = new RegExp(
        `<svg[^>]*>.*?${svgPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?</svg>`,
        'gs'
      );
      
      const matches = content.match(svgRegex);
      if (matches) {
        content = content.replace(svgRegex, `<Icon name="${iconName}" size={20} />`);
        replacements += matches.length;
      }
    }
    
    // Add Icon import if we made replacements
    if (replacements > 0 && !content.includes('import { Icon }')) {
      const importMatch = content.match(/^(import.*\n)*/m);
      if (importMatch) {
        const importSection = importMatch[0];
        const iconImport = "import { Icon } from '../../ui-system/icons/components';\n";
        content = content.replace(importSection, importSection + iconImport);
      }
    }
    
    if (content !== originalContent) {
      await fs.writeFile(filePath, content);
      console.log(`   📝 Optimized: ${path.relative(process.cwd(), filePath)} (${replacements} SVGs)`);
      return { changed: true, replacements };
    }
    
    return { changed: false, replacements: 0 };
  } catch (error) {
    console.warn(`   ⚠️  Could not optimize ${filePath}:`, error.message);
    return { changed: false, replacements: 0 };
  }
}

async function rebuildIconSystem() {
  console.log('🔄 Rebuilding icon system...');
  
  const iconBuilderPath = path.resolve(__dirname, 'build-icons.js');
  const { execSync } = require('child_process');
  
  try {
    execSync(`node "${iconBuilderPath}"`, { 
      cwd: path.dirname(iconBuilderPath),
      stdio: 'inherit'
    });
    console.log('✅ Icon system rebuilt');
  } catch (error) {
    console.warn('⚠️  Could not rebuild icon system:', error.message);
  }
}

optimizeIcons().catch(console.error);