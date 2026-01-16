#!/usr/bin/env node

/**
 * BlogPro Cleanup Execution Script
 * Safely executes the migration cleanup process
 */

const readline = require('readline');
const LegacyCleanup = require('./legacy-cleanup');
const StyleOptimizer = require('./style-optimizer');
const FinalOptimizer = require('./final-optimizer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function executeCleanup() {
  console.log('🧹 BlogPro Legacy Cleanup Execution\n');
  console.log('⚠️  WARNING: This will permanently delete legacy CSS files!\n');
  
  // Safety confirmation
  const confirm1 = await askQuestion('Are you sure you want to proceed? (yes/no): ');
  if (confirm1 !== 'yes') {
    console.log('❌ Cleanup cancelled by user');
    rl.close();
    return;
  }

  const confirm2 = await askQuestion('Have you backed up your project? (yes/no): ');
  if (confirm2 !== 'yes') {
    console.log('💡 Please backup your project first, then run this script again');
    rl.close();
    return;
  }

  const confirm3 = await askQuestion('Type "DELETE LEGACY FILES" to confirm: ');
  if (confirm3 !== 'delete legacy files') {
    console.log('❌ Cleanup cancelled - confirmation text did not match');
    rl.close();
    return;
  }

  rl.close();

  console.log('\n🚀 Starting BlogPro Legacy Cleanup...\n');

  try {
    const projectPath = require('path').join(__dirname, '..', '..', '..');

    // Step 1: Execute legacy cleanup
    console.log('🧹 Step 1: Removing legacy CSS files...');
    const legacyCleanup = new LegacyCleanup();
    const cleanupResults = legacyCleanup.performCleanup(projectPath, false); // Execute for real
    legacyCleanup.updateMainCSS(projectPath);
    legacyCleanup.updateAdminCSS(projectPath);
    legacyCleanup.generateCleanupReport(projectPath);
    console.log('✅ Legacy cleanup completed\n');

    // Step 2: Optimize remaining styles
    console.log('⚡ Step 2: Optimizing remaining styles...');
    const styleOptimizer = new StyleOptimizer();
    styleOptimizer.runOptimizations(projectPath);
    console.log('✅ Style optimization completed\n');

    // Step 3: Final optimization
    console.log('🎯 Step 3: Final optimization...');
    const finalOptimizer = new FinalOptimizer();
    const finalResults = finalOptimizer.runFinalOptimization(projectPath);
    console.log('✅ Final optimization completed\n');

    // Success summary
    console.log('🎉 BlogPro Legacy Cleanup COMPLETED SUCCESSFULLY!\n');
    console.log('📊 Cleanup Summary:');
    console.log(`   Files removed: ${cleanupResults.removed}`);
    console.log(`   Files preserved: ${cleanupResults.preserved}`);
    console.log(`   Space reclaimed: ${(cleanupResults.sizeReclaimed / 1024).toFixed(2)} KB`);
    console.log(`   Optimizations applied: ${finalResults.optimizations}`);
    
    console.log('\n📋 Generated Reports:');
    console.log('   - LEGACY_CLEANUP_REPORT.md');
    console.log('   - MIGRATION_SUCCESS_REPORT.md');
    
    console.log('\n✅ Next Steps:');
    console.log('   1. Test your application thoroughly');
    console.log('   2. Verify all pages render correctly');
    console.log('   3. Check that UI System components work as expected');
    console.log('   4. Deploy to production when ready');
    
    console.log('\n🎉 BlogPro UI System migration is now complete!');

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.log('\n💡 If cleanup failed:');
    console.log('   1. Restore from backup');
    console.log('   2. Check file permissions');
    console.log('   3. Run dry-run mode first: node tools/legacy-cleanup.js');
    process.exit(1);
  }
}

// Run cleanup
executeCleanup().catch(console.error);