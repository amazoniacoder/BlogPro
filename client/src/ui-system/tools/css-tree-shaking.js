/**
 * BlogPro CSS Tree Shaking
 * Removes unused CSS from UI system
 */

const fs = require('fs').promises;
const path = require('path');

async function optimizeCSS() {
  console.log('🌳 Starting CSS tree shaking...');
  
  const srcPath = path.resolve(__dirname, '..', '..');
  
  // Scan for used CSS classes
  const usedClasses = await scanForUsedClasses(srcPath);
  
  // Generate optimized CSS
  await generateOptimizedCSS(usedClasses);
  
  console.log(`✅ CSS optimized: ${usedClasses.size} classes kept`);
}

async function scanForUsedClasses(basePath) {
  const usedClasses = new Set();
  const files = await findFiles(basePath, ['.tsx', '.ts', '.jsx', '.js', '.html']);
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    
    // Find bp- classes
    const matches = content.match(/bp-[\w-]+/g);
    if (matches) {
      matches.forEach(cls => usedClasses.add(cls));
    }
    
    // Find className usage
    const classMatches = content.match(/className="([^"]+)"/g);
    if (classMatches) {
      classMatches.forEach(match => {
        const classes = match.match(/"([^"]+)"/)[1].split(' ');
        classes.forEach(cls => {
          if (cls.startsWith('bp-')) usedClasses.add(cls);
        });
      });
    }
  }
  
  return usedClasses;
}

async function generateOptimizedCSS(usedClasses) {
  const uiSystemPath = path.resolve(__dirname, '..');
  const optimizedCSS = [];
  
  // Always include tokens
  const tokensPath = path.join(uiSystemPath, 'tokens', 'index.css');
  const tokensCSS = await fs.readFile(tokensPath, 'utf8');
  optimizedCSS.push('/* Design Tokens */\n' + tokensCSS);
  
  // Include only used component styles
  const componentsPath = path.join(uiSystemPath, 'components');
  const componentDirs = await fs.readdir(componentsPath);
  
  for (const dir of componentDirs) {
    const componentCSS = path.join(componentsPath, dir, 'index.css');
    try {
      const css = await fs.readFile(componentCSS, 'utf8');
      
      // Check if any classes from this component are used
      const hasUsedClasses = Array.from(usedClasses).some(cls => 
        css.includes(`.${cls}`)
      );
      
      if (hasUsedClasses) {
        optimizedCSS.push(`/* Component: ${dir} */\n${css}`);
      }
    } catch (error) {
      // Skip missing files
    }
  }
  
  const outputPath = path.join(uiSystemPath, 'dist', 'ui-system-optimized.css');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, optimizedCSS.join('\n\n'));
}

async function findFiles(dir, extensions) {
  const files = [];
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = await fs.stat(itemPath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist'].includes(item)) {
      files.push(...await findFiles(itemPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(itemPath);
    }
  }
  
  return files;
}

optimizeCSS().catch(console.error);