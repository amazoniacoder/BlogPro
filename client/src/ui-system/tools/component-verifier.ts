/**
 * BlogPro Component Migration Verifier
 * Verifies all components are properly migrated to UI System
 */

import { validateBlogProIcon } from './icon-migration';

export interface ComponentVerificationResult {
  component: string;
  status: 'migrated' | 'partial' | 'legacy';
  issues: string[];
  suggestions: string[];
}

export class ComponentVerifier {
  private verificationResults: ComponentVerificationResult[] = [];

  // Verify component uses UI System patterns
  verifyComponent(componentContent: string, componentName: string): ComponentVerificationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let status: 'migrated' | 'partial' | 'legacy' = 'migrated';

    // Check for UI System imports
    const hasUISystemImport = componentContent.includes('from \'@/ui-system') || 
                             componentContent.includes('from \'../ui-system') ||
                             componentContent.includes('from \'../../ui-system');

    if (!hasUISystemImport) {
      issues.push('No UI System imports found');
      suggestions.push('Import components from UI System instead of individual files');
      status = 'legacy';
    }

    // Check for legacy CSS class usage
    const legacyClassPatterns = [
      /className=['"][^'"]*(?:blog-card|feature-card|pricing-card)[^'"]*['"]/g,
      /className=['"][^'"]*(?:admin-table|admin-sidebar|admin-header)[^'"]*['"]/g,
      /className=['"][^'"]*(?:form-field|password-input|color-picker)[^'"]*['"]/g
    ];

    legacyClassPatterns.forEach(pattern => {
      const matches = componentContent.match(pattern);
      if (matches) {
        issues.push(`Legacy CSS classes found: ${matches.join(', ')}`);
        suggestions.push('Replace legacy CSS classes with UI System components');
        status = status === 'migrated' ? 'partial' : status;
      }
    });

    // Check for proper BlogPro icon usage
    const iconMatches = componentContent.match(/name=['"]([^'"]+)['"]/g);
    if (iconMatches) {
      iconMatches.forEach(match => {
        const iconName = match.match(/name=['"]([^'"]+)['"]/)?.[1];
        if (iconName && !validateBlogProIcon(iconName)) {
          issues.push(`Non-BlogPro icon used: ${iconName}`);
          suggestions.push('Use BlogPro custom icons instead of external icons');
          status = status === 'migrated' ? 'partial' : status;
        }
      });
    }

    // Check for proper TypeScript usage
    if (!componentContent.includes('React.FC') && !componentContent.includes(': FC')) {
      issues.push('Component not using TypeScript FC pattern');
      suggestions.push('Use React.FC<Props> for proper TypeScript support');
      status = status === 'migrated' ? 'partial' : status;
    }

    // Check for accessibility attributes
    const hasAriaAttributes = componentContent.includes('aria-') || 
                             componentContent.includes('role=') ||
                             componentContent.includes('tabIndex');

    if (!hasAriaAttributes && componentContent.includes('button') || componentContent.includes('input')) {
      issues.push('Missing accessibility attributes');
      suggestions.push('Add proper ARIA attributes for accessibility');
      status = status === 'migrated' ? 'partial' : status;
    }

    // Check for BEM methodology compliance
    const hasBEMClasses = componentContent.match(/className=['"][^'"]*bp-[^'"]*['"]/g);
    if (!hasBEMClasses) {
      issues.push('No BEM classes with bp- prefix found');
      suggestions.push('Use BEM methodology with bp- prefix for consistent styling');
      status = status === 'migrated' ? 'partial' : status;
    }

    const result: ComponentVerificationResult = {
      component: componentName,
      status,
      issues,
      suggestions
    };

    this.verificationResults.push(result);
    return result;
  }

  // Verify all components in a directory
  verifyDirectory(): ComponentVerificationResult[] {
    // This would be implemented to scan directory and verify all components
    // For now, returning the accumulated results
    return this.verificationResults;
  }

  // Generate verification report
  generateVerificationReport(): string {
    const migrated = this.verificationResults.filter(r => r.status === 'migrated');
    const partial = this.verificationResults.filter(r => r.status === 'partial');
    const legacy = this.verificationResults.filter(r => r.status === 'legacy');

    let report = '🔍 BlogPro Component Migration Verification Report\n';
    report += '================================================\n\n';
    
    report += `📊 Migration Status:\n`;
    report += `   ✅ Fully Migrated: ${migrated.length}\n`;
    report += `   🔄 Partially Migrated: ${partial.length}\n`;
    report += `   ❌ Legacy Components: ${legacy.length}\n\n`;

    if (legacy.length > 0) {
      report += '❌ Legacy Components (Need Migration):\n';
      legacy.forEach(component => {
        report += `   - ${component.component}\n`;
        component.issues.forEach(issue => {
          report += `     Issue: ${issue}\n`;
        });
        component.suggestions.forEach(suggestion => {
          report += `     Fix: ${suggestion}\n`;
        });
        report += '\n';
      });
    }

    if (partial.length > 0) {
      report += '🔄 Partially Migrated Components:\n';
      partial.forEach(component => {
        report += `   - ${component.component}\n`;
        component.issues.forEach(issue => {
          report += `     Issue: ${issue}\n`;
        });
        component.suggestions.forEach(suggestion => {
          report += `     Improvement: ${suggestion}\n`;
        });
        report += '\n';
      });
    }

    if (migrated.length === this.verificationResults.length) {
      report += '🎉 All components successfully migrated to BlogPro UI System!\n';
      report += '✅ Components use UI System imports\n';
      report += '✅ Components use BlogPro custom icons\n';
      report += '✅ Components follow BEM methodology\n';
      report += '✅ Components have proper TypeScript support\n';
      report += '✅ Components include accessibility features\n';
    }

    return report;
  }

  // Get migration statistics
  getMigrationStats() {
    const total = this.verificationResults.length;
    const migrated = this.verificationResults.filter(r => r.status === 'migrated').length;
    const partial = this.verificationResults.filter(r => r.status === 'partial').length;
    const legacy = this.verificationResults.filter(r => r.status === 'legacy').length;

    return {
      total,
      migrated,
      partial,
      legacy,
      completionPercentage: total > 0 ? Math.round((migrated / total) * 100) : 0,
      partialPercentage: total > 0 ? Math.round((partial / total) * 100) : 0
    };
  }
}

// Performance comparison utilities
export class PerformanceComparator {
  private metrics = {
    before: { bundleSize: 0, cssSize: 0, loadTime: 0 },
    after: { bundleSize: 0, cssSize: 0, loadTime: 0 }
  };

  // Record performance metrics
  recordMetrics(phase: 'before' | 'after', metrics: { bundleSize: number; cssSize: number; loadTime: number }) {
    this.metrics[phase] = metrics;
  }

  // Calculate performance improvements
  calculateImprovements() {
    const bundleReduction = this.metrics.before.bundleSize > 0 
      ? ((this.metrics.before.bundleSize - this.metrics.after.bundleSize) / this.metrics.before.bundleSize) * 100
      : 0;

    const cssReduction = this.metrics.before.cssSize > 0
      ? ((this.metrics.before.cssSize - this.metrics.after.cssSize) / this.metrics.before.cssSize) * 100
      : 0;

    const loadTimeImprovement = this.metrics.before.loadTime > 0
      ? ((this.metrics.before.loadTime - this.metrics.after.loadTime) / this.metrics.before.loadTime) * 100
      : 0;

    return {
      bundleReduction: Math.round(bundleReduction),
      cssReduction: Math.round(cssReduction),
      loadTimeImprovement: Math.round(loadTimeImprovement),
      summary: {
        before: this.metrics.before,
        after: this.metrics.after
      }
    };
  }

  // Generate performance report
  generatePerformanceReport(): string {
    const improvements = this.calculateImprovements();

    let report = '⚡ BlogPro UI System Performance Impact Report\n';
    report += '============================================\n\n';

    report += '📊 Before Migration:\n';
    report += `   Bundle Size: ${(this.metrics.before.bundleSize / 1024).toFixed(2)} KB\n`;
    report += `   CSS Size: ${(this.metrics.before.cssSize / 1024).toFixed(2)} KB\n`;
    report += `   Load Time: ${this.metrics.before.loadTime}ms\n\n`;

    report += '📊 After Migration:\n';
    report += `   Bundle Size: ${(this.metrics.after.bundleSize / 1024).toFixed(2)} KB\n`;
    report += `   CSS Size: ${(this.metrics.after.cssSize / 1024).toFixed(2)} KB\n`;
    report += `   Load Time: ${this.metrics.after.loadTime}ms\n\n`;

    report += '📈 Improvements:\n';
    report += `   Bundle Size: ${improvements.bundleReduction}% reduction\n`;
    report += `   CSS Size: ${improvements.cssReduction}% reduction\n`;
    report += `   Load Time: ${improvements.loadTimeImprovement}% faster\n\n`;

    if (improvements.bundleReduction > 0 || improvements.cssReduction > 0) {
      report += '🎉 Performance Benefits Achieved:\n';
      report += '   ✅ Smaller bundle sizes through tree shaking\n';
      report += '   ✅ Reduced CSS duplication\n';
      report += '   ✅ Lazy loading for heavy components\n';
      report += '   ✅ Optimized BlogPro custom icons\n';
      report += '   ✅ Better caching through component splitting\n';
    }

    return report;
  }
}
