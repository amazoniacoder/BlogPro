/**
 * BlogPro Icon Build System
 * Generates SVG sprite and optimizes icons
 */

const fs = require('fs').promises;
const path = require('path');

class IconBuilder {
  static async buildIconSystem() {
    console.log('🎨 Building BlogPro Icon System...');
    
    try {
      const iconsDir = path.join(__dirname, '../icons/src/svg');
      const distDir = path.join(__dirname, '../icons/dist');
      
      // Ensure dist directory exists
      await fs.mkdir(distDir, { recursive: true });
      
      // Scan all SVG files
      const icons = await this.scanIcons(iconsDir);
      console.log(`📦 Found ${icons.length} icons`);
      
      // Generate SVG sprite
      const sprite = await this.generateSprite(icons);
      await fs.writeFile(path.join(distDir, 'sprite.svg'), sprite);
      console.log('✅ Generated sprite.svg');
      
      // Generate icon manifest
      const manifest = {
        icons: icons.map(icon => ({
          name: icon.name,
          category: icon.category,
          path: icon.path
        })),
        generatedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      await fs.writeFile(
        path.join(distDir, 'manifest.json'), 
        JSON.stringify(manifest, null, 2)
      );
      console.log('✅ Generated manifest.json');
      
      console.log('🎉 Icon system build complete!');
      
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }
  
  static async scanIcons(iconsDir) {
    const icons = [];
    const categories = await fs.readdir(iconsDir);
    
    for (const category of categories) {
      const categoryPath = path.join(iconsDir, category);
      const stat = await fs.stat(categoryPath);
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);
        
        for (const file of files) {
          if (file.endsWith('.svg')) {
            const iconPath = path.join(categoryPath, file);
            const content = await fs.readFile(iconPath, 'utf8');
            const name = path.basename(file, '.svg');
            
            icons.push({
              name,
              category,
              path: iconPath,
              content: this.extractSVGContent(content)
            });
          }
        }
      }
    }
    
    return icons;
  }
  
  static extractSVGContent(svgString) {
    // Extract content between <svg> tags
    const match = svgString.match(/<svg[^>]*>(.*?)<\/svg>/s);
    return match ? match[1].trim() : '';
  }
  
  static generateSprite(icons) {
    const symbols = icons.map(icon => 
      `  <symbol id="icon-${icon.name}" viewBox="0 0 24 24">
    ${icon.content}
  </symbol>`
    ).join('\n');
    
    return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
${symbols}
</svg>`;
  }
}

// Run if called directly
if (require.main === module) {
  IconBuilder.buildIconSystem();
}

module.exports = IconBuilder;