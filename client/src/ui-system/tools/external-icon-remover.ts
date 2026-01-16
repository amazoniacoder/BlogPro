/**
 * BlogPro External Icon Dependency Remover
 * Removes external icon libraries and ensures BlogPro icons are used
 */

import { migrateIconName, BLOGPRO_ICON_MAPPING } from './icon-migration';

// Common external icon libraries that should be replaced with BlogPro icons
const EXTERNAL_ICON_LIBRARIES = [
  'font-awesome',
  '@fortawesome/fontawesome',
  'react-icons',
  'heroicons',
  'lucide-react',
  'feather-icons',
  'material-icons',
  '@mui/icons-material'
];

export class ExternalIconRemover {
  private replacements = new Map<string, string>();
  private removedDependencies = new Set<string>();

  // Scan file for external icon usage
  scanFile(content: string, filePath: string): string {
    let updatedContent = content;
    let hasChanges = false;

    // Replace Font Awesome icons with BlogPro equivalents
    updatedContent = updatedContent.replace(
      /className=['"]fa\s+fa-([^'"]+)['"]/g,
      (match, iconName) => {
        const blogProIcon = migrateIconName(iconName);
        if (blogProIcon) {
          hasChanges = true;
          this.replacements.set(match, `name="${blogProIcon}"`);
          console.log(`🔄 ${filePath}: Replaced Font Awesome "${iconName}" with BlogPro "${blogProIcon}"`);
          return `name="${blogProIcon}"`;
        }
        return match;
      }
    );

    // Replace React Icons imports with BlogPro Icon component
    updatedContent = updatedContent.replace(
      /import\s+{\s*([^}]+)\s*}\s+from\s+['"]react-icons\/\w+['"];?/g,
      (_match, _icons) => {
        hasChanges = true;
        this.removedDependencies.add('react-icons');
        console.log(`🔄 ${filePath}: Replaced React Icons import with BlogPro Icon`);
        return `import { Icon } from '@/ui-system/icons/components'; // BlogPro custom icons`;
      }
    );

    // Replace Material Icons with BlogPro equivalents
    updatedContent = updatedContent.replace(
      /<i\s+className=['"]material-icons['"]>([^<]+)<\/i>/g,
      (match, iconName) => {
        const blogProIcon = migrateIconName(iconName);
        if (blogProIcon) {
          hasChanges = true;
          console.log(`🔄 ${filePath}: Replaced Material Icon "${iconName}" with BlogPro "${blogProIcon}"`);
          return `<Icon name="${blogProIcon}" />`;
        }
        return match;
      }
    );

    // Add BlogPro Icon import if we made replacements
    if (hasChanges && !updatedContent.includes('from \'@/ui-system/icons/components\'')) {
      const importStatement = `import { Icon } from '@/ui-system/icons/components'; // BlogPro custom icons\n`;
      updatedContent = importStatement + updatedContent;
    }

    return updatedContent;
  }

  // Generate migration report
  generateMigrationReport(): void {
    console.log('\n🎨 BlogPro Icon Migration Report');
    console.log('================================');
    console.log('Migrating to BlogPro\'s custom icon system\n');

    if (this.replacements.size > 0) {
      console.log('✅ Icon Replacements Made:');
      this.replacements.forEach((replacement, original) => {
        console.log(`   ${original} → ${replacement}`);
      });
    }

    if (this.removedDependencies.size > 0) {
      console.log('\n📦 External Dependencies Removed:');
      this.removedDependencies.forEach(dep => {
        console.log(`   - ${dep} (replaced with BlogPro icons)`);
      });
    }

    console.log('\n💡 BlogPro Icon System Benefits:');
    console.log('   🎨 Custom-designed for BlogPro brand');
    console.log('   📦 No external dependencies');
    console.log('   ⚡ Optimized for performance');
    console.log('   🎯 Perfect theme integration');
    console.log('   ♿ Built-in accessibility');

    console.log('\n📋 Available BlogPro Icon Categories:');
    console.log('   • Navigation: arrows, home, search, menu');
    console.log('   • Actions: add, edit, delete, save');
    console.log('   • Users: user, users, admin');
    console.log('   • Content: image, book, file');
    console.log('   • Themes: sun, moon (for light/dark mode)');
    console.log('   • Tools: gear, wrench, settings');
    console.log('   • Analytics: custom BlogPro analytics icons');
  }

  // Check package.json for external icon dependencies
  checkPackageDependencies(packageJsonPath: string): string[] {
    try {
      const packageJson = require(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const externalIconDeps = EXTERNAL_ICON_LIBRARIES.filter(lib => 
        dependencies[lib] || Object.keys(dependencies).some(dep => dep.includes(lib))
      );

      if (externalIconDeps.length > 0) {
        console.log('\n⚠️  External Icon Dependencies Found:');
        externalIconDeps.forEach(dep => {
          console.log(`   - ${dep} (can be removed - using BlogPro icons instead)`);
        });
        
        console.log('\n💡 To remove external icon dependencies:');
        console.log('   npm uninstall ' + externalIconDeps.join(' '));
      } else {
        console.log('\n✅ No external icon dependencies found - using BlogPro icons only!');
      }

      return externalIconDeps;
    } catch (error) {
      console.warn('⚠️  Could not analyze package.json dependencies');
      return [];
    }
  }
}

// BlogPro icon usage validator
export const validateBlogProIconUsage = (componentContent: string): boolean => {
  const iconUsages = componentContent.match(/name=['"]([^'"]+)['"]/g) || [];
  
  return iconUsages.every(usage => {
    const iconName = usage.match(/name=['"]([^'"]+)['"]/)?.[1];
    return iconName && Object.values(BLOGPRO_ICON_MAPPING).includes(iconName as any);
  });
};

// Generate BlogPro icon documentation
export const generateBlogProIconDocs = (): string => {
  const categories = {
    navigation: ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'house', 'hamburger', 'search'],
    actions: ['add', 'edit', 'delete', 'save', 'x', 'login', 'logout'],
    users: ['user', 'users', 'admin'],
    content: ['image', 'book'],
    themes: ['sun', 'moon', 'cake-icing', 'smile-diamond'],
    tools: ['gear', 'wrench'],
    analytics: ['monkey-running', 'rocket-diamond', 'tree-diamond']
  };

  let docs = '# BlogPro Custom Icon System\n\n';
  docs += 'BlogPro uses a custom-designed icon system optimized for the platform.\n\n';
  
  Object.entries(categories).forEach(([category, icons]) => {
    docs += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Icons\n\n`;
    icons.forEach(icon => {
      docs += `- \`${icon}\` - <Icon name="${icon}" />\n`;
    });
    docs += '\n';
  });

  docs += '## Usage\n\n';
  docs += '```tsx\nimport { Icon } from \'@/ui-system/icons/components\';\n\n';
  docs += '// BlogPro custom icons\n';
  docs += '<Icon name="house" size={24} />\n';
  docs += '<Icon name="search" size={16} />\n';
  docs += '<Icon name="user" size={20} />\n```\n';

  return docs;
};
