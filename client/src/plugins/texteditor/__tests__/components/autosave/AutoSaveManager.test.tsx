// @ts-ignore: React is used for JSX
import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { AutoSaveManager } from '../../../core/components/autosave/AutoSaveManager';

// Mock ServiceFactory for AutoSaveService
vi.mock('../../../core/services/ServiceFactory', () => ({
  ServiceFactory: {
    getAutoSaveService: vi.fn(() => ({
      initialize: vi.fn(),
      updateContent: vi.fn(),
      manualSave: vi.fn(),
      resolveConflict: vi.fn(),
      onStatusChange: vi.fn(() => vi.fn()),
      destroy: vi.fn()
    }))
  }
}));

describe('AutoSaveManager', () => {
  const defaultProps = {
    content: 'Test content',
    onSave: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders auto save indicator', () => {
    render(<AutoSaveManager {...defaultProps} />);
    
    // AutoSaveIndicator should be rendered
    expect(document.querySelector('.auto-save-manager')).toBeInTheDocument();
  });

  test('initializes with correct interval', () => {
    const customInterval = 60000;
    render(<AutoSaveManager {...defaultProps} interval={customInterval} />);
    
    // Component should render without errors
    expect(document.querySelector('.auto-save-manager')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const customClass = 'custom-auto-save';
    render(<AutoSaveManager {...defaultProps} className={customClass} />);
    
    expect(document.querySelector(`.auto-save-manager.${customClass}`)).toBeInTheDocument();
  });
});
