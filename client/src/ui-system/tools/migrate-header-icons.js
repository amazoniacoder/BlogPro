/**
 * BlogPro Header Icon Migration
 * Replaces inline SVGs in header with Icon components
 */

const fs = require('fs').promises;
const path = require('path');

async function migrateHeaderIcons() {
  console.log('🎨 Migrating header icons...');
  
  const headerPath = path.resolve(__dirname, '..', '..', 'components', 'layout', 'header.tsx');
  
  let content = await fs.readFile(headerPath, 'utf8');
  
  // Add Icon import
  if (!content.includes('import { Icon }')) {
    content = content.replace(
      'import { DynamicMenu } from "../menu/DynamicMenu";',
      'import { DynamicMenu } from "../menu/DynamicMenu";\nimport { Icon } from "../../ui-system/icons/components";'
    );
  }
  
  // Replace login SVG
  content = content.replace(
    /<svg[^>]*>\s*<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"><\/path>\s*<polyline points="10 17 15 12 10 7"><\/polyline>\s*<line x1="15" y1="12" x2="3" y2="12"><\/line>\s*<\/svg>/gs,
    '<Icon name="login" size={20} />'
  );
  
  // Replace admin SVG
  content = content.replace(
    /<svg[^>]*>\s*<rect x="3" y="3" width="7" height="7"><\/rect>\s*<rect x="14" y="3" width="7" height="7"><\/rect>\s*<rect x="14" y="14" width="7" height="7"><\/rect>\s*<rect x="3" y="14" width="7" height="7"><\/rect>\s*<\/svg>/gs,
    '<Icon name="admin" size={20} />'
  );
  
  // Replace user SVG
  content = content.replace(
    /<svg[^>]*>\s*<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"><\/path>\s*<circle cx="12" cy="7" r="4"><\/circle>\s*<\/svg>/gs,
    '<Icon name="user" size={20} />'
  );
  
  // Replace logout SVG
  content = content.replace(
    /<svg[^>]*>\s*<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"><\/path>\s*<polyline points="16 17 21 12 16 7"><\/polyline>\s*<line x1="21" y1="12" x2="9" y2="12"><\/line>\s*<\/svg>/gs,
    '<Icon name="logout" size={20} />'
  );
  
  await fs.writeFile(headerPath, content);
  
  console.log('✅ Header icons migrated');
}

migrateHeaderIcons().catch(console.error);