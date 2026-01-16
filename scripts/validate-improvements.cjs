#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Improvement Validation Script
 * Validates all implemented improvements and generates a report
 */

class ImprovementValidator {
  constructor() {
    this.results = {
      cssValidation: { passed: 0, failed: 0, details: [] },
      apiDocumentation: { passed: 0, failed: 0, details: [] },
      accessibility: { passed: 0, failed: 0, details: [] },
      errorHandling: { passed: 0, failed: 0, details: [] },
      overall: { score: 0, maxScore: 0 }
    };
  }

  async validateCSS() {
    console.log('🎨 Validating CSS Migration...');
    
    const blocksDir = path.join(__dirname, '../client/src/styles/blocks');
    const componentsDir = path.join(__dirname, '../client/src/styles/components');
    
    try {
      // Check BEM blocks exist
      const blocks = fs.readdirSync(blocksDir).filter(item => 
        fs.statSync(path.join(blocksDir, item)).isDirectory()
      );
      
      this.results.cssValidation.passed += blocks.length;
      this.results.cssValidation.details.push(`✅ Found ${blocks.length} BEM blocks`);
      
      // Check remaining components
      const remainingComponents = fs.readdirSync(componentsDir).filter(file => 
        file.endsWith('.css')
      );
      
      if (remainingComponents.length > 0) {
        this.results.cssValidation.failed += remainingComponents.length;
        this.results.cssValidation.details.push(`⚠️  ${remainingComponents.length} components still need migration`);
      }
      
      // Validate main.css imports
      const mainCSS = fs.readFileSync(path.join(__dirname, '../client/src/styles/main.css'), 'utf8');
      const blockImports = blocks.filter(block => 
        mainCSS.includes(`@import './blocks/${block}/index.css';`)
      );
      
      this.results.cssValidation.passed += blockImports.length;
      this.results.cssValidation.details.push(`✅ ${blockImports.length} blocks properly imported in main.css`);
      
    } catch (error) {
      this.results.cssValidation.failed += 1;
      this.results.cssValidation.details.push(`❌ CSS validation error: ${error.message}`);
    }
  }

  async validateAPIDocumentation() {
    console.log('📚 Validating API Documentation...');
    
    try {
      // Check Swagger config
      const swaggerPath = path.join(__dirname, '../server/config/swagger.ts');
      const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');
      
      if (swaggerContent.includes('StandardSuccess') && swaggerContent.includes('StandardError')) {
        this.results.apiDocumentation.passed += 1;
        this.results.apiDocumentation.details.push('✅ Enhanced Swagger schemas found');
      } else {
        this.results.apiDocumentation.failed += 1;
        this.results.apiDocumentation.details.push('❌ Missing enhanced Swagger schemas');
      }
      
      // Check API response types
      const apiTypesPath = path.join(__dirname, '../shared/types/api-responses.ts');
      if (fs.existsSync(apiTypesPath)) {
        this.results.apiDocumentation.passed += 1;
        this.results.apiDocumentation.details.push('✅ Standardized API response types exist');
      } else {
        this.results.apiDocumentation.failed += 1;
        this.results.apiDocumentation.details.push('❌ Missing API response types');
      }
      
    } catch (error) {
      this.results.apiDocumentation.failed += 1;
      this.results.apiDocumentation.details.push(`❌ API documentation error: ${error.message}`);
    }
  }

