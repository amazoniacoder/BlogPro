/**
 * BlogPro Theme Integration Script
 * Integrates light/dark themes with existing components
 */

const fs = require('fs').promises;
const path = require('path');

async function integrateThemes() {
  console.log('🎨 Starting theme integration...');
  
  const srcPath = path.resolve(__dirname, '..', '..');
  
  // Create theme integration CSS
  const themeIntegrationCSS = `/* Theme Integration Layer */
@import '../../ui-system/tokens/colors.css';

/* Apply UI system theme variables to existing components */
:root {
  /* Map existing variables to UI system */
  --color-primary: var(--primary-500);
  --color-primary-dark: var(--primary-600);
  --color-primary-light: var(--primary-50);
  --color-secondary: var(--gray-500);
  --color-secondary-dark: var(--gray-600);
  --color-error: var(--error-500);
  --color-error-dark: var(--error-600);
  --color-success: var(--success-500);
  --color-warning: var(--warning-500);
  
  /* Background colors */
  --bg-primary: var(--bg-primary);
  --bg-secondary: var(--bg-secondary);
  --color-bg-secondary: var(--bg-alt);
  
  /* Text colors */
  --text-primary: var(--text-primary);
  --color-text: var(--text-primary);
  --text-secondary: var(--text-secondary);
  --text-muted: var(--text-muted);
  
  /* Border colors */
  --border-color: var(--border-color);
  
  /* Shadows */
  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  
  /* Transitions */
  --transition-fast: var(--transition-base);
  --transition-colors: var(--transition-colors);
}

/* Ensure theme switching works with existing components */
.dark {
  /* Dark theme is handled by UI system tokens */
}

/* Theme toggle integration */
.theme-toggle {
  /* Use UI system button styles */
  composes: bp-button from '../../ui-system/components/button/button.css';
  composes: button--variant-ghost from '../../ui-system/components/button/button.css';
}`;
  
  const themeIntegrationPath = path.join(srcPath, 'styles', 'base', 'theme-integration.css');
  await fs.writeFile(themeIntegrationPath, themeIntegrationCSS);
  
  // Update main CSS to include theme integration
  const mainCSSPath = path.join(srcPath, 'styles', 'main.css');
  let mainCSS = await fs.readFile(mainCSSPath, 'utf8');
  
  if (!mainCSS.includes('theme-integration.css')) {
    mainCSS = mainCSS.replace(
      '@import \'./base/global.css\';',
      '@import \'./base/global.css\';\n@import \'./base/theme-integration.css\';'
    );
    await fs.writeFile(mainCSSPath, mainCSS);
  }
  
  console.log('✅ Theme integration completed');
}

integrateThemes().catch(console.error);