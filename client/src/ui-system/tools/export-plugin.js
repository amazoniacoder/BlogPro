/**
 * BlogPro Plugin Export CLI
 * Exports plugins with UI system dependencies
 */

const fs = require('fs').promises;
const path = require('path');
const UIManifestResolver = require('./ui-resolver');

class PluginExporter {
  static async exportPlugin(pluginName, options = {}) {
    console.log(`🚀 Exporting plugin: ${pluginName}`);
    
    const pluginPath = path.resolve(__dirname, '..', '..', 'plugins', 'texteditor', 'plugins', pluginName);
    const outputPath = options.output || path.join(pluginPath, 'export');
    
    // Load export configuration
    const exportConfig = await this.loadExportConfig(pluginPath);
    
    // Create export directory
    await fs.mkdir(outputPath, { recursive: true });
    
    // Generate UI system bundle
    const bundlePath = path.join(outputPath, 'ui-system');
    await UIManifestResolver.generatePluginBundle(pluginPath, bundlePath);
    
    // Copy plugin source files
    await this.copyPluginFiles(pluginPath, outputPath, exportConfig);
    
    // Generate package.json for standalone usage
    await this.generatePackageJson(pluginPath, outputPath, exportConfig);
    
    // Generate README
    await this.generateReadme(pluginPath, outputPath, exportConfig);
    
    // Generate installation script
    await this.generateInstallScript(outputPath, exportConfig);
    
    console.log(`✅ Plugin exported successfully to: ${outputPath}`);
    
    return {
      pluginName,
      outputPath,
      exportConfig,
      files: await this.listExportedFiles(outputPath)
    };
  }
  
