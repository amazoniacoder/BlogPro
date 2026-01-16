/**
 * BlogPro UI Manifest Resolver
 * Resolves plugin UI dependencies and generates minimal bundles
 */

const fs = require('fs').promises;
const path = require('path');

class UIManifestResolver {
  static async resolvePluginDependencies(manifestPath) {
    console.log(`🔍 Resolving UI dependencies for: ${manifestPath}`);
    
    try {
      const manifest = await this.loadManifest(manifestPath);
      const uiSystemPath = path.resolve(__dirname, '..');
      
      const resolvedDependencies = {
        tokens: [],
        components: [],
        icons: [],
        patterns: []
      };
      
      // Resolve tokens
      for (const token of manifest.uiSystem.dependencies.tokens || []) {
        const tokenPath = path.join(uiSystemPath, 'tokens', `${token}.css`);
        if (await this.fileExists(tokenPath)) {
          resolvedDependencies.tokens.push({
            name: token,
            path: tokenPath,
            relativePath: `tokens/${token}.css`
          });
        }
      }
      
      // Resolve components
      for (const component of manifest.uiSystem.dependencies.components || []) {
        const componentPath = path.join(uiSystemPath, 'components', component);
        if (await this.directoryExists(componentPath)) {
          resolvedDependencies.components.push({
            name: component,
            path: componentPath,
            relativePath: `components/${component}`,
            cssPath: path.join(componentPath, 'index.css'),
            tsPath: path.join(componentPath, 'index.ts')
          });
        }
      }
      
      // Resolve icons
      const iconManifest = await this.loadIconManifest(uiSystemPath);
      for (const iconName of manifest.uiSystem.dependencies.icons || []) {
        const icon = iconManifest.icons.find(i => i.name === iconName);
        if (icon) {
          resolvedDependencies.icons.push({
            name: iconName,
            category: icon.category,
            path: icon.path,
            relativePath: `icons/src/svg/${icon.category}/${iconName}.svg`
          });
        }
      }
      
      // Resolve patterns (placeholder for future implementation)
      for (const pattern of manifest.uiSystem.dependencies.patterns || []) {
        const patternPath = path.join(uiSystemPath, 'patterns', pattern);
        if (await this.directoryExists(patternPath)) {
          resolvedDependencies.patterns.push({
            name: pattern,
            path: patternPath,
            relativePath: `patterns/${pattern}`
          });
        }
      }
      
      console.log(`✅ Resolved dependencies:`, {
        tokens: resolvedDependencies.tokens.length,
        components: resolvedDependencies.components.length,
        icons: resolvedDependencies.icons.length,
        patterns: resolvedDependencies.patterns.length
      });
      
      return {
        manifest,
        dependencies: resolvedDependencies,
        bundleSize: await this.calculateBundleSize(resolvedDependencies)
      };
      
    } catch (error) {
      console.error('❌ Failed to resolve dependencies:', error);
      throw error;
    }
  }
  
  static async generatePluginBundle(pluginPath, outputPath) {
    console.log(`📦 Generating plugin bundle for: ${pluginPath}`);
    
    const manifestPath = path.join(pluginPath, 'ui-manifest.json');
    const resolved = await this.resolvePluginDependencies(manifestPath);
    
    // Create output directory
    await fs.mkdir(outputPath, { recursive: true });
    
    // Generate minimal CSS bundle
    const cssBundle = await this.generateCSSBundle(resolved.dependencies);
    await fs.writeFile(path.join(outputPath, 'ui-system.css'), cssBundle);
    
    // Generate icon sprite with only required icons
    const iconSprite = await this.generateIconSprite(resolved.dependencies.icons);
    await fs.writeFile(path.join(outputPath, 'icons.svg'), iconSprite);
    
    // Generate TypeScript definitions
    const typeDefinitions = await this.generateTypeDefinitions(resolved.dependencies);
    await fs.writeFile(path.join(outputPath, 'ui-system.d.ts'), typeDefinitions);
    
    // Generate plugin loader
    const loader = await this.generatePluginLoader(resolved);
    await fs.writeFile(path.join(outputPath, 'ui-loader.js'), loader);
    
    // Generate manifest summary
    const summary = {
      plugin: resolved.manifest.name,
      version: resolved.manifest.version,
      uiSystemVersion: resolved.manifest.uiSystem.version,
      bundleSize: resolved.bundleSize,
      dependencies: {
        tokens: resolved.dependencies.tokens.map(t => t.name),
        components: resolved.dependencies.components.map(c => c.name),
        icons: resolved.dependencies.icons.map(i => i.name),
        patterns: resolved.dependencies.patterns.map(p => p.name)
      },
      generatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(outputPath, 'bundle-manifest.json'), 
      JSON.stringify(summary, null, 2)
    );
    
    console.log(`🎉 Plugin bundle generated successfully!`);
    console.log(`📊 Bundle size: ${Math.round(resolved.bundleSize / 1024)}KB`);
    
    return summary;
  }
  
