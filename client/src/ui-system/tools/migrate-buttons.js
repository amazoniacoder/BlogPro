/**
 * BlogPro Button Migration Script
 * Migrates existing button components to UI system
 */

const fs = require('fs').promises;
const path = require('path');

class ButtonMigrator {
  static async migrateButtons() {
    console.log('🔄 Starting button migration to UI system...');
    
    const srcPath = path.resolve(__dirname, '..', '..');
    
    // Step 1: Update button component to use UI system
    await this.updateButtonComponent(srcPath);
    
    // Step 2: Create compatibility layer
    await this.createCompatibilityLayer(srcPath);
    
    // Step 3: Update main CSS imports
    await this.updateMainCSS(srcPath);
    
    // Step 4: Generate migration report
    const report = await this.generateMigrationReport(srcPath);
    
    console.log('✅ Button migration completed!');
    return report;
  }
  
  static async updateButtonComponent(srcPath) {
    console.log('📝 Updating button component...');
    
    const buttonComponentPath = path.join(srcPath, 'components', 'common', 'button.tsx');
    
    const newButtonComponent = `import React from 'react';
import { Link } from 'wouter';
import { Button as UIButton, type ButtonProps as UIButtonProps } from '../../ui-system/components';

// Legacy compatibility - map old props to new UI system
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  href,
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  // Map legacy classes to new UI system classes
  const legacyClasses = [
    'button', // Keep for backward compatibility
    \`button--\${variant}\`,
    size !== 'md' ? \`button--\${size}\` : '',
    fullWidth ? 'button--full' : '',
    className
  ].filter(Boolean).join(' ');

  if (href) {
    return (
      <Link href={href} className={legacyClasses}>
        {iconPosition === 'left' && icon && (
          <span className="button__icon">{icon}</span>
        )}
        {children}
        {iconPosition === 'right' && icon && (
          <span className="button__icon button__icon--right">{icon}</span>
        )}
      </Link>
    );
  }

  return (
    <UIButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={legacyClasses}
      {...props}
    >
      {iconPosition === 'left' && icon && (
        <span className="button__icon">{icon}</span>
      )}
      {children}
      {iconPosition === 'right' && icon && (
        <span className="button__icon button__icon--right">{icon}</span>
      )}
    </UIButton>
  );
};

// Export UI system button for new code
export { Button as UIButton } from '../../ui-system/components';
export type { ButtonProps as UIButtonProps } from '../../ui-system/components';

export default Button;`;
    
    await fs.writeFile(buttonComponentPath, newButtonComponent);
    console.log('✅ Button component updated');
  }
  
  static async createCompatibilityLayer(srcPath) {
    console.log('🔗 Creating compatibility layer...');
    
    const compatibilityCSS = `/**
 * BlogPro Button Compatibility Layer
 * Bridges old button styles with new UI system
 */

/* Import UI system button styles */
@import '../../ui-system/components/button/index.css';

/* Legacy button class mapping */
.button {
  /* Map to UI system classes */
  @extend .button;
}

.button--primary {
  @extend .button--variant-primary;
}

.button--secondary {
  @extend .button--variant-secondary;
}

.button--outline {
  @extend .button--variant-outline;
}

.button--ghost {
  @extend .button--variant-ghost;
}

.button--danger {
  @extend .button--variant-danger;
}

.button--sm {
  @extend .button--size-sm;
}

.button--lg {
  @extend .button--size-lg;
}

.button--full {
  @extend .button--full-width;
}

.button__icon {
  @extend .button__icon;
}

.button__icon--right {
  @extend .button__icon--right;
}

/* Legacy .btn class support */
.btn {
  @extend .button;
}

.btn--primary {
  @extend .button--variant-primary;
}

.btn--secondary {
  @extend .button--variant-secondary;
}

.btn--outline {
  @extend .button--variant-outline;
}

.btn--ghost {
  @extend .button--variant-ghost;
}

.btn--danger {
  @extend .button--variant-danger;
}

.btn--sm {
  @extend .button--size-sm;
}

.btn--lg {
  @extend .button--size-lg;
}

.btn--full {
  @extend .button--full-width;
}

.btn__icon {
  @extend .button__icon;
}

.btn__icon--right {
  @extend .button__icon--right;
}`;
    
    const compatibilityPath = path.join(srcPath, 'styles', 'blocks', 'button', 'button-compatibility.css');
    await fs.writeFile(compatibilityPath, compatibilityCSS);
    console.log('✅ Compatibility layer created');
  }
  
  static async updateMainCSS(srcPath) {
    console.log('📄 Updating main CSS imports...');
    
    const mainCSSPath = path.join(srcPath, 'styles', 'main.css');
    
    try {
      let mainCSS = await fs.readFile(mainCSSPath, 'utf8');
      
      // Add UI system import at the top
      if (!mainCSS.includes('@import \'../ui-system/index.css\';')) {
        mainCSS = `/* BlogPro UI System */
@import '../ui-system/index.css';

${mainCSS}`;
      }
      
      // Replace old button import with compatibility layer
      mainCSS = mainCSS.replace(
        /@import ['"].*blocks\/button\/button\.css['"];?/g,
        '@import \'./blocks/button/button-compatibility.css\';'
      );
      
      await fs.writeFile(mainCSSPath, mainCSS);
      console.log('✅ Main CSS updated');
    } catch (error) {
      console.warn('⚠️  Could not update main.css:', error.message);
    }
  }
  
  static async generateMigrationReport(srcPath) {
    console.log('📊 Generating migration report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      migratedComponents: [
        'components/common/button.tsx'
      ],
      createdFiles: [
        'styles/blocks/button/button-compatibility.css'
      ],
      modifiedFiles: [
        'styles/main.css'
      ],
      backwardCompatibility: {
        legacyClasses: ['.btn', '.button'],
        legacyModifiers: [
          '.btn--primary', '.btn--secondary', '.btn--outline', 
          '.btn--ghost', '.btn--danger', '.btn--sm', '.btn--lg', '.btn--full'
        ],
        newClasses: ['.button'],
        newModifiers: [
          '.button--variant-primary', '.button--variant-secondary',
          '.button--variant-outline', '.button--variant-ghost',
          '.button--variant-danger', '.button--size-sm',
          '.button--size-lg', '.button--full-width'
        ]
      },
      benefits: [
        'Unified design system',
        'Improved consistency',
        'Better maintainability',
        'Backward compatibility maintained',
        'Minimalist design applied'
      ],
      nextSteps: [
        'Test button functionality across all pages',
        'Update any custom button styles',
        'Gradually migrate to new UI system classes',
        'Remove legacy classes in future version'
      ]
    };
    
    const reportPath = path.join(srcPath, 'ui-system', 'migration-reports', 'button-migration.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📋 Migration report saved to:', reportPath);
    return report;
  }
}

// CLI Interface
if (require.main === module) {
  ButtonMigrator.migrateButtons()
    .then(report => {
      console.log('\\n🎉 Button Migration Summary:');
      console.log(\`✅ Migrated: \${report.migratedComponents.length} components\`);
      console.log(\`📁 Created: \${report.createdFiles.length} files\`);
      console.log(\`📝 Modified: \${report.modifiedFiles.length} files\`);
      console.log(\`🔄 Legacy classes: \${report.backwardCompatibility.legacyClasses.length} supported\`);
    })
    .catch(error => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = ButtonMigrator;