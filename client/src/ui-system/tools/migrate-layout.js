/**
 * BlogPro Layout Migration Script
 * Migrates existing layout components to UI system
 */

const fs = require('fs').promises;
const path = require('path');

async function migrateLayout() {
  console.log('🏗️ Starting layout migration...');
  
  const srcPath = path.resolve(__dirname, '..', '..');
  
  // Create layout compatibility CSS
  const layoutCompatCSS = `/* Layout Compatibility Layer */
@import '../../ui-system/components/layout/index.css';

/* Legacy container mapping */
.container {
  composes: bp-container from '../../ui-system/components/layout/container.css';
}

.container--sm {
  composes: container--sm from '../../ui-system/components/layout/container.css';
}

.container--lg {
  composes: container--lg from '../../ui-system/components/layout/container.css';
}

.container--full {
  composes: container--full from '../../ui-system/components/layout/container.css';
}

/* Legacy grid mapping */
.grid {
  composes: bp-grid from '../../ui-system/components/layout/grid.css';
}

.grid--2-cols {
  composes: grid--cols-2 from '../../ui-system/components/layout/grid.css';
}

.grid--3-cols {
  composes: grid--cols-3 from '../../ui-system/components/layout/grid.css';
}

.grid--4-cols {
  composes: grid--cols-4 from '../../ui-system/components/layout/grid.css';
}

.grid--auto-fit {
  composes: grid--auto-fit from '../../ui-system/components/layout/grid.css';
}

/* Legacy header mapping */
.header {
  composes: bp-header from '../../ui-system/components/layout/header.css';
}

.header__container {
  composes: header__container from '../../ui-system/components/layout/header.css';
}

.header__logo {
  composes: header__logo from '../../ui-system/components/layout/header.css';
}

.header__nav {
  composes: header__nav from '../../ui-system/components/layout/header.css';
}

.header__nav-link {
  composes: header__nav-link from '../../ui-system/components/layout/header.css';
}

.header__nav-link--active {
  composes: header__nav-link--active from '../../ui-system/components/layout/header.css';
}

.header__actions {
  composes: header__actions from '../../ui-system/components/layout/header.css';
}

.header__hamburger {
  composes: header__hamburger from '../../ui-system/components/layout/header.css';
}

/* Legacy footer mapping */
.footer {
  composes: bp-footer from '../../ui-system/components/layout/footer.css';
}

.footer__container {
  composes: footer__container from '../../ui-system/components/layout/footer.css';
}

.footer__content {
  composes: footer__content from '../../ui-system/components/layout/footer.css';
}

.footer__section {
  composes: footer__section from '../../ui-system/components/layout/footer.css';
}

.footer__title {
  composes: footer__title from '../../ui-system/components/layout/footer.css';
}

.footer__link {
  composes: footer__link from '../../ui-system/components/layout/footer.css';
}

.footer__bottom {
  composes: footer__bottom from '../../ui-system/components/layout/footer.css';
}`;
  
  const layoutCompatPath = path.join(srcPath, 'styles', 'blocks', 'layout', 'layout-compat.css');
  await fs.mkdir(path.dirname(layoutCompatPath), { recursive: true });
  await fs.writeFile(layoutCompatPath, layoutCompatCSS);
  
  console.log('✅ Layout migration completed');
}

migrateLayout().catch(console.error);