  async validateAccessibility() {
    console.log('♿ Validating Accessibility Tests...');
    
    try {
      // Check accessibility test file
      const accessibilityTestPath = path.join(__dirname, '../client/src/__tests__/accessibility.test.ts');
      if (fs.existsSync(accessibilityTestPath)) {
        this.results.accessibility.passed += 1;
        this.results.accessibility.details.push('✅ Accessibility tests created');
        
        const testContent = fs.readFileSync(accessibilityTestPath, 'utf8');
        const testCount = (testContent.match(/test\(/g) || []).length;
        this.results.accessibility.passed += testCount;
        this.results.accessibility.details.push(`✅ ${testCount} accessibility tests defined`);
      } else {
        this.results.accessibility.failed += 1;
        this.results.accessibility.details.push('❌ Missing accessibility tests');
      }
      
    } catch (error) {
      this.results.accessibility.failed += 1;
      this.results.accessibility.details.push(`❌ Accessibility validation error: ${error.message}`);
    }
  }

  async validateErrorHandling() {
    console.log('🚨 Validating Error Handling...');
    
    try {
      // Check error handler middleware
      const errorHandlerPath = path.join(__dirname, '../server/middleware/errorHandler.ts');
      const errorHandlerContent = fs.readFileSync(errorHandlerPath, 'utf8');
      
      if (errorHandlerContent.includes('createErrorResponse') && errorHandlerContent.includes('ErrorCodes')) {
        this.results.errorHandling.passed += 1;
        this.results.errorHandling.details.push('✅ Standardized error handling implemented');
      } else {
        this.results.errorHandling.failed += 1;
        this.results.errorHandling.details.push('❌ Error handling not standardized');
      }
      
      // Check API response types
      const apiResponsesPath = path.join(__dirname, '../shared/types/api-responses.ts');
      if (fs.existsSync(apiResponsesPath)) {
        const apiContent = fs.readFileSync(apiResponsesPath, 'utf8');
        if (apiContent.includes('ErrorCodes') && apiContent.includes('createErrorResponse')) {
          this.results.errorHandling.passed += 1;
          this.results.errorHandling.details.push('✅ Error codes and helper functions exist');
        }
      }
      
    } catch (error) {
      this.results.errorHandling.failed += 1;
      this.results.errorHandling.details.push(`❌ Error handling validation error: ${error.message}`);
    }
  }

  calculateOverallScore() {
    const totalPassed = Object.values(this.results).reduce((sum, category) => {
      return sum + (category.passed || 0);
    }, 0);
    
    const totalFailed = Object.values(this.results).reduce((sum, category) => {
      return sum + (category.failed || 0);
    }, 0);
    
    this.results.overall.maxScore = totalPassed + totalFailed;
    this.results.overall.score = totalPassed;
  }

  generateReport() {
    console.log('\n📊 IMPROVEMENT VALIDATION REPORT');
    console.log('================================\n');
    
    // CSS Migration
    console.log('🎨 CSS Migration:');
    console.log(`   Passed: ${this.results.cssValidation.passed}`);
    console.log(`   Failed: ${this.results.cssValidation.failed}`);
    this.results.cssValidation.details.forEach(detail => console.log(`   ${detail}`));
    console.log('');
    
    // API Documentation
    console.log('📚 API Documentation:');
    console.log(`   Passed: ${this.results.apiDocumentation.passed}`);
    console.log(`   Failed: ${this.results.apiDocumentation.failed}`);
    this.results.apiDocumentation.details.forEach(detail => console.log(`   ${detail}`));
    console.log('');
    
    // Accessibility
    console.log('♿ Accessibility:');
    console.log(`   Passed: ${this.results.accessibility.passed}`);
    console.log(`   Failed: ${this.results.accessibility.failed}`);
    this.results.accessibility.details.forEach(detail => console.log(`   ${detail}`));
    console.log('');
    
    // Error Handling
    console.log('🚨 Error Handling:');
    console.log(`   Passed: ${this.results.errorHandling.passed}`);
    console.log(`   Failed: ${this.results.errorHandling.failed}`);
    this.results.errorHandling.details.forEach(detail => console.log(`   ${detail}`));
    console.log('');
    
    // Overall Score
    const percentage = Math.round((this.results.overall.score / this.results.overall.maxScore) * 100);
    console.log('🏆 OVERALL SCORE:');
    console.log(`   ${this.results.overall.score}/${this.results.overall.maxScore} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('   🎉 EXCELLENT! Implementation is nearly complete.');
    } else if (percentage >= 70) {
      console.log('   👍 GOOD! Most improvements are implemented.');
    } else if (percentage >= 50) {
      console.log('   ⚠️  FAIR. More work needed to complete improvements.');
    } else {
      console.log('   ❌ POOR. Significant work required.');
    }
    
    console.log('\n💡 Next Steps:');
    if (this.results.cssValidation.failed > 0) {
      console.log('   - Complete CSS migration using: node scripts/css-migration-helper.js --migrate');
    }
    if (this.results.accessibility.failed > 0) {
      console.log('   - Install accessibility testing dependencies');
      console.log('   - Run accessibility tests');
    }
    if (this.results.apiDocumentation.failed > 0) {
      console.log('   - Add JSDoc comments to API endpoints');
    }
    if (this.results.errorHandling.failed > 0) {
      console.log('   - Update remaining API endpoints to use standardized responses');
    }
  }

  async run() {
    console.log('🔍 Starting Improvement Validation...\n');
    
    await this.validateCSS();
    await this.validateAPIDocumentation();
    await this.validateAccessibility();
    await this.validateErrorHandling();
    
    this.calculateOverallScore();
    this.generateReport();
    
    // Save report to file
    const reportPath = path.join(__dirname, '../docs/development/validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run validation
const validator = new ImprovementValidator();
validator.run().catch(console.error);