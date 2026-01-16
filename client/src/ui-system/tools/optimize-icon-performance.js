/**
 * BlogPro Icon Performance Optimization
 * Optimizes icon loading and reduces bundle size
 */

const fs = require('fs').promises;
const path = require('path');

async function optimizeIconPerformance() {
  console.log('⚡ Starting icon performance optimization...');
  
  // 1. Generate optimized sprite with only used icons
  await generateOptimizedSprite();
  
  // 2. Create icon preload hints
  await createIconPreloadHints();
  
  // 3. Generate icon usage report
  const report = await generateIconUsageReport();
  
  console.log('✅ Icon performance optimization completed');
  return report;
}

async function generateOptimizedSprite() {
  console.log('📦 Generating optimized sprite...');
  
  const iconsPath = path.resolve(__dirname, '..', 'icons');
  const manifestPath = path.join(iconsPath, 'dist', 'manifest.json');
  
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  
  // Create minimal sprite with only frequently used icons
  const coreIcons = ['save', 'edit', 'delete', 'add', 'search', 'user', 'login', 'logout', 'admin', 'x'];
  
  let minimalSprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n';
  
  for (const icon of manifest.icons) {
    if (coreIcons.includes(icon.name)) {
      const iconPath = path.join(iconsPath, 'src', 'svg', icon.category, `${icon.name}.svg`);
      const iconContent = await fs.readFile(iconPath, 'utf8');
      const svgContent = iconContent.match(/<svg[^>]*>(.*?)<\/svg>/s)[1];
      
      minimalSprite += `  <symbol id="bp-icon-${icon.name}" viewBox="0 0 24 24">\n`;
      minimalSprite += `    ${svgContent.trim()}\n`;
      minimalSprite += `  </symbol>\n`;
    }
  }
  
  minimalSprite += '</svg>';
  
  await fs.writeFile(path.join(iconsPath, 'dist', 'sprite-minimal.svg'), minimalSprite);
  console.log('✅ Minimal sprite generated');
}

async function createIconPreloadHints() {
  console.log('🚀 Creating icon preload hints...');
  
  const preloadHints = `<!-- Icon Preload Hints -->
<link rel="preload" href="/ui-system/icons/dist/sprite-minimal.svg" as="image" type="image/svg+xml">
<link rel="modulepreload" href="/ui-system/icons/components/Icon.js">

<!-- Critical icons for above-the-fold content -->
<style>
  .icon-preload {
    content: url('/ui-system/icons/dist/sprite-minimal.svg#bp-icon-user');
    content: url('/ui-system/icons/dist/sprite-minimal.svg#bp-icon-search');
    content: url('/ui-system/icons/dist/sprite-minimal.svg#bp-icon-hamburger');
    position: absolute;
    left: -9999px;
    top: -9999px;
  }
</style>`;
  
  const preloadPath = path.resolve(__dirname, '..', 'icons', 'preload-hints.html');
  await fs.writeFile(preloadPath, preloadHints);
  console.log('✅ Preload hints created');
}

async function generateIconUsageReport() {
  console.log('📊 Generating icon usage report...');
  
  const srcPath = path.resolve(__dirname, '..', '..');
  const iconUsage = new Map();
  
  // Scan all files for icon usage
  await scanForIconUsage(srcPath, iconUsage);
  
  const report = {
    timestamp: new Date().toISOString(),
    totalIcons: 24,
    usedIcons: iconUsage.size,
    unusedIcons: 24 - iconUsage.size,
    usageByIcon: Object.fromEntries(
      Array.from(iconUsage.entries()).sort((a, b) => b[1] - a[1])
    ),
    recommendations: [
      'Consider lazy loading for rarely used icons',
      'Preload critical icons for better performance',
      'Remove unused icons from sprite in production'
    ]
  };
  
  const reportPath = path.resolve(__dirname, '..', 'migration-reports', 'icon-performance-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📋 Usage report: ${iconUsage.size}/24 icons used`);
  return report;
}

async function scanForIconUsage(basePath, iconUsage) {
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
        } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.js')) {
          await scanFileForIcons(itemPath, iconUsage);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  await scanDirectory(basePath);
}

async function scanFileForIcons(filePath, iconUsage) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Look for Icon component usage
    const iconMatches = content.match(/name="([^"]+)"/g);
    if (iconMatches) {
      for (const match of iconMatches) {
        const iconName = match.match(/name="([^"]+)"/)[1];
        iconUsage.set(iconName, (iconUsage.get(iconName) || 0) + 1);
      }
    }
    
    // Look for sprite references
    const spriteMatches = content.match(/#bp-icon-([^"')\s]+)/g);
    if (spriteMatches) {
      for (const match of spriteMatches) {
        const iconName = match.replace('#bp-icon-', '');
        iconUsage.set(iconName, (iconUsage.get(iconName) || 0) + 1);
      }
    }
  } catch (error) {
    // Skip files we can't read
  }
}

optimizeIconPerformance().catch(console.error);