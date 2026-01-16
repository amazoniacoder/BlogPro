/**
 * BlogPro Cleanup Verification
 * Verifies styles cleanup and UI system integration
 */

const fs = require('fs').promises;
const path = require('path');

async function verifyCleanup() {
  console.log('🔍 Verifying styles cleanup...');
  
  const stylesPath = path.resolve(__dirname, '..', '..', 'styles');
  const verification = {
    ui_system_active: false,
    compatibility_layers: [],
    remaining_legacy: [],
    main_css_updated: false,
    backup_created: false
  };
  
  // Check if UI system is properly imported
  const mainCSSPath = path.join(stylesPath, 'main.css');
  const mainCSS = await fs.readFile(mainCSSPath, 'utf8');
  
  verification.ui_system_active = mainCSS.includes('../ui-system/index.css');
  verification.main_css_updated = mainCSS.includes('Legacy styles cleanup completed');
  
  // Check compatibility layers
  const compatFiles = [
    'blocks/button/button-compat.css',
    'blocks/form/form-compat.css',
    'blocks/layout/layout-compat.css'
  ];
  
  for (const compatFile of compatFiles) {
    const compatPath = path.join(stylesPath, compatFile);
    if (await fileExists(compatPath)) {
      verification.compatibility_layers.push(compatFile);
    }
  }
  
  // Check for backup
  const backupPath = path.join(stylesPath, '_backup_legacy');
  verification.backup_created = await directoryExists(backupPath);
  
  // Scan for remaining legacy components
  const blocksPath = path.join(stylesPath, 'blocks');
  const blocks = await fs.readdir(blocksPath);
  
  const legacyComponents = ['button', 'form', 'card', 'modal', 'input', 'label', 'container', 'grid'];
  
  for (const block of blocks) {
    const blockPath = path.join(blocksPath, block);
    const stat = await fs.stat(blockPath);
    
    if (stat.isDirectory() && legacyComponents.includes(block)) {
      const files = await fs.readdir(blockPath);
      const hasOriginalCSS = files.some(file => 
        file.endsWith('.css') && !file.includes('compat') && !file.includes('index')
      );
      
      if (hasOriginalCSS) {
        verification.remaining_legacy.push(block);
      }
    }
  }
  
  // Generate verification report
  const report = {
    timestamp: new Date().toISOString(),
    verification_status: 'completed',
    cleanup_successful: verification.remaining_legacy.length === 0,
    ui_system_integration: {
      active: verification.ui_system_active,
      main_css_updated: verification.main_css_updated,
      compatibility_layers: verification.compatibility_layers.length
    },
    legacy_cleanup: {
      backup_created: verification.backup_created,
      remaining_legacy_components: verification.remaining_legacy,
      cleanup_complete: verification.remaining_legacy.length === 0
    },
    recommendations: verification.remaining_legacy.length > 0 ? [
      `Remove remaining legacy components: ${verification.remaining_legacy.join(', ')}`,
      'Run cleanup script again if needed',
      'Check for custom CSS that may depend on removed classes'
    ] : [
      'Cleanup successful - all legacy components removed',
      'Test application thoroughly',
      'Remove backup directory after testing',
      'Monitor for any styling issues'
    ],
    next_steps: [
      'Test all pages and components',
      'Verify theme switching works',
      'Check mobile responsiveness',
      'Validate accessibility compliance'
    ]
  };
  
  const reportPath = path.join(stylesPath, '_verification_report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log('✅ Cleanup verification completed');
  console.log(`   🎯 UI System Active: ${verification.ui_system_active ? 'Yes' : 'No'}`);
  console.log(`   🔗 Compatibility Layers: ${verification.compatibility_layers.length}`);
  console.log(`   🗑️  Legacy Components: ${verification.remaining_legacy.length}`);
  console.log(`   💾 Backup Created: ${verification.backup_created ? 'Yes' : 'No'}`);
  
  if (verification.remaining_legacy.length === 0) {
    console.log('🎉 Cleanup successful - ready for production!');
  } else {
    console.log(`⚠️  ${verification.remaining_legacy.length} legacy components still present`);
  }
  
  return report;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function directoryExists(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

verifyCleanup().catch(console.error);