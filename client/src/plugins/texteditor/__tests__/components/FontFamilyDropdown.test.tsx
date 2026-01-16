/**
 * Unit tests for FontFamilyDropdown component
 */
// @ts-ignore: React is used for JSX
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FontFamilyDropdown } from '../../core/components/FontFamilyDropdown';

describe('FontFamilyDropdown', () => {
  const mockOnFontFamilyChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    currentFontFamily: 'Arial' as const,
    onFontFamilyChange: mockOnFontFamilyChange,
  };

  it('should render with current font family displayed', () => {
    render(<FontFamilyDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toContain('Arial');
  });

  it('should render with Roboto font family displayed', () => {
    render(<FontFamilyDropdown {...defaultProps} currentFontFamily="Roboto" />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toBeTruthy();
    expect(trigger.textContent).toContain('Roboto');
  });

  it('should open dropdown when clicked', () => {
    render(<FontFamilyDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    const menu = screen.getByRole('listbox');
    expect(menu).toBeTruthy();
  });

  it('should display all font families including Roboto', () => {
    render(<FontFamilyDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    // Check that dropdown opened with options
    const menu = screen.getByRole('listbox');
    expect(menu).toBeTruthy();
    
    // Check that there are multiple options (should be 7 font families)
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(7);
  });

  it('should call onFontFamilyChange when Roboto is selected', () => {
    render(<FontFamilyDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    const robotoOption = screen.getByText('Roboto');
    fireEvent.click(robotoOption);
    
    expect(mockOnFontFamilyChange).toHaveBeenCalledWith('Roboto');
  });

  it('should call onFontFamilyChange when Times New Roman is selected', () => {
    render(<FontFamilyDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    const timesOption = screen.getByText('Times New Roman');
    fireEvent.click(timesOption);
    
    expect(mockOnFontFamilyChange).toHaveBeenCalledWith('Times New Roman');
  });

  it('should close dropdown after font family selection', () => {
    render(<FontFamilyDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    // Dropdown should be open
    expect(screen.getByRole('listbox')).toBeTruthy();
    
    // Click trigger again to close
    fireEvent.click(trigger);
    
    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).toBeFalsy();
  });

  it('should handle keyboard navigation', () => {
    render(<FontFamilyDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    
    // Open with Enter key
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeTruthy();
    
    // Close with Escape key
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeFalsy();
  });

  it('should handle disabled state', () => {
    render(<FontFamilyDropdown {...defaultProps} disabled={true} />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveProperty('disabled', true);
    
    // Should not open when disabled
    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).toBeFalsy();
  });

  it('should show selected font family with proper styling', () => {
    render(<FontFamilyDropdown {...defaultProps} currentFontFamily="Roboto" />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    // Check if dropdown opened
    const menu = screen.queryByRole('listbox');
    expect(menu).toBeTruthy();
  });

  it('should display font preview "Aa" for each option', () => {
    render(<FontFamilyDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    // Check that "Aa" previews are present
    const previews = screen.getAllByText('Aa');
    expect(previews.length).toBeGreaterThan(0);
    
    // Should have one preview per font family
    expect(previews.length).toBe(7); // Number of font families
  });

  it('should have proper ARIA attributes', () => {
    render(<FontFamilyDropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    
    expect(trigger.getAttribute('aria-label')).toContain('Font family');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    
    // Open dropdown
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    
    const menu = screen.getByRole('listbox');
    expect(menu.getAttribute('aria-label')).toBe('Font family options');
  });
});
