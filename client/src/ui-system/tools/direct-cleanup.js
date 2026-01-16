#!/usr/bin/env node

/**
 * BlogPro Direct Legacy Cleanup
 * Directly removes legacy files without prompts
 */

const fs = require('fs');
const path = require('path');

const projectPath = path.join(__dirname, '..', '..', '..');

// Legacy directories to remove
const legacyDirs = [
  'client/src/styles/blocks',
  'client/src/styles/admin/components',
  'client/src/styles/admin/pages',
  'client/src/styles/admin/layouts',
  'client/src/styles/_backup_legacy',
  'client/src/styles/components'
];

// Legacy files to remove
const legacyFiles = [
  'client/src/styles/admin/bem-components.css',
  'client/src/styles/admin/common.css',
  'client/src/styles/_cleanup_report_final.json',
  'client/src/styles/_cleanup_report.json',
  'client/src/styles/_verification_report.json'
];

function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      removeDirectory(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  });
  
  fs.rmdirSync(dirPath);
}

console.log('🧹 Starting Direct Legacy Cleanup...\n');

let removedCount = 0;
let totalSize = 0;

// Remove legacy directories
legacyDirs.forEach(dir => {
  const fullPath = path.join(projectPath, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️ Removing directory: ${dir}`);
    removeDirectory(fullPath);
    removedCount++;
  }
});

// Remove legacy files
legacyFiles.forEach(file => {
  const fullPath = path.join(projectPath, file);
  if (fs.existsSync(fullPath)) {
    const size = fs.statSync(fullPath).size;
    totalSize += size;
    console.log(`🗑️ Removing file: ${file}`);
    fs.unlinkSync(fullPath);
    removedCount++;
  }
});

console.log(`\n✅ Cleanup completed!`);
console.log(`📊 Removed: ${removedCount} items`);
console.log(`💾 Space reclaimed: ${(totalSize / 1024).toFixed(2)} KB`);

console.log('\n🎉 Legacy cleanup successful!');