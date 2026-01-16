import { Icon } from '../../../ui-system/icons/components';
/**
 * TypeScript Compliance Checker
 * Validates strict TypeScript compliance across the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TypeScriptChecker {
  constructor() {
    this.srcPath = path.join(__dirname, '../src');
    this.results = {
      compilerErrors: [],
      anyTypes: [],
      missingTypes: [],
      strictModeIssues: []
    };
  }

  /**
   * Run TypeScript compliance check
   */
  async runCheck() {
    console.log('🔧 Starting TypeScript compliance check...\n');
    
    await this.checkCompilerErrors();
    await this.checkAnyTypes();
    await this.checkMissingTypes();
    
    this.generateReport();
  }

  /**
   * Check TypeScript compiler errors
   */
  async checkCompilerErrors() {
    console.log('<Icon name="search" size={16} /> Checking TypeScript compiler errors...');
    
    try {
      // Run TypeScript compiler in no-emit mode
      const tscPath = path.join(__dirname, '../../../../../../../node_modules/.bin/tsc');
      const configPath = path.join(__dirname, '../tsconfig.json');
      
      // Create minimal tsconfig if it doesn't exist
      if (!fs.existsSync(configPath)) {
        const tsConfig = {
          compilerOptions: {
            target: "ES2020",
            lib: ["DOM", "DOM.Iterable", "ES6"],
            allowJs: true,
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            moduleResolution: "node",
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: "react-jsx",
            noImplicitAny: true,
            strictNullChecks: true,
            noImplicitReturns: true,
            noUnusedLocals: true,
            noUnusedParameters: true
          },
          include: ["src/**/*"],
          exclude: ["node_modules", "**/*.test.*"]
        };
        
        fs.writeFileSync(configPath, JSON.stringify(tsConfig, null, 2));
      }
      
      execSync(`npx tsc --noEmit --project ${configPath}`, { 
        cwd: path.dirname(configPath),
        stdio: 'pipe'
      });
      
      console.log('   ✅ No TypeScript compiler errors found\n');
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : error.message;
      this.results.compilerErrors = this.parseCompilerErrors(output);
      console.log(`   ⚠️ Found ${this.results.compilerErrors.length} compiler errors\n`);
    }
  }

  /**
   * Check for 'any' types
   */
  async checkAnyTypes() {
    console.log('<Icon name="search" size={16} /> Checking for any types...');
    
    const files = this.getAllFiles(this.srcPath, ['.tsx', '.ts']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(this.srcPath, file);
      
      // Look for 'any' type usage
      const anyRegex = /:\s*any\b|<any>|as\s+any\b/g;
      let match;
      
      while ((match = anyRegex.exec(content)) !== null) {
        const lineNumber = this.getLineNumber(content, match.index);
        const line = this.getLineContent(content, lineNumber);
        
        // Skip if it's in a comment about external libraries
        if (!line.includes('external library') && !line.includes('@ts-ignore')) {
          this.results.anyTypes.push({
            file: relativePath,
            line: lineNumber,
            content: line.trim()
          });
        }
      }
    }
    
    console.log(`   Found ${this.results.anyTypes.length} any type usages\n`);
  }

  /**
   * Check for missing type annotations
   */
  async checkMissingTypes() {
    console.log('<Icon name="search" size={16} /> Checking for missing type annotations...');
    
    const files = this.getAllFiles(this.srcPath, ['.tsx', '.ts']);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(this.srcPath, file);
      
      // Look for functions without return types
      const functionRegex = /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=]+))\s*=>\s*{/g;
      let match;
      
      while ((match = functionRegex.exec(content)) !== null) {
        const lineNumber = this.getLineNumber(content, match.index);
        const line = this.getLineContent(content, lineNumber);
        
        // Check if return type is specified
        if (!line.includes('):') && !line.includes('=> ')) {
          this.results.missingTypes.push({
            file: relativePath,
            line: lineNumber,
            content: line.trim()
          });
        }
      }
    }
    
    console.log(`   Found ${this.results.missingTypes.length} functions without return types\n`);
  }

  /**
   * Parse TypeScript compiler errors
   */
  parseCompilerErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    lines.forEach(line => {
      const errorMatch = line.match(/^(.+)\((\d+),(\d+)\):\s*error\s+TS(\d+):\s*(.+)$/);
      if (errorMatch) {
        errors.push({
          file: errorMatch[1],
          line: parseInt(errorMatch[2]),
          column: parseInt(errorMatch[3]),
          code: errorMatch[4],
          message: errorMatch[5]
        });
      }
    });
    
    return errors;
  }

  /**
   * Generate compliance report
   */
  generateReport() {
    console.log('📊 TYPESCRIPT COMPLIANCE REPORT');
    console.log('================================\n');
    
    const totalIssues = this.results.compilerErrors.length + 
                       this.results.anyTypes.length + 
                       this.results.missingTypes.length;
    
    if (totalIssues === 0) {
      console.log('🎉 PASSED: Full TypeScript compliance achieved!\n');
    } else {
      console.log(`⚠️ ISSUES FOUND: ${totalIssues} TypeScript compliance issues.\n`);
    }
    
    if (this.results.compilerErrors.length > 0) {
      console.log('<Icon name="x" size={16} /> COMPILER ERRORS:');
      this.results.compilerErrors.slice(0, 10).forEach(error => {
        console.log(`   ${error.file}:${error.line} - TS${error.code}: ${error.message}`);
      });
      if (this.results.compilerErrors.length > 10) {
        console.log(`   ... and ${this.results.compilerErrors.length - 10} more errors`);
      }
      console.log();
    }
    
    if (this.results.anyTypes.length > 0) {
      console.log('⚠️ ANY TYPE USAGE:');
      this.results.anyTypes.slice(0, 5).forEach(any => {
        console.log(`   ${any.file}:${any.line} - ${any.content}`);
      });
      if (this.results.anyTypes.length > 5) {
        console.log(`   ... and ${this.results.anyTypes.length - 5} more instances`);
      }
      console.log();
    }
    
    console.log('Check completed at:', new Date().toISOString());
  }

  /**
   * Helper methods
   */
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

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  getLineContent(content, lineNumber) {
    const lines = content.split('\n');
    return lines[lineNumber - 1] || '';
  }
}

if (require.main === module) {
  const checker = new TypeScriptChecker();
  checker.runCheck().catch(console.error);
}

module.exports = TypeScriptChecker;