/**
 * Integration test for spell check word replacement functionality
 */


import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SpellCheckIndicator from '../../core/components/SpellCheckIndicator';

// Mock ServiceFactory for consolidated services
vi.mock('../../core/services/ServiceFactory', () => ({
  ServiceFactory: {
    getSpellCheckService: vi.fn(() => ({
      checkText: vi.fn().mockResolvedValue({
        errors: [{ word: 'teh', start: 0, end: 3, type: 'spelling', suggestions: [], language: 'en', confidence: 0.8 }],
        language: 'en',
        confidence: 0.9,
        processedAt: new Date()
      }),
      getSuggestions: vi.fn().mockResolvedValue(['the']),
      learnCorrection: vi.fn()
    })),
    getGrammarCheckService: vi.fn(() => ({
      checkTextWithGrammar: vi.fn().mockResolvedValue({
        spelling: { errors: [{ word: 'teh', start: 0, end: 3, type: 'spelling', suggestions: [], language: 'en', confidence: 0.8 }] },
        grammar: { errors: [], language: 'en' }
      })
    })),
    getTextReplacementService: vi.fn(() => ({
      replaceSpellError: vi.fn().mockReturnValue(true)
    }))
  }
}));

describe('Spell Check Word Replacement Integration', () => {
  let mockOnCorrection: ReturnType<typeof vi.fn>;
  let editorElement: HTMLDivElement;

  beforeEach(() => {
    mockOnCorrection = vi.fn();
    
    // Create editor element with misspelled word
    editorElement = document.createElement('div');
    editorElement.className = 'editor-content';
    editorElement.innerHTML = '<p>teh quick brown fox</p>';
    document.body.appendChild(editorElement);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should replace misspelled word when suggestion is clicked', async () => {
    render(
      <SpellCheckIndicator
        editorElement={editorElement}
        content="teh quick brown fox"
        language="en"
        enabled={true}
        onCorrection={mockOnCorrection}
      />
    );

    // Wait for spell check to complete and errors to be highlighted
    await waitFor(() => {
      const errorElement = editorElement.querySelector('.spell-error-highlight');
      expect(errorElement).toBeTruthy();
    });

    // Click on the highlighted error
    const errorElement = editorElement.querySelector('.spell-error-highlight') as HTMLElement;
    fireEvent.click(errorElement);

    // Wait for suggestion popup to appear
    await waitFor(() => {
      expect(screen.getByText('the')).toBeInTheDocument();
    });

    // Click on the suggestion
    const suggestionButton = screen.getByText('the');
    fireEvent.click(suggestionButton);

    // Verify the correction callback was called
    expect(mockOnCorrection).toHaveBeenCalledWith('teh', 'the');
  });
});
