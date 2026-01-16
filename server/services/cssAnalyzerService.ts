import fs from 'fs/promises';
import path from 'path';
import { parse, walk, generate, lexer } from 'css-tree';

interface CSSRule {
  selector: string;
  properties: Record<string, string>;
  file: string;
  line: number;
}

interface DuplicateGroup {
  id: string;
  rules: CSSRule[];
  duplicateType: 'identical' | 'similar';
  similarity: number;
}

interface ValidationError {
  file: string;
  line: number;
  column: number;
  message: string;
  property?: string;
  value?: string;
}

interface ValidationResult {
  totalFiles: number;
  validFiles: number;
  errors: ValidationError[];
  summary: {
    syntaxErrors: number;
    propertyErrors: number;
    valueErrors: number;
  };
}

export class CSSAnalyzerService {
  private cssFiles: string[] = [];
  private rules: CSSRule[] = [];

  async scanCSSFiles(rootDir: string): Promise<void> {
    this.cssFiles = await this.findCSSFiles(rootDir);
    console.log(`Found ${this.cssFiles.length} CSS files`);
    this.rules = await this.parseAllCSS();
    console.log(`Total rules parsed: ${this.rules.length}`);
  }

  private async findCSSFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.includes('node_modules')) {
        files.push(...await this.findCSSFiles(fullPath));
      } else if (entry.name.endsWith('.css')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  private async parseAllCSS(): Promise<CSSRule[]> {
    const allRules: CSSRule[] = [];
    
    for (const file of this.cssFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const rules = this.parseCSS(content, file);
      allRules.push(...rules);
    }
    
    return allRules;
  }

  private parseCSS(content: string, filePath: string): CSSRule[] {
    const rules: CSSRule[] = [];
    
    // Skip empty files and @import only files
    if (!content.trim() || content.trim().startsWith('@import')) {
      return rules;
    }
    
    try {
      const ast = parse(content);
      
      walk(ast, (node: any) => {
        if (node.type === 'Rule') {
          const selector = this.extractSelector(node);
          const properties = this.extractProperties(node);
          
          // Skip keyframe animation rules (from, to, percentages)
          if (this.isKeyframeRule(selector)) {
            return;
          }
          
          // Only add rules that have actual properties
          if (Object.keys(properties).length > 0) {
            rules.push({
              selector,
              properties,
              file: filePath,
              line: node.loc?.start.line || 1
            });
          }
        }
      });
      
      console.log(`Parsed ${rules.length} rules from ${filePath}`);
    } catch (error) {
      console.error(`Error parsing CSS file ${filePath}:`, error);
    }
    
    return rules;
  }

  private extractSelector(node: any): string {
    try {
      return generate(node.prelude);
    } catch {
      return 'unknown-selector';
    }
  }

  private extractProperties(node: any): Record<string, string> {
    const properties: Record<string, string> = {};
    
    if (node.block && node.block.children) {
      walk(node.block, (child: any) => {
        if (child.type === 'Declaration') {
          try {
            properties[child.property] = generate(child.value);
          } catch {
            properties[child.property] = 'unknown-value';
          }
        }
      });
    }
    
    return properties;
  }

  findDuplicates(): DuplicateGroup[] {
    const duplicates: DuplicateGroup[] = [];
    
    // Group rules by property signature for faster comparison
    const ruleGroups = new Map<string, number[]>();
    
    this.rules.forEach((rule, index) => {
      // Skip rules with less than 2 properties (not worth deduplicating)
      if (Object.keys(rule.properties).length < 2) return;
      
      const signature = this.createPropertySignature(rule);
      if (!ruleGroups.has(signature)) {
        ruleGroups.set(signature, []);
      }
      ruleGroups.get(signature)!.push(index);
    });
    
    // Only check groups with multiple rules
    for (const [signature, indices] of ruleGroups) {
      if (indices.length < 2) continue;
      
      const groupRules = indices.map(i => this.rules[i]);
      const firstRule = groupRules[0];
      
      // Check if all rules in group are identical or similar
      const identicalRules = [firstRule];
      const similarRules: CSSRule[] = [];
      
      for (let i = 1; i < groupRules.length; i++) {
        const rule = groupRules[i];
        if (this.areIdentical(firstRule, rule)) {
          identicalRules.push(rule);
        } else {
          const similarity = this.calculateSimilarity(firstRule, rule);
          if (similarity >= 0.8) {
            similarRules.push(rule);
          }
        }
      }
      
      if (identicalRules.length > 1) {
        duplicates.push({
          id: `dup_identical_${Date.now()}_${signature}`,
          rules: identicalRules,
          duplicateType: 'identical',
          similarity: 1.0
        });
      }
      
      if (similarRules.length > 0) {
        duplicates.push({
          id: `dup_similar_${Date.now()}_${signature}`,
          rules: [firstRule, ...similarRules],
          duplicateType: 'similar',
          similarity: Math.min(...similarRules.map(r => this.calculateSimilarity(firstRule, r)))
        });
      }
    }
    
    return duplicates.sort((a, b) => b.rules.length - a.rules.length);
  }

  private calculateSimilarity(rule1: CSSRule, rule2: CSSRule): number {
    const props1 = Object.keys(rule1.properties);
    const props2 = Object.keys(rule2.properties);
    
    if (props1.length === 0 && props2.length === 0) return 1;
    if (props1.length === 0 || props2.length === 0) return 0;
    
    const commonProps = props1.filter(prop => 
      props2.includes(prop) && rule1.properties[prop] === rule2.properties[prop]
    );
    
    return commonProps.length / Math.max(props1.length, props2.length);
  }

  private areIdentical(rule1: CSSRule, rule2: CSSRule): boolean {
    return JSON.stringify(rule1.properties) === JSON.stringify(rule2.properties);
  }
  
  private createPropertySignature(rule: CSSRule): string {
    const sortedProps = Object.keys(rule.properties).sort();
    return sortedProps.join('|');
  }
  
  private isKeyframeRule(selector: string): boolean {
    // Check if selector is a keyframe rule (from, to, or percentage)
    const trimmedSelector = selector.trim();
    return trimmedSelector === 'from' || 
           trimmedSelector === 'to' || 
           /^\d+(\.\d+)?%$/.test(trimmedSelector);
  }

  validateW3C(): ValidationResult {
    const errors: ValidationError[] = [];
    let validFiles = 0;
    
    for (const file of this.cssFiles) {
      const fileErrors = this.validateCSSFile(file);
      if (fileErrors.length === 0) {
        validFiles++;
      }
      errors.push(...fileErrors);
    }
    
    return {
      totalFiles: this.cssFiles.length,
      validFiles,
      errors,
      summary: {
        syntaxErrors: errors.filter(e => e.message.includes('syntax')).length,
        propertyErrors: errors.filter(e => e.property && !e.value).length,
        valueErrors: errors.filter(e => e.value).length
      }
    };
  }

  private validateCSSFile(filePath: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    try {
      const content = require('fs').readFileSync(filePath, 'utf-8');
      
      // Skip empty files, import-only files, and comment-only files
      const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (!cleanContent || cleanContent.startsWith('@import') || cleanContent.split('\n').every((line: string) => line.trim().startsWith('@import') || !line.trim())) {
        return errors;
      }
      
      const ast = parse(content, { 
        filename: filePath,
        parseAtrulePrelude: false,
        parseRulePrelude: false,
        parseValue: false
      });
      
      walk(ast, (node: any) => {
        if (node.type === 'Declaration') {
          try {
            const property = node.property;
            
            // Skip vendor prefixes and custom properties
            if (property.startsWith('-') || property.startsWith('--')) {
              return;
            }
            
            const value = generate(node.value);
            
            // Use css-tree lexer to validate property-value pairs
            const matchResult = lexer.matchProperty(property, node.value);
            
            if (matchResult.error) {
              errors.push({
                file: filePath,
                line: node.loc?.start.line || 1,
                column: node.loc?.start.column || 1,
                message: `Invalid value for property '${property}': ${matchResult.error.message}`,
                property,
                value
              });
            }
          } catch (error) {
            // Skip validation errors for complex selectors or values
            if (error instanceof Error && !error.message.includes('Unknown property')) {
              return;
            }
          }
        }
      });
      
    } catch (parseError) {
      // Only report actual syntax errors, not parsing limitations
      if (parseError instanceof Error && parseError.message.includes('Unexpected')) {
        errors.push({
          file: filePath,
          line: 1,
          column: 1,
          message: `CSS syntax error: ${parseError.message}`
        });
      }
    }
    
    return errors;
  }

  async removeDuplicate(filePath: string, selector: string): Promise<void> {
    console.log(`Attempting to remove selector: ${selector} from ${filePath}`);
    
    const content = await fs.readFile(filePath, 'utf-8');
    
    try {
      // Escape special regex characters in selector
      const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Create regex to match the CSS rule (selector + block)
      const ruleRegex = new RegExp(
        `${escapedSelector}\\s*\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}`,
        'gm'
      );
      
      const matches = content.match(ruleRegex);
      
      if (matches && matches.length > 0) {
        // Remove the first occurrence of the rule
        const updatedContent = content.replace(ruleRegex, '');
        
        // Clean up extra whitespace
        const cleanedContent = updatedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        await fs.writeFile(filePath, cleanedContent);
        
        // Clear cached data to force fresh scan
        this.clearCache();
        
        console.log(`Successfully removed rule from ${filePath}`);
      } else {
        console.log(`Rule not found: ${selector} in ${filePath}`);
      }
    } catch (error) {
      console.error(`Error removing duplicate from ${filePath}:`, error);
      throw error;
    }
  }
  
  clearCache(): void {
    this.cssFiles = [];
    this.rules = [];
    console.log('CSS analyzer cache cleared');
  }
}