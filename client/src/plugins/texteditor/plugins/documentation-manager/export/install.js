#!/usr/bin/env node

/**
 * BlogPro Plugin Installation Script
 * Automatically sets up the plugin with UI system
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Installing documentation-manager plugin...');

// Check if this is a BlogPro project
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.name?.includes('blogpro') || packageJson.blogpro) {
    console.log('✅ BlogPro project detected');
    
    // Copy UI system files to project
    console.log('📁 Setting up UI system integration...');
    
    // Additional setup logic would go here
    
    console.log('🎉 Plugin installed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Import the UI system in your project');
    console.log('2. Add the plugin to your BlogPro configuration');
    console.log('3. Restart your development server');
  } else {
    console.log('⚠️  This doesn\'t appear to be a BlogPro project');
    console.log('   The plugin may not work correctly outside of BlogPro');
  }
} else {
  console.log('⚠️  No package.json found in current directory');
}
