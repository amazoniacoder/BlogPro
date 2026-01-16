/**
 * BlogPro Bundle Analyzer
 * Component bundle size analysis tool
 */

const fs = require('fs');
const path = require('path');

class BundleAnalyzer {
  constructor() {
    this.componentSizes = new Map();
    this.totalSize = 0;
  }

  analyzeComponent(componentPath) {
    try {
      const stats = fs.statSync(componentPath);
      const size = stats.size;
      const name = path.basename(componentPath, '.tsx');
      
      this.componentSizes.set(name, size);
      this.totalSize += size;
      
      return { name, size };
    } catch (error) {
      console.warn(`Could not analyze ${componentPath}:`, error.message);
      return null;
    }
  }

  analyzeDirectory(dirPath) {
    const results = [];
    
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          results.push(...this.analyzeDirectory(filePath));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          const result = this.analyzeComponent(filePath);
          if (result) results.push(result);
        }
      }
    } catch (error) {
      console.error(`Error analyzing directory ${dirPath}:`, error.message);
    }
    
    return results;
  }

  generateReport() {
    const sortedComponents = Array.from(this.componentSizes.entries())
      .sort(([,a], [,b]) => b - a);
    
    console.log('\n📊 UI System Bundle Analysis Report\n');
    console.log('Component Sizes (largest first):');
    console.log('================================');
    
    sortedComponents.forEach(([name, size]) => {
      const sizeKB = (size / 1024).toFixed(2);
      const percentage = ((size / this.totalSize) * 100).toFixed(1);
      console.log(`${name.padEnd(30)} ${sizeKB.padStart(8)} KB (${percentage}%)`);
    });
    
    console.log('================================');
    console.log(`Total Size: ${(this.totalSize / 1024).toFixed(2)} KB`);
    console.log(`Components: ${this.componentSizes.size}`);
    
    // Identify optimization opportunities
    const largeComponents = sortedComponents
      .filter(([, size]) => size > 5000)
      .map(([name]) => name);
    
    if (largeComponents.length > 0) {
      console.log('\n🎯 Optimization Opportunities:');
      console.log('Large components (>5KB) that could benefit from lazy loading:');
      largeComponents.forEach(name => console.log(`- ${name}`));
    }
    
    return {
      totalSize: this.totalSize,
      componentCount: this.componentSizes.size,
      largestComponents: sortedComponents.slice(0, 10),
      optimizationCandidates: largeComponents
    };
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  const uiSystemPath = path.join(__dirname, '..');
  
  console.log('Analyzing UI System components...');
  analyzer.analyzeDirectory(uiSystemPath);
  analyzer.generateReport();
}

module.exports = BundleAnalyzer;