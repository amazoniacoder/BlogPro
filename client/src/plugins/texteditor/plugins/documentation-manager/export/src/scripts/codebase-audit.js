import { Icon } from '../../../ui-system/icons/components';
/**
 * Codebase Audit Script
 * Comprehensive validation of the documentation manager implementation
 */

const fs = require('fs');
const path = require('path');

class CodebaseAuditor {
  constructor() {
    this.srcPath = path.join(__dirname, '../src');
    this.results = {
      duplicateFiles: [],
      oversizedFiles: [],
      legacyCode: [],
      typeScriptIssues: [],
      missingImplementations: []
    };
  }

  /**
   * Run complete audit
   */
  async runAudit() {
    console.log('<Icon name="search" size={16} /> Starting codebase audit...\n');
    
    await this.checkDuplicateFiles();
    await this.checkFileSizes();
    await this.checkLegacyCode();
    await this.checkTypeScriptCompliance();
    await this.verifyImplementations();
    
    this.generateReport();
  }

  /**
   * Check for duplicate files
   */
  async checkDuplicateFiles() {
    console.log('📁 Checking for duplicate files...');
    
    const files = this.getAllFiles(this.srcPath, ['.tsx', '.ts']);
    const fileNames = {};
    
    files.forEach(file => {
      const basename = path.basename(file);
      if (!fileNames[basename]) {
        fileNames[basename] = [];
      }
      fileNames[basename].push(file);
    });
    
    Object.entries(fileNames).forEach(([name, paths]) => {
      if (paths.length > 1) {
        this.results.duplicateFiles.push({ name, paths });
      }
    });
    
    console.log(`   Found ${this.results.duplicateFiles.length} duplicate file names\n`);
  }

  /**
   * Check file sizes (max 400 lines)
   */
  async checkFileSizes() {
    console.log('📏 Checking file sizes...');
    
    const files = this.getAllFiles(this.srcPath, ['.tsx', '.ts']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      
      if (lines > 400) {
        this.results.oversizedFiles.push({
          file: path.relative(this.srcPath, file),
          lines
        });
      }
    }
    
    console.log(`   Found ${this.results.oversizedFiles.length} oversized files\n`);
  }

  /**
   * Check for legacy code patterns
   */
  async checkLegacyCode() {
    console.log('<Icon name="delete" size={16} /> Checking for legacy code...');
    
    const files = this.getAllFiles(this.srcPath, ['.tsx', '.ts']);
    const legacyPatterns = [
      'DocumentationManagerApp',
      'OldComponent',
      'legacy',
      'deprecated',
      'TODO: remove',
      'FIXME'
    ];
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(this.srcPath, file);
      
      legacyPatterns.forEach(pattern => {
        if (content.includes(pattern)) {
          this.results.legacyCode.push({
            file: relativePath,
            pattern,
            line: this.findLineNumber(content, pattern)
          });
        }
      });
    }
    
    console.log(`   Found ${this.results.legacyCode.length} legacy code instances\n`);
  }

  /**
   * Check TypeScript compliance
   */
  async checkTypeScriptCompliance() {
    console.log('🔧 Checking TypeScript compliance...');
    
    const files = this.getAllFiles(this.srcPath, ['.tsx', '.ts']);
    const issues = [];
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(this.srcPath, file);
      
      // Check for 'any' types
      const anyMatches = content.match(/:\s*any\b/g);
      if (anyMatches) {
        issues.push({
          file: relativePath,
          issue: 'Uses any type',
          count: anyMatches.length
        });
      }
    }
    
    this.results.typeScriptIssues = issues;
    console.log(`   Found ${issues.length} TypeScript compliance issues\n`);
  }

  /**
   * Verify required implementations
   */
  async verifyImplementations() {
    console.log('✅ Verifying implementations...');
    
    const requiredComponents = [
      'ContextMenu',
      'InlineEditor', 
      'VersionManager',
      'useWebSocketUpdates',
      'ContentManager',
      'AdminHeader',
      'SupportEditorLayout'
    ];
    
    const files = this.getAllFiles(this.srcPath, ['.tsx', '.ts']);
    const foundComponents = new Set();
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      requiredComponents.forEach(component => {
        if (content.includes(`export const ${component}`) || 
            content.includes(`export function ${component}`) ||
            content.includes(`const ${component}`)) {
          foundComponents.add(component);
        }
      });
    }
    
    const missing = requiredComponents.filter(comp => !foundComponents.has(comp));
    this.results.missingImplementations = missing;
    
    console.log(`   Found ${foundComponents.size}/${requiredComponents.length} required components\n`);
  }

  /**
   * Generate audit report
   */
  generateReport() {
    console.log('📊 AUDIT REPORT');
    console.log('================\n');
    
    const totalIssues = this.results.duplicateFiles.length + 
                       this.results.oversizedFiles.length + 
                       this.results.legacyCode.length + 
                       this.results.typeScriptIssues.length + 
                       this.results.missingImplementations.length;
    
    if (totalIssues === 0) {
      console.log('🎉 PASSED: No issues found! Codebase is production-ready.\n');
    } else {
      console.log(`⚠️  ISSUES FOUND: ${totalIssues} total issues need attention.\n`);
    }
    
    if (this.results.oversizedFiles.length > 0) {
      console.log('📏 OVERSIZED FILES (>400 lines):');
      this.results.oversizedFiles.forEach(file => {
        console.log(`   ${file.file}: ${file.lines} lines`);
      });
      console.log();
    }
    
    if (this.results.missingImplementations.length > 0) {
      console.log('<Icon name="x" size={16} /> MISSING IMPLEMENTATIONS:');
      this.results.missingImplementations.forEach(missing => {
        console.log(`   - ${missing}`);
      });
      console.log();
    }
    
    console.log('Audit completed at:', new Date().toISOString());
  }

  getAllFiles(dir, extensions) {
    const files = [];
    
    const scan = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    };
    
    scan(dir);
    return files;
  }

  findLineNumber(content, pattern) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) {
        return i + 1;
      }
    }
    return 0;
  }
}

if (require.main === module) {
  const auditor = new CodebaseAuditor();
  auditor.runAudit().catch(console.error);
}

module.exports = CodebaseAuditor;