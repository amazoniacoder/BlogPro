/**
 * BlogPro Legacy Styles Cleanup
 * Removes redundant styles now handled by UI system
 */

const fs = require('fs').promises;
const path = require('path');

const COMPONENTS_TO_REMOVE = [
  'button',      // Now handled by ui-system/components/button
  'form',        // Now handled by ui-system/components/form  
  'card',        // Now handled by ui-system/components/card
  'modal',       // Now handled by ui-system/components/modal
  'input',       // Part of form system
  'label',       // Part of form system
  'container',   // Now handled by ui-system/components/layout
  'grid',        // Now handled by ui-system/components/layout
];

const FILES_TO_REMOVE = [
  'blocks/button/button.css',           // Original button styles
  'blocks/form/form.css',               // Original form styles
  'blocks/card/card.css',               // Original card styles
  'blocks/modal/modal.css',             // Original modal styles
  'blocks/input/input.css',             // Now part of form system
  'blocks/label/label.css',             // Now part of form system
  'blocks/container/container.css',     // Now in layout system
  'blocks/grid/grid.css',               // Now in layout system
];

const ADMIN_COMPONENTS_TO_REMOVE = [
  'admin/components/button',
  'admin/components/form', 
  'admin/components/card',
  'admin/components/modal',
];

async function cleanupLegacyStyles() {
  console.log('🧹 Starting legacy styles cleanup...');
  
  const stylesPath = path.resolve(__dirname, '..', '..', 'styles');
  
  const cleanup = {
    removed: [],
    kept: [],
    backed_up: []
  };
  
  // Create backup directory
  const backupPath = path.join(stylesPath, '_backup_legacy');
  await fs.mkdir(backupPath, { recursive: true });
  
  // Remove redundant component blocks
  for (const component of COMPONENTS_TO_REMOVE) {
    const componentPath = path.join(stylesPath, 'blocks', component);
    
    if (await directoryExists(componentPath)) {
      // Backup before removal
      const backupComponentPath = path.join(backupPath, 'blocks', component);
      await fs.mkdir(path.dirname(backupComponentPath), { recursive: true });
      await copyDirectory(componentPath, backupComponentPath);
      cleanup.backed_up.push(`blocks/${component}`);
      
      // Keep compatibility files, remove originals
      const compatFile = path.join(componentPath, `${component}-compat.css`);
      const indexFile = path.join(componentPath, 'index.css');
      
      if (await fileExists(compatFile)) {
        // Keep only compatibility layer
        const files = await fs.readdir(componentPath);
        for (const file of files) {
          if (!file.includes('compat') && !file.includes('index')) {
            await fs.unlink(path.join(componentPath, file));
            cleanup.removed.push(`blocks/${component}/${file}`);
          }
        }
        cleanup.kept.push(`blocks/${component}/${component}-compat.css`);
      } else {
        // Remove entire directory if no compatibility layer
        await removeDirectory(componentPath);
        cleanup.removed.push(`blocks/${component}/`);
      }
    }
  }
  
  // Remove redundant admin components
  for (const adminComponent of ADMIN_COMPONENTS_TO_REMOVE) {
    const adminPath = path.join(stylesPath, adminComponent);
    
    if (await directoryExists(adminPath)) {
      // Backup
      const backupAdminPath = path.join(backupPath, adminComponent);
      await fs.mkdir(path.dirname(backupAdminPath), { recursive: true });
      await copyDirectory(adminPath, backupAdminPath);
      cleanup.backed_up.push(adminComponent);
      
      // Remove
      await removeDirectory(adminPath);
      cleanup.removed.push(adminComponent);
    }
  }
  
  // Update main.css to remove old imports
  await updateMainCSS(stylesPath, cleanup);
  
  // Generate cleanup report
  await generateCleanupReport(stylesPath, cleanup);
  
  console.log('✅ Legacy styles cleanup completed');
  console.log(`   🗑️  Removed: ${cleanup.removed.length} items`);
  console.log(`   💾 Backed up: ${cleanup.backed_up.length} items`);
  console.log(`   ✅ Kept: ${cleanup.kept.length} compatibility files`);
}

async function updateMainCSS(stylesPath, cleanup) {
  const mainCSSPath = path.join(stylesPath, 'main.css');
  let mainCSS = await fs.readFile(mainCSSPath, 'utf8');
  
  // Remove imports for deleted components
  const removedImports = [];
  
  for (const component of COMPONENTS_TO_REMOVE) {
    const importPattern = new RegExp(`@import ['"]\\./blocks/${component}/index\\.css['"];?\\n?`, 'g');
    if (mainCSS.match(importPattern)) {
      mainCSS = mainCSS.replace(importPattern, '');
      removedImports.push(`./blocks/${component}/index.css`);
    }
  }
  
  // Add comment about cleanup
  const cleanupComment = `
/* Legacy styles cleanup completed */
/* Removed components now handled by UI system: ${COMPONENTS_TO_REMOVE.join(', ')} */
/* Backup available in _backup_legacy/ directory */

`;
  
  mainCSS = cleanupComment + mainCSS;
  
  await fs.writeFile(mainCSSPath, mainCSS);
  cleanup.removed.push(...removedImports);
}

async function generateCleanupReport(stylesPath, cleanup) {
  const report = {
    timestamp: new Date().toISOString(),
    cleanup_type: 'legacy_styles_removal',
    ui_system_migration: 'completed',
    summary: {
      removed_items: cleanup.removed.length,
      backed_up_items: cleanup.backed_up.length,
      kept_compatibility_files: cleanup.kept.length
    },
    removed_components: COMPONENTS_TO_REMOVE,
    removed_files: cleanup.removed,
    backed_up_files: cleanup.backed_up,
    kept_files: cleanup.kept,
    space_saved: await calculateSpaceSaved(cleanup.removed, stylesPath),
    recommendations: [
      'Test all pages to ensure UI system compatibility files work correctly',
      'Remove _backup_legacy/ directory after confirming everything works',
      'Update any custom CSS that may reference removed classes',
      'Consider removing compatibility files in future version'
    ],
    rollback_instructions: [
      'Restore files from _backup_legacy/ directory if needed',
      'Update main.css imports if rolling back',
      'Restart development server after rollback'
    ]
  };
  
  const reportPath = path.join(stylesPath, '_cleanup_report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📋 Cleanup report generated at:', reportPath);
}

async function calculateSpaceSaved(removedFiles, stylesPath) {
  // Simplified calculation - in real implementation, sum actual file sizes
  return `~${removedFiles.length * 2}KB estimated`;
}

async function directoryExists(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectory(source, target) {
  await fs.mkdir(target, { recursive: true });
  const items = await fs.readdir(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stat = await fs.stat(sourcePath);
    
    if (stat.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function removeDirectory(dirPath) {
  const items = await fs.readdir(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = await fs.stat(itemPath);
    
    if (stat.isDirectory()) {
      await removeDirectory(itemPath);
    } else {
      await fs.unlink(itemPath);
    }
  }
  
  await fs.rmdir(dirPath);
}

cleanupLegacyStyles().catch(console.error);