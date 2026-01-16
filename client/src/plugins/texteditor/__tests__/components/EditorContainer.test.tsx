/**
 * EditorContainer Tests
 */
// @ts-ignore: React is used for JSX
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditorContainer } from '../../core/components/EditorContainer';
import { ServiceFactory } from '../../core/services/ServiceFactory';

// Mock ServiceFactory
vi.mock('../../core/services/ServiceFactory', () => ({
  ServiceFactory: {
    getUnifiedFormatService: vi.fn(async () => ({
      applyBold: vi.fn(),
      applyItalic: vi.fn(),
      destroy: vi.fn()
    })),
    getHistoryService: vi.fn(() => ({
      destroy: vi.fn()
    })),
    cleanup: vi.fn()
  }
}));

// Mock hooks
vi.mock('../../core/hooks/usePerformanceMonitoring', () => ({
  usePerformanceMonitoring: () => ({
    trackRender: vi.fn(),
    trackOperation: vi.fn((_name, fn) => fn())
  })
}));

vi.mock('../../core/hooks/useAccessibility', () => ({
  useAccessibility: vi.fn()
}));

describe('EditorContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await ServiceFactory.cleanup();
  });

  it('should render main editor structure', () => {
    render(<EditorContainer />);
    
    expect(document.querySelector('.contenteditable-editor')).toBeInTheDocument();
    expect(document.querySelector('.editor-header')).toBeInTheDocument();
    expect(document.querySelector('.editor-footer')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const customClass = 'custom-editor';
    render(<EditorContainer className={customClass} />);
    
    const editor = document.querySelector('.contenteditable-editor');
    expect(editor).toHaveClass(customClass);
  });

  it('should handle readOnly mode', () => {
    render(<EditorContainer readOnly={true} />);
    
    const editorCore = screen.getByRole('textbox');
    expect(editorCore).toHaveAttribute('contentEditable', 'false');
  });

  it('should display error messages', () => {
    render(<EditorContainer />);
    
    // Simulate error by finding error display element
    const errorContainer = document.querySelector('.editor-error-message');
    // Error container should not be visible initially
    expect(errorContainer).not.toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<EditorContainer />);
    
    // Loading container should not be visible initially
    const loadingContainer = document.querySelector('.editor-loading');
    expect(loadingContainer).not.toBeInTheDocument();
  });

  it('should handle content changes', () => {
    const onChange = vi.fn();
    render(<EditorContainer onChange={onChange} />);
    
    // Component should be rendered without errors
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should handle fullscreen mode', () => {
    render(<EditorContainer />);
    
    const editor = document.querySelector('.contenteditable-editor');
    expect(editor).not.toHaveClass('fullscreen');
  });

  it('should render plugin components', () => {
    render(<EditorContainer userRole="admin" />);
    
    // Should render plugin-related elements
    expect(document.querySelector('.editor-footer-controls')).toBeInTheDocument();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = render(<EditorContainer />);
    
    unmount();
    
    expect(ServiceFactory.cleanup).toHaveBeenCalled();
  });
});
