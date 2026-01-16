/**
 * Toolbar Tests
 * Tests for the professional editor toolbar with service integration
 */
// @ts-ignore: React is used for JSX
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Toolbar } from '../core/components/Toolbar';
// Test globals
declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
}

describe('Toolbar', () => {
  const mockFormatState = {
    bold: false,
    italic: false,
    underline: false,
    fontSize: '12pt' as const,
    fontFamily: 'Arial' as const,
    textAlign: 'left' as const
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('renders all toolbar buttons', () => {
    render(
      <Toolbar 
        formatState={mockFormatState}
        onCommand={() => {}}
      />
    );
    
    expect(document.querySelector('[title*="Bold"]')).toBeTruthy();
    expect(document.querySelector('[title*="Italic"]')).toBeTruthy();
    expect(document.querySelector('[title*="Underline"]')).toBeTruthy();
    expect(document.querySelector('[title*="Undo"]')).toBeTruthy();
    expect(document.querySelector('[title*="Redo"]')).toBeTruthy();
    // Save button removed - now handled by AutoSave Indicator
  });

  test('shows active state for formatted text', () => {
    const activeFormatState = {
      ...mockFormatState,
      bold: true,
      italic: true
    };
    
    render(
      <Toolbar 
        formatState={activeFormatState}
        onCommand={() => {}}
      />
    );
    
    const boldButton = document.querySelector('[title*="Bold"]');
    const italicButton = document.querySelector('[title*="Italic"]');
    
    expect(boldButton?.classList.contains('active')).toBe(true);
    expect(italicButton?.classList.contains('active')).toBe(true);
  });

  test('handles format commands through onCommand callback', () => {
    let commandCalled = '';
    const mockOnCommand = (command: string) => { commandCalled = command; };
    
    render(
      <Toolbar 
        formatState={mockFormatState}
        onCommand={mockOnCommand}
      />
    );
    
    const boldButton = document.querySelector('[title*="Bold"]')!;
    fireEvent.click(boldButton);
    
    expect(commandCalled).toBe('bold');
  });

  test('calls onCommand for non-format commands', () => {
    let commandCalled = false;
    const mockOnCommand = () => { commandCalled = true; };
    
    render(
      <Toolbar 
        formatState={mockFormatState}
        onCommand={mockOnCommand}
      />
    );
    
    const undoButton = document.querySelector('[title*="Undo"]')!;
    fireEvent.click(undoButton);
    
    expect(commandCalled).toBe(true);
  });

  // Save button test removed - save functionality now handled by AutoSave Indicator

  test('handles font size selection', () => {
    render(
      <Toolbar 
        formatState={mockFormatState}
        onCommand={() => {}}
      />
    );
    
    // Test that FontSizeDropdown is rendered
    const fontSizeDropdown = document.querySelector('.font-size-dropdown');
    expect(fontSizeDropdown).toBeTruthy();
    
    // Test that the dropdown shows current font size
    const trigger = document.querySelector('.font-size-dropdown__trigger');
    expect(trigger?.textContent).toContain('12');
  });
});
