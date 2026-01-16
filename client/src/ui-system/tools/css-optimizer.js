/**
 * BlogPro CSS Optimizer
 * CSS optimization and duplicate removal tool
 */

const fs = require('fs');
const path = require('path');

class CSSOptimizer {
  constructor() {
    this.duplicateRules = new Map();
    this.unusedSelectors = new Set();
    this.totalRules = 0;
    this.optimizedRules = 0;
  }

  analyzeCSSFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const rules = this.extractCSSRules(content);
      
      rules.forEach(rule => {
        this.totalRules++;
        const hash = this.hashRule(rule);
        
        if (this.duplicateRules.has(hash)) {
          this.duplicateRules.get(hash).push({ file: filePath, rule });
        } else {
          this.duplicateRules.set(hash, [{ file: filePath, rule }]);
        }
      });
      
      return rules.length;
    } catch (error) {
      console.warn(`Could not analyze CSS file ${filePath}:`, error.message);
      return 0;
    }
  }

  extractCSSRules(content) {
    const rules = [];
    const ruleRegex = /([^{}]+)\s*\{([^{}]*)\}/g;
    let match;
    
    while ((match = ruleRegex.exec(content)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2].trim();
      
      if (selector && declarations) {
        rules.push({ selector, declarations });
      }
    }
    
    return rules;
  }

  hashRule(rule) {
    // Create hash based on declarations, not selector
    return rule.declarations
      .split(';')
      .map(decl => decl.trim())
      .filter(decl => decl)
      .sort()
      .join(';');
  }

  findDuplicates() {
    const duplicates = [];
    
    this.duplicateRules.forEach((instances, hash) => {
      if (instances.length > 1) {
        duplicates.push({
          hash,
          instances,
          declarations: instances[0].rule.declarations
        });
      }
    });
    
    return duplicates;
  }

  optimizeCSS(inputPath, outputPath) {
    const content = fs.readFileSync(inputPath, 'utf8');
    const rules = this.extractCSSRules(content);
    const seenHashes = new Set();
    const optimizedRules = [];
    
    rules.forEach(rule => {
      const hash = this.hashRule(rule);
      
      if (!seenHashes.has(hash)) {
        seenHashes.add(hash);
        optimizedRules.push(rule);
        this.optimizedRules++;
      }
    });
    
    const optimizedContent = optimizedRules
      .map(rule => `${rule.selector} {\n  ${rule.declarations.replace(/;/g, ';\n  ')}\n}`)
      .join('\n\n');
    
    fs.writeFileSync(outputPath, optimizedContent);
    
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    return {
      originalSize,
      optimizedSize,
      savings: parseFloat(savings),
      rulesRemoved: rules.length - optimizedRules.length
    };
  }

  generateReport() {
    const duplicates = this.findDuplicates();
    
    console.log('\n🎨 CSS Optimization Report\n');
    console.log('=========================');
    console.log(`Total CSS rules analyzed: ${this.totalRules}`);
    console.log(`Duplicate rule groups found: ${duplicates.length}`);
    
    if (duplicates.length > 0) {
      console.log('\nTop duplicate rules:');
      duplicates
        .sort((a, b) => b.instances.length - a.instances.length)
        .slice(0, 10)
        .forEach((dup, index) => {
          console.log(`${index + 1}. Found ${dup.instances.length} times:`);
          console.log(`   ${dup.declarations.substring(0, 60)}...`);
          dup.instances.forEach(inst => {
            console.log(`   - ${path.basename(inst.file)}: ${inst.rule.selector}`);
          });
          console.log('');
        });
    }
    
    const potentialSavings = duplicates.reduce((acc, dup) => {
      return acc + (dup.instances.length - 1);
    }, 0);
    
    console.log(`Potential rules to remove: ${potentialSavings}`);
    console.log(`Estimated size reduction: ${((potentialSavings / this.totalRules) * 100).toFixed(1)}%`);
    
    return {
      totalRules: this.totalRules,
      duplicateGroups: duplicates.length,
      potentialSavings,
      duplicates
    };
  }

  analyzeDirectory(dirPath) {
    const cssFiles = [];
    
    const scanDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDir(filePath);
        } else if (file.endsWith('.css')) {
          cssFiles.push(filePath);
          this.analyzeCSSFile(filePath);
        }
      });
    };
    
    scanDir(dirPath);
    return cssFiles;
  }
}

// CLI usage
if (require.main === module) {
  const optimizer = new CSSOptimizer();
  const uiSystemPath = path.join(__dirname, '..');
  
  console.log('Analyzing UI System CSS files...');
  const cssFiles = optimizer.analyzeDirectory(uiSystemPath);
  console.log(`Found ${cssFiles.length} CSS files`);
  
  optimizer.generateReport();
}

module.exports = CSSOptimizer;