  static async generateCSSBundle(dependencies) {
    let cssContent = '/* BlogPro UI System - Plugin Bundle */\n\n';
    
    // Add tokens
    for (const token of dependencies.tokens) {
      const content = await fs.readFile(token.path, 'utf8');
      cssContent += `/* Token: ${token.name} */\n${content}\n\n`;
    }
    
    // Add components
    for (const component of dependencies.components) {
      if (await this.fileExists(component.cssPath)) {
        const content = await fs.readFile(component.cssPath, 'utf8');
        cssContent += `/* Component: ${component.name} */\n${content}\n\n`;
      }
    }
    
    return cssContent;
  }
  
  static async generateIconSprite(icons) {
    const uiSystemPath = path.resolve(__dirname, '..');
    const symbols = [];
    
    for (const icon of icons) {
      const iconPath = path.join(uiSystemPath, 'icons', 'src', 'svg', icon.category, `${icon.name}.svg`);
      if (await this.fileExists(iconPath)) {
        const content = await fs.readFile(iconPath, 'utf8');
        const svgContent = this.extractSVGContent(content);
        symbols.push(`  <symbol id="bp-icon-${icon.name}" viewBox="0 0 24 24">
    ${svgContent}
  </symbol>`);
      }
    }
    
    return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
${symbols.join('\n')}
</svg>`;
  }
  
  static async generateTypeDefinitions(dependencies) {
    let typeContent = '/* BlogPro UI System - Plugin Types */\n\n';
    
    // Icon names type
    const iconNames = dependencies.icons.map(i => `'${i.name}'`).join(' | ');
    typeContent += `export type IconName = ${iconNames};\n\n`;
    
    // Component exports
    for (const component of dependencies.components) {
      typeContent += `export * from './components/${component.name}';\n`;
    }
    
    return typeContent;
  }
  
  static async generatePluginLoader(resolved) {
    const { manifest, dependencies } = resolved;
    
    return `/**
 * BlogPro UI System Loader
 * Generated for plugin: ${manifest.name}
 */

export const loadUISystem = () => {
  return {
    // CSS Bundle
    styles: () => import('./ui-system.css'),
    
    // Icon Sprite
    icons: () => import('./icons.svg'),
    
    // Component Dependencies
    components: {
${dependencies.components.map(c => `      ${c.name}: () => import('./components/${c.name}')`).join(',\n')}
    },
    
    // Token Dependencies
    tokens: {
${dependencies.tokens.map(t => `      ${t.name}: () => import('./tokens/${t.name}.css')`).join(',\n')}
    }
  };
};

// Plugin Metadata
export const pluginInfo = {
  name: '${manifest.name}',
  version: '${manifest.version}',
  uiSystemVersion: '${manifest.uiSystem.version}',
  bundleSize: ${resolved.bundleSize}
};
`;
  }
  
  static async loadManifest(manifestPath) {
    const content = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(content);
  }
  
  static async loadIconManifest(uiSystemPath) {
    const manifestPath = path.join(uiSystemPath, 'icons', 'dist', 'manifest.json');
    const content = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(content);
  }
  
  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  static async directoryExists(dirPath) {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }
  
  static extractSVGContent(svgString) {
    const match = svgString.match(/<svg[^>]*>(.*?)<\/svg>/s);
    return match ? match[1].trim() : '';
  }
  
  static async calculateBundleSize(dependencies) {
    let totalSize = 0;
    
    // Calculate token sizes
    for (const token of dependencies.tokens) {
      if (await this.fileExists(token.path)) {
        const stat = await fs.stat(token.path);
        totalSize += stat.size;
      }
    }
    
    // Calculate component sizes
    for (const component of dependencies.components) {
      if (await this.fileExists(component.cssPath)) {
        const stat = await fs.stat(component.cssPath);
        totalSize += stat.size;
      }
    }
    
    return totalSize;
  }
}

// CLI Interface
if (require.main === module) {
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'resolve':
      const manifestPath = args[0];
      if (!manifestPath) {
        console.error('Usage: node ui-resolver.js resolve <manifest-path>');
        process.exit(1);
      }
      UIManifestResolver.resolvePluginDependencies(manifestPath)
        .then(result => console.log(JSON.stringify(result, null, 2)))
        .catch(error => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    case 'bundle':
      const [pluginPath, outputPath] = args;
      if (!pluginPath || !outputPath) {
        console.error('Usage: node ui-resolver.js bundle <plugin-path> <output-path>');
        process.exit(1);
      }
      UIManifestResolver.generatePluginBundle(pluginPath, outputPath)
        .then(summary => console.log('Bundle generated:', summary))
        .catch(error => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Available commands:');
      console.log('  resolve <manifest-path>     - Resolve plugin dependencies');
      console.log('  bundle <plugin-path> <output-path> - Generate plugin bundle');
  }
}

module.exports = UIManifestResolver;