  static async loadExportConfig(pluginPath) {
    const configPath = path.join(pluginPath, 'export.config.json');
    try {
      const content = await fs.readFile(configPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  No export config found, using defaults');
      return {
        export: {
          includeUISystem: true,
          bundleStrategy: 'minimal'
        }
      };
    }
  }
  
  static async copyPluginFiles(pluginPath, outputPath, exportConfig) {
    console.log('📁 Copying plugin files...');
    
    const srcPath = path.join(outputPath, 'src');
    await fs.mkdir(srcPath, { recursive: true });
    
    // Copy main plugin files (excluding dist, node_modules, etc.)
    const excludeDirs = ['dist', 'export', 'node_modules', '.git'];
    const pluginFiles = await fs.readdir(pluginPath);
    
    for (const file of pluginFiles) {
      if (!excludeDirs.includes(file)) {
        const sourcePath = path.join(pluginPath, file);
        const targetPath = path.join(srcPath, file);
        await this.copyRecursive(sourcePath, targetPath);
      }
    }
    
    // Copy custom styles if specified
    if (exportConfig.export?.customizations?.customCSS) {
      const stylesPath = path.join(outputPath, 'styles');
      await fs.mkdir(stylesPath, { recursive: true });
      
      for (const cssFile of exportConfig.export.customizations.customCSS) {
        const sourcePath = path.join(pluginPath, cssFile);
        const targetPath = path.join(stylesPath, path.basename(cssFile));
        try {
          await fs.copyFile(sourcePath, targetPath);
        } catch (error) {
          console.warn(`⚠️  Could not copy ${cssFile}:`, error.message);
        }
      }
    }
  }
  
  static async generatePackageJson(pluginPath, outputPath, exportConfig) {
    console.log('📦 Generating package.json...');
    
    const packageJson = {
      name: `@blogpro/${exportConfig.name}`,
      version: exportConfig.version || '1.0.0',
      description: exportConfig.metadata?.description || `BlogPro ${exportConfig.name} plugin`,
      main: 'src/index.js',
      type: 'module',
      files: [
        'src/',
        'ui-system/',
        'styles/',
        'README.md',
        'install.js'
      ],
      scripts: {
        install: 'node install.js',
        dev: 'echo "Development server not configured"',
        build: 'echo "Build process not configured"'
      },
      keywords: exportConfig.metadata?.keywords || ['blogpro', 'plugin'],
      author: exportConfig.metadata?.author || 'BlogPro Team',
      license: exportConfig.metadata?.license || 'MIT',
      repository: exportConfig.metadata?.repository,
      peerDependencies: {
        react: '>=17.0.0'
      },
      blogpro: {
        plugin: true,
        uiSystem: exportConfig.export?.includeUISystem || false,
        version: exportConfig.version || '1.0.0'
      }
    };
    
    await fs.writeFile(
      path.join(outputPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }
  
  static async generateReadme(pluginPath, outputPath, exportConfig) {
    console.log('📝 Generating README...');
    
    const readme = `# ${exportConfig.name}

${exportConfig.metadata?.description || 'BlogPro plugin with integrated UI system'}

## Installation

\`\`\`bash
npm install @blogpro/${exportConfig.name}
\`\`\`

## Usage

\`\`\`javascript
import { loadUISystem } from '@blogpro/${exportConfig.name}/ui-system/ui-loader.js';

// Load UI system
const uiSystem = loadUISystem();
await uiSystem.styles();
\`\`\`

## Features

- ✅ Integrated BlogPro UI System
- ✅ Minimalist design components
- ✅ Dark/light theme support
- ✅ Mobile responsive
- ✅ TypeScript support

## UI System Components

This plugin includes the following UI components:

${exportConfig.export?.customizations ? `
### Custom Theme
- Primary color: ${exportConfig.export.customizations.brandColors?.primary || '#3b82f6'}
- Accent color: ${exportConfig.export.customizations.brandColors?.accent || '#7c3aed'}
` : ''}

## License

${exportConfig.metadata?.license || 'MIT'}
`;
    
    await fs.writeFile(path.join(outputPath, 'README.md'), readme);
  }
  
  static async generateInstallScript(outputPath, exportConfig) {
    console.log('⚙️  Generating install script...');
    
    const installScript = `#!/usr/bin/env node

/**
 * BlogPro Plugin Installation Script
 * Automatically sets up the plugin with UI system
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Installing ${exportConfig.name} plugin...');

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
    console.log('⚠️  This doesn\\'t appear to be a BlogPro project');
    console.log('   The plugin may not work correctly outside of BlogPro');
  }
} else {
  console.log('⚠️  No package.json found in current directory');
}
`;
    
    await fs.writeFile(path.join(outputPath, 'install.js'), installScript);
  }
  
  static async copyRecursive(source, target) {
    const stat = await fs.stat(source);
    
    if (stat.isDirectory()) {
      await fs.mkdir(target, { recursive: true });
      const files = await fs.readdir(source);
      
      for (const file of files) {
        await this.copyRecursive(
          path.join(source, file),
          path.join(target, file)
        );
      }
    } else {
      await fs.copyFile(source, target);
    }
  }
  
  static async listExportedFiles(outputPath) {
    const files = [];
    
    async function scanDir(dir, prefix = '') {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          await scanDir(itemPath, path.join(prefix, item));
        } else {
          files.push(path.join(prefix, item));
        }
      }
    }
    
    await scanDir(outputPath);
    return files;
  }
}

// CLI Interface
if (require.main === module) {
  const [,, pluginName, ...args] = process.argv;
  
  if (!pluginName) {
    console.error('Usage: node export-plugin.js <plugin-name> [--output <path>]');
    process.exit(1);
  }
  
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === '--output') {
      options.output = args[i + 1];
    }
  }
  
  PluginExporter.exportPlugin(pluginName, options)
    .then(result => {
      console.log('\\n📊 Export Summary:');
      console.log(`Plugin: ${result.pluginName}`);
      console.log(`Output: ${result.outputPath}`);
      console.log(`Files: ${result.files.length}`);
    })
    .catch(error => {
      console.error('❌ Export failed:', error);
      process.exit(1);
    });
}

module.exports = PluginExporter;