/**
 * BlogPro Accessibility Testing Suite
 * Automated accessibility testing utilities
 */

import React from 'react';

export interface AccessibilityIssue {
  type: 'error' | 'warning';
  rule: string;
  element: string;
  message: string;
  suggestion: string;
}

export class AccessibilityTester {
  private issues: AccessibilityIssue[] = [];

  // Test for missing alt text on images
  testImageAltText(container: HTMLElement): AccessibilityIssue[] {
    const images = container.querySelectorAll('img');
    const issues: AccessibilityIssue[] = [];

    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push({
          type: 'error',
          rule: 'WCAG 1.1.1',
          element: `img[${index}]`,
          message: 'Image missing alt text',
          suggestion: 'Add alt attribute or aria-label to describe the image'
        });
      }
    });

    return issues;
  }

  // Test for proper heading hierarchy
  testHeadingHierarchy(container: HTMLElement): AccessibilityIssue[] {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues: AccessibilityIssue[] = [];
    let previousLevel = 0;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        issues.push({
          type: 'warning',
          rule: 'WCAG 1.3.1',
          element: heading.tagName.toLowerCase(),
          message: 'Page should start with h1',
          suggestion: 'Use h1 for the main page heading'
        });
      }
      
      if (level > previousLevel + 1) {
        issues.push({
          type: 'error',
          rule: 'WCAG 1.3.1',
          element: heading.tagName.toLowerCase(),
          message: `Heading level skipped from h${previousLevel} to h${level}`,
          suggestion: 'Use sequential heading levels'
        });
      }
      
      previousLevel = level;
    });

    return issues;
  }

  // Test for keyboard accessibility
  testKeyboardAccessibility(container: HTMLElement): AccessibilityIssue[] {
    const interactive = container.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    const issues: AccessibilityIssue[] = [];

    interactive.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          type: 'warning',
          rule: 'WCAG 2.4.3',
          element: `${element.tagName.toLowerCase()}[${index}]`,
          message: 'Positive tabindex found',
          suggestion: 'Use tabindex="0" or remove tabindex for natural tab order'
        });
      }

      if (element.tagName === 'A' && !element.getAttribute('href')) {
        issues.push({
          type: 'error',
          rule: 'WCAG 2.1.1',
          element: `a[${index}]`,
          message: 'Link without href attribute',
          suggestion: 'Add href attribute or use button element instead'
        });
      }
    });

    return issues;
  }

  // Test for ARIA attributes
  testAriaAttributes(container: HTMLElement): AccessibilityIssue[] {
    const elementsWithAria = container.querySelectorAll('[aria-labelledby], [aria-describedby]');
    const issues: AccessibilityIssue[] = [];

    elementsWithAria.forEach((element, index) => {
      const labelledBy = element.getAttribute('aria-labelledby');
      const describedBy = element.getAttribute('aria-describedby');

      if (labelledBy && !container.querySelector(`#${labelledBy}`)) {
        issues.push({
          type: 'error',
          rule: 'WCAG 1.3.1',
          element: `${element.tagName.toLowerCase()}[${index}]`,
          message: `aria-labelledby references non-existent element: ${labelledBy}`,
          suggestion: 'Ensure referenced element exists or remove aria-labelledby'
        });
      }

      if (describedBy && !container.querySelector(`#${describedBy}`)) {
        issues.push({
          type: 'error',
          rule: 'WCAG 1.3.1',
          element: `${element.tagName.toLowerCase()}[${index}]`,
          message: `aria-describedby references non-existent element: ${describedBy}`,
          suggestion: 'Ensure referenced element exists or remove aria-describedby'
        });
      }
    });

    return issues;
  }

  // Test color contrast (simplified)
  testColorContrast(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a');

    textElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      
      // Simplified check - in real implementation, you'd calculate actual contrast ratio
      if (fontSize < 14 && fontWeight < '600') {
        issues.push({
          type: 'warning',
          rule: 'WCAG 1.4.3',
          element: `${element.tagName.toLowerCase()}[${index}]`,
          message: 'Small text may have insufficient contrast',
          suggestion: 'Ensure contrast ratio is at least 4.5:1 for normal text'
        });
      }
    });

    return issues;
  }

  // Run all tests
  runAllTests(container: HTMLElement): AccessibilityIssue[] {
    this.issues = [];
    
    this.issues.push(...this.testImageAltText(container));
    this.issues.push(...this.testHeadingHierarchy(container));
    this.issues.push(...this.testKeyboardAccessibility(container));
    this.issues.push(...this.testAriaAttributes(container));
    this.issues.push(...this.testColorContrast(container));

    return this.issues;
  }

  // Generate report
  generateReport(): string {
    const errors = this.issues.filter(issue => issue.type === 'error');
    const warnings = this.issues.filter(issue => issue.type === 'warning');

    let report = '♿ Accessibility Test Report\n';
    report += '===========================\n\n';
    report += `Total Issues: ${this.issues.length}\n`;
    report += `Errors: ${errors.length}\n`;
    report += `Warnings: ${warnings.length}\n\n`;

    if (errors.length > 0) {
      report += '🚨 ERRORS:\n';
      errors.forEach((error, index) => {
        report += `${index + 1}. ${error.message}\n`;
        report += `   Rule: ${error.rule}\n`;
        report += `   Element: ${error.element}\n`;
        report += `   Fix: ${error.suggestion}\n\n`;
      });
    }

    if (warnings.length > 0) {
      report += '⚠️  WARNINGS:\n';
      warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning.message}\n`;
        report += `   Rule: ${warning.rule}\n`;
        report += `   Element: ${warning.element}\n`;
        report += `   Suggestion: ${warning.suggestion}\n\n`;
      });
    }

    if (this.issues.length === 0) {
      report += '✅ No accessibility issues found!\n';
    }

    return report;
  }
}

// React component for accessibility testing
export const AccessibilityTestRunner: React.FC<{
  children: React.ReactNode;
  onResults?: (issues: AccessibilityIssue[]) => void;
}> = ({ children, onResults }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current && process.env.NODE_ENV === 'development') {
      const tester = new AccessibilityTester();
      const issues = tester.runAllTests(containerRef.current);
      
      if (issues.length > 0) {
        console.group('♿ Accessibility Issues Found');
        console.log(tester.generateReport());
        console.groupEnd();
      }
      
      onResults?.(issues);
    }
  }, [onResults]);

  return <div ref={containerRef}>{children}</div>;
};
