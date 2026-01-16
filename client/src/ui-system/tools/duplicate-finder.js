#!/usr/bin/env node

/**
 * Professional CSS Duplicate Finder
 * Comprehensive analysis tool for BlogPro UI System
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CSSRule {
  constructor(selector, properties, file, startLine) {
    this.selector = selector;
    this.properties = properties;
    this.file = file;
    this.startLine = startLine;
    this.hash = this.generateHash();
  }

  generateHash() {
    const propsString = Object.entries(this.properties)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([prop, value]) => `${prop}:${value}`)
      .join(';');
    return crypto.createHash('md5').update(propsString).digest('hex');
  }

  getSimilarityScore(other) {
    const props1 = new Set(Object.keys(this.properties));
    const props2 = new Set(Object.keys(other.properties));
    const intersection = new Set([...props1].filter(x => props2.has(x)));
    const union = new Set([...props1, ...props2]);
    return intersection.size / union.size;
  }
}

class DuplicateFinder {
  constructor(rootPath) {
    this.rootPath = rootPath;
    this.cssFiles = [];
    this.rules = [];
    this.duplicates = {
      identical: [],
      similar: []
    };
  }

  async analyze() {
    console.log('🔍 Starting comprehensive CSS duplicate analysis...\n');
    
    // Find all CSS files
    this.findCSSFiles(this.rootPath);
    console.log(`📁 Found ${this.cssFiles.length} CSS files`);
    
    // Parse all CSS files
    for (const file of this.cssFiles) {
      this.parseCSS(file);
    }
    console.log(`📋 Parsed ${this.rules.length} CSS rules`);
    
    // Find duplicates
    this.findDuplicates();
    
    // Generate report
    this.generateReport();
  }

  findCSSFiles(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          this.findCSSFiles(fullPath);
        }
      } else if (item.endsWith('.css')) {
        this.cssFiles.push(fullPath);
      }
    }
  }

  parseCSS(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.rootPath, filePath);
    const lines = content.split('\n');
    
    let currentRule = null;
    let braceCount = 0;
    let inRule = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip comments and empty lines
      if (line.startsWith('/*') || line.startsWith('*') || line.startsWith('//') || !line) {
        continue;
      }
      
      // Check for selector start
      if (line.includes('{') && !inRule) {
        const selector = line.substring(0, line.indexOf('{')).trim();
        if (selector && !selector.startsWith('@')) {
          currentRule = {
            selector,
            properties: {},
            file: relativePath,
            startLine: i + 1
          };
          inRule = true;
          braceCount = 1;
          
          // Check for properties on same line
          const afterBrace = line.substring(line.indexOf('{') + 1).trim();
          if (afterBrace && afterBrace !== '}') {
            this.parseProperty(afterBrace, currentRule);
          }
        }
      }
      // Parse properties inside rule
      else if (inRule && currentRule) {
        if (line.includes('}')) {
          braceCount--;
          if (braceCount === 0) {
            // Rule ended
            if (Object.keys(currentRule.properties).length > 0) {
              this.rules.push(new CSSRule(
                currentRule.selector,
                currentRule.properties,
                currentRule.file,
                currentRule.startLine
              ));
            }
            currentRule = null;
            inRule = false;
          }
        } else {
          this.parseProperty(line, currentRule);
        }
      }
    }
  }

  parseProperty(line, rule) {
    // Handle multiple properties on one line
    const properties = line.split(';').filter(p => p.trim());
    
    for (const prop of properties) {
      const colonIndex = prop.indexOf(':');
      if (colonIndex > 0) {
        const property = prop.substring(0, colonIndex).trim();
        const value = prop.substring(colonIndex + 1).trim().replace(/;$/, '');
        
        if (property && value) {
          rule.properties[property] = value;
        }
      }
    }
  }

  findDuplicates() {
    console.log('\n🔍 Analyzing duplicates...');
    
    // Group by hash for identical duplicates
    const hashGroups = {};
    
    for (const rule of this.rules) {
      if (!hashGroups[rule.hash]) {
        hashGroups[rule.hash] = [];
      }
      hashGroups[rule.hash].push(rule);
    }
    
    // Find identical duplicates
    for (const [hash, rules] of Object.entries(hashGroups)) {
      if (rules.length > 1) {
        this.duplicates.identical.push({
          hash,
          rules,
          pattern: this.getPatternDescription(rules[0].properties)
        });
      }
    }
    
    // Find similar duplicates (80%+ similarity)
    for (let i = 0; i < this.rules.length; i++) {
      for (let j = i + 1; j < this.rules.length; j++) {
        const rule1 = this.rules[i];
        const rule2 = this.rules[j];
        
        if (rule1.hash !== rule2.hash) {
          const similarity = rule1.getSimilarityScore(rule2);
          if (similarity >= 0.8) {
            this.duplicates.similar.push({
              similarity: Math.round(similarity * 100),
              rules: [rule1, rule2],
              pattern: this.getPatternDescription(rule1.properties)
            });
          }
        }
      }
    }
    
    console.log(`✅ Found ${this.duplicates.identical.length} identical duplicate groups`);
    console.log(`✅ Found ${this.duplicates.similar.length} similar duplicate pairs`);
  }

  getPatternDescription(properties) {
    const keys = Object.keys(properties);
    if (keys.length <= 3) {
      return Object.entries(properties)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join('; ');
    }
    return `${keys.slice(0, 3).join(', ')} + ${keys.length - 3} more`;
  }

  generateReport() {
    const reportPath = path.join(this.rootPath, 'docs', 'development', 'CSS_DUPLICATE_ANALYSIS_REPORT.md');
    
    let report = `# CSS Duplicate Analysis Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total CSS Files:** ${this.cssFiles.length}\n`;
    report += `**Total CSS Rules:** ${this.rules.length}\n`;
    report += `**Identical Duplicates:** ${this.duplicates.identical.length} groups\n`;
    report += `**Similar Duplicates:** ${this.duplicates.similar.length} pairs\n\n`;
    
    // Identical Duplicates
    report += `## 🎯 Identical Duplicates (${this.duplicates.identical.length} groups)\n\n`;
    
    this.duplicates.identical
      .sort((a, b) => b.rules.length - a.rules.length)
      .forEach((group, index) => {
        report += `### Group ${index + 1}: ${group.rules[0].selector} (${group.rules.length} duplicates)\n\n`;
        report += `**Pattern:** \`${group.pattern}\`\n\n`;
        
        group.rules.forEach((rule, ruleIndex) => {
          report += `**${ruleIndex + 1}.** \`${rule.selector}\`\n`;
          report += `- **File:** \`${rule.file}\`\n`;
          report += `- **Line:** ${rule.startLine}\n\n`;
        });
        
        report += `**Properties:**\n\`\`\`css\n`;
        Object.entries(group.rules[0].properties).forEach(([prop, value]) => {
          report += `${prop}: ${value};\n`;
        });
        report += `\`\`\`\n\n---\n\n`;
      });
    
    // Similar Duplicates
    report += `## 🔍 Similar Duplicates (${this.duplicates.similar.length} pairs)\n\n`;
    
    this.duplicates.similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20) // Top 20 most similar
      .forEach((pair, index) => {
        report += `### Pair ${index + 1}: ${pair.similarity}% Similar\n\n`;
        
        pair.rules.forEach((rule, ruleIndex) => {
          report += `**${ruleIndex + 1}.** \`${rule.selector}\`\n`;
          report += `- **File:** \`${rule.file}\`\n`;
          report += `- **Line:** ${rule.startLine}\n`;
          report += `- **Properties:** ${Object.keys(rule.properties).length}\n\n`;
        });
        
        report += `---\n\n`;
      });
    
    // Summary by file
    report += `## 📊 Summary by File\n\n`;
    const fileStats = {};
    
    [...this.duplicates.identical.flatMap(g => g.rules), ...this.duplicates.similar.flatMap(p => p.rules)]
      .forEach(rule => {
        if (!fileStats[rule.file]) {
          fileStats[rule.file] = 0;
        }
        fileStats[rule.file]++;
      });
    
    Object.entries(fileStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([file, count]) => {
        report += `- **${file}:** ${count} duplicates\n`;
      });
    
    // Write report
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report generated: ${reportPath}`);
    
    // Generate elimination plan
    this.generateEliminationPlan();
  }

  generateEliminationPlan() {
    const planPath = path.join(this.rootPath, 'docs', 'development', 'CSS_DUPLICATE_ELIMINATION_PLAN_V2.md');
    
    let plan = `# CSS Duplicate Elimination Plan V2\n\n`;
    plan += `**Generated:** ${new Date().toISOString()}\n`;
    plan += `**Status:** Ready for Implementation\n\n`;
    
    plan += `## 📊 Analysis Summary\n\n`;
    plan += `- **Total CSS Files:** ${this.cssFiles.length}\n`;
    plan += `- **Total CSS Rules:** ${this.rules.length}\n`;
    plan += `- **Identical Duplicates:** ${this.duplicates.identical.length} groups\n`;
    plan += `- **Similar Duplicates:** ${this.duplicates.similar.length} pairs\n`;
    plan += `- **Total Duplicates to Fix:** ${this.duplicates.identical.reduce((sum, g) => sum + g.rules.length - 1, 0)}\n\n`;
    
    plan += `## 🎯 Elimination Strategy\n\n`;
    plan += `**Methodology:** analyze one duplicate → create utility → replace all instances → test → mark completed\n\n`;
    
    plan += `## 📋 Phase 1: High-Impact Identical Duplicates\n\n`;
    
    // Sort by impact (number of duplicates)
    const sortedGroups = this.duplicates.identical
      .sort((a, b) => b.rules.length - a.rules.length)
      .slice(0, 10); // Top 10 highest impact
    
    sortedGroups.forEach((group, groupIndex) => {
      const utilityName = this.generateUtilityName(group.rules[0]);
      
      plan += `### Group ${groupIndex + 1}: ${utilityName} (${group.rules.length} duplicates)\n\n`;
      plan += `**Pattern:** \`${group.pattern}\`\n\n`;
      
      plan += `#### Step ${groupIndex + 1}.1: Create Utility Class\n`;
      plan += `\`\`\`css\n/* ui-system/utilities/${utilityName.replace('.', '').toLowerCase()}.css */\n`;
      plan += `${utilityName} {\n`;
      Object.entries(group.rules[0].properties).forEach(([prop, value]) => {
        plan += `  ${prop}: ${value};\n`;
      });
      plan += `}\n\`\`\`\n\n`;
      
      plan += `#### Step ${groupIndex + 1}.2: Replace Duplicates\n\n`;
      
      group.rules.forEach((rule, ruleIndex) => {
        plan += `**${groupIndex + 1}.2.${ruleIndex + 1}: ${rule.selector}**\n`;
        plan += `- **File:** \`${rule.file}\`\n`;
        plan += `- **Line:** ${rule.startLine}\n`;
        plan += `- **Action:** Replace with \`${utilityName}\` class\n`;
        plan += `- **Status:** ⏳ Pending\n\n`;
      });
    });
    
    fs.writeFileSync(planPath, plan);
    console.log(`📋 Elimination plan generated: ${planPath}`);
  }

  generateUtilityName(rule) {
    const props = Object.keys(rule.properties);
    
    // Common patterns
    if (props.includes('width') && props.includes('height') && props.includes('object-fit')) {
      return '.image-cover';
    }
    if (props.includes('opacity') && props.includes('cursor')) {
      return '.disabled-state';
    }
    if (props.includes('display') && props.includes('align-items') && props.includes('justify-content')) {
      return '.flex-center';
    }
    if (props.includes('position') && props.includes('top') && props.includes('left')) {
      return '.absolute-overlay';
    }
    
    // Generate based on selector
    const selectorParts = rule.selector.split('__');
    if (selectorParts.length > 1) {
      return `.${selectorParts[selectorParts.length - 1].replace(/[^a-zA-Z0-9-]/g, '')}`;
    }
    
    return `.utility-${Math.random().toString(36).substr(2, 5)}`;
  }
}

// Run the analysis
const finder = new DuplicateFinder('D:\\BlogPro\\client\\src\\ui-system');
finder.analyze().catch(console.error);