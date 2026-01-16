/**
 * EditorCore Tests
 */
// @ts-ignore: React is used for JSX
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditorCore } from '../../core/components/EditorCore';

describe('EditorCore', () => {
  it('should render contentEditable element', () => {
    render(<EditorCore />);
    
    const editor = screen.getByRole('textbox');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('contentEditable', 'true');
  });

  it('should be read-only when readOnly prop is true', () => {
    render(<EditorCore readOnly={true} />);
    
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('contentEditable', 'false');
  });

  it('should apply custom placeholder', () => {
    const placeholder = 'Custom placeholder';
    render(<EditorCore placeholder={placeholder} />);
    
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('data-placeholder', placeholder);
  });

  it('should handle spell check settings', () => {
    const { rerender } = render(<EditorCore spellCheckEnabled={true} />);
    
    let editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('spellCheck', 'true');
    expect(editor).toHaveClass('spell-check-enabled');

    rerender(<EditorCore spellCheckEnabled={false} />);
    
    editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('spellCheck', 'false');
    expect(editor).not.toHaveClass('spell-check-enabled');
  });

  it('should call event handlers', () => {
    const onInput = vi.fn();
    const onKeyDown = vi.fn();
    const onClick = vi.fn();
    
    render(
      <EditorCore 
        onInput={onInput}
        onKeyDown={onKeyDown}
        onClick={onClick}
      />
    );
    
    const editor = screen.getByRole('textbox');
    
    // Test input event
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onInput).toHaveBeenCalled();
    
    // Test click event
    editor.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(<EditorCore error="Test error" />);
    
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveAttribute('aria-label');
    expect(editor).toHaveAttribute('aria-multiline', 'true');
    expect(editor).toHaveAttribute('aria-describedby', 'editor-error');
    expect(editor).toHaveAttribute('tabIndex', '0');
  });

  it('should render help text for screen readers', () => {
    render(<EditorCore />);
    
    const helpText = document.getElementById('editor-help');
    expect(helpText).toBeInTheDocument();
    expect(helpText).toHaveClass('sr-only');
  });
});
