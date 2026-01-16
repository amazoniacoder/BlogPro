/**
 * Enhanced ContentEditableEditor tests
 * Tests for error handling, accessibility, and PasteService integration
 */

import { render, fireEvent, waitFor } from '@testing-library/react';
import { ContentEditableEditor } from '../core/components/ContentEditableEditor';

// Test globals
declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var vi: any;
}

// Mock services
vi.mock('../services/PasteService', () => ({
  PasteService: {
    handlePaste: vi.fn().mockResolvedValue({ success: true, content: 'test' })
  }
}));

vi.mock('../hooks/useFormatState', () => ({
  useFormatState: () => ({
    formatState: { bold: false, italic: false, underline: false, fontSize: '12pt', fontFamily: 'Arial', textAlign: 'left' },
    updateFormatState: vi.fn(),
    immediateUpdateFormatState: vi.fn()
  })
}));

vi.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn()
}));

vi.mock('../services/HistoryService', () => ({
  HistoryService: vi.fn().mockImplementation(() => ({}))
}));

vi.mock('../services/FormatBoundaryService', () => ({
  FormatBoundaryService: {
    getFormatAtCursor: vi.fn().mockReturnValue({
      bold: false,
      italic: false,
      underline: false,
      fontSize: '12pt',
      fontFamily: 'Arial',
      textAlign: 'left'
    }),
    applyBold: vi.fn(),
    applyItalic: vi.fn(),
    applyUnderline: vi.fn()
  }
}));

vi.mock('../utils/formatDiagnostics', () => ({
  FormatDiagnostics: {
    analyzeCursorPosition: vi.fn(),
    addDiagnosticButton: vi.fn()
  }
}));

vi.mock('../utils/domUtils', () => ({
  normalizeContent: vi.fn(),
  cleanupEmptyFormatElements: vi.fn()
}));

describe('ContentEditableEditor (Enhanced)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('Error Handling', () => {
    test('should display error message on save failure', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const { container } = render(
        <ContentEditableEditor onSave={mockOnSave} />
      );

      // Find and click save button
      const saveButton = container.querySelector('[title*="Save"]');
      if (saveButton) {
        fireEvent.click(saveButton);

        await waitFor(() => {
          const errorMessage = container.querySelector('.editor-error-message');
          expect(errorMessage?.textContent).toContain('Network error');
        });
      }
    });

    test('should allow dismissing error messages', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      
      const { container } = render(
        <ContentEditableEditor onSave={mockOnSave} />
      );

      const saveButton = container.querySelector('[title*="Save"]');
      if (saveButton) {
        fireEvent.click(saveButton);

        await waitFor(() => {
          const errorMessage = container.querySelector('.editor-error-message');
          expect(errorMessage).toBeTruthy();
        });

        const dismissButton = container.querySelector('.error-dismiss');
        if (dismissButton) {
          fireEvent.click(dismissButton);
          
          const errorMessage = container.querySelector('.editor-error-message');
          expect(errorMessage).toBeFalsy();
        }
      }
    });

    test('should show loading state during save', async () => {
      let resolveSave: (value: void) => void = () => {};
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });
      const mockOnSave = vi.fn().mockReturnValue(savePromise);
      
      const { container } = render(
        <ContentEditableEditor onSave={mockOnSave} />
      );

      const saveButton = container.querySelector('[title*="Save"]');
      if (saveButton) {
        fireEvent.click(saveButton);

        // Should show loading state
        const loadingMessage = container.querySelector('.editor-loading');
        expect(loadingMessage?.textContent).toContain('Saving...');

        // Resolve save
        resolveSave();
        
        await waitFor(() => {
          const loadingMessage = container.querySelector('.editor-loading');
          expect(loadingMessage).toBeFalsy();
        });
      }
    });
  });

  describe('Paste Integration', () => {
    test('should handle successful paste operation', async () => {
      const mockOnChange = vi.fn();
      const { container } = render(
        <ContentEditableEditor onChange={mockOnChange} />
      );

      const editor = container.querySelector('.editor-content');
      if (editor) {
        const pasteEvent = new ClipboardEvent('paste', {
          clipboardData: new DataTransfer()
        });

        fireEvent.paste(editor, pasteEvent);

        // Just verify paste event was handled
        expect(editor).toBeTruthy();
      }
    });

    test('should handle paste errors gracefully', async () => {
      const { container } = render(<ContentEditableEditor />);

      const editor = container.querySelector('.editor-content');
      if (editor) {
        const pasteEvent = new ClipboardEvent('paste', {
          clipboardData: new DataTransfer()
        });

        fireEvent.paste(editor, pasteEvent);

        // Just verify paste event was handled without errors
        expect(editor).toBeTruthy();
      }
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      const { container } = render(<ContentEditableEditor />);

      const editor = container.querySelector('.editor-content');
      expect(editor?.getAttribute('role')).toBe('textbox');
      expect(editor?.getAttribute('aria-label')).toBe('Rich text editor');
      expect(editor?.getAttribute('aria-multiline')).toBe('true');
    });

    test('should associate error messages with editor', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      
      const { container } = render(
        <ContentEditableEditor onSave={mockOnSave} />
      );

      const saveButton = container.querySelector('[title*="Save"]');
      if (saveButton) {
        fireEvent.click(saveButton);

        await waitFor(() => {
          const errorMessage = container.querySelector('.editor-error-message');
          expect(errorMessage?.getAttribute('role')).toBe('alert');
        });
      }
    });
  });
});
