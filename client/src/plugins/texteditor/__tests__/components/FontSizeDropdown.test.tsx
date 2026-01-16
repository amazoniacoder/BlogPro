/**
 * Unit tests for FontSizeDropdown component
 */
// @ts-ignore: React is used for JSX
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FontSizeDropdown } from '../../core/components/FontSizeDropdown';

type FontSize = '8pt' | '10pt' | '12pt' | '14pt' | '18pt' | '24pt' | '36pt';

describe('FontSizeDropdown', () => {
  const mockOnFontSizeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    currentFontSize: '12pt' as FontSize,
    onFontSizeChange: mockOnFontSizeChange,
  };

  it('should render with current font size displayed', () => {
    render(<FontSizeDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toContain('12');
  });

  it('should open dropdown when clicked', () => {
    render(<FontSizeDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    const menu = screen.getByRole('listbox');
    expect(menu).toBeTruthy();
  });

  it('should call onFontSizeChange when option selected', () => {
    render(<FontSizeDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    const option = screen.getByText('18');
    fireEvent.click(option);
    
    expect(mockOnFontSizeChange).toHaveBeenCalledWith('18pt');
  });
});
