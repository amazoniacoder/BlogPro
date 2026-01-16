/**
 * BlogPro Button Migration Script - Simple Version
 */

const fs = require('fs').promises;
const path = require('path');

async function migrateButtons() {
  console.log('🔄 Starting button migration...');
  
  const srcPath = path.resolve(__dirname, '..', '..');
  
  // Create compatibility CSS
  const compatCSS = `/* Button Compatibility Layer */
@import '../../ui-system/components/button/index.css';

.button {
  composes: bp-button from '../../ui-system/components/button/button.css';
}

.button--primary {
  composes: button--variant-primary from '../../ui-system/components/button/button.css';
}

.button--secondary {
  composes: button--variant-secondary from '../../ui-system/components/button/button.css';
}

.button--outline {
  composes: button--variant-outline from '../../ui-system/components/button/button.css';
}

.button--ghost {
  composes: button--variant-ghost from '../../ui-system/components/button/button.css';
}

.button--danger {
  composes: button--variant-danger from '../../ui-system/components/button/button.css';
}

.button--sm {
  composes: button--size-sm from '../../ui-system/components/button/button.css';
}

.button--lg {
  composes: button--size-lg from '../../ui-system/components/button/button.css';
}

.button--full {
  composes: button--full-width from '../../ui-system/components/button/button.css';
}`;
  
  const compatPath = path.join(srcPath, 'styles', 'blocks', 'button', 'button-compat.css');
  await fs.writeFile(compatPath, compatCSS);
  
  console.log('✅ Migration completed');
}

migrateButtons().catch(console.error);