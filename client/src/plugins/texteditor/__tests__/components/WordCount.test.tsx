/**
 * WordCount Component Tests
 * Following development methodology for comprehensive testing
 */
// @ts-ignore: React is used for JSX
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import WordCount from '../../core/components/WordCount';

describe('WordCount Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders with default props', () => {
      render(<WordCount content="hello world" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // word count
    });

    it('renders in compact mode', () => {
      render(<WordCount content="hello world" compact={true} />);
      
      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('word-count--compact');
    });

    it('applies custom className', () => {
      render(<WordCount content="test" className="custom-class" />);
      
      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('returns null when no stats to show', () => {
      const { container } = render(
        <WordCount 
          content="test" 
          showWords={false}
          showCharacters={false}
          showReadingTime={false}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Word Counting', () => {
    it('counts English words correctly', async () => {
      render(<WordCount content="hello world test" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('counts Russian words correctly', async () => {
      render(<WordCount content="привет мир тест" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('counts mixed language words correctly', async () => {
      render(<WordCount content="hello мир test тест" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument();
      });
    });

    it('does not count single characters as words', async () => {
      render(<WordCount content="a я 1" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });

    it('counts words with 2+ characters', async () => {
      render(<WordCount content="ab яя 12" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('handles HTML content correctly', async () => {
      render(<WordCount content="<p>hello</p><p>world</p>" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('handles empty content', async () => {
      render(<WordCount content="" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });
  });

  describe('Character Counting', () => {
    it('counts characters excluding spaces', async () => {
      render(<WordCount content="hello world" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument(); // "helloworld"
      });
    });

    it('counts Russian characters correctly', async () => {
      render(<WordCount content="привет мир" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('9')).toBeInTheDocument(); // "приветмир"
      });
    });
  });

  describe('Reading Time', () => {
    it('shows reading time for short content', async () => {
      render(<WordCount content="hello world" readingSpeed={200} />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('< 1 min read')).toBeInTheDocument();
      });
    });

    it('calculates reading time correctly', async () => {
      const longContent = Array(400).fill('word').join(' '); // 400 words
      render(<WordCount content={longContent} readingSpeed={200} />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('2 min read')).toBeInTheDocument();
      });
    });

    it('uses custom reading speed', async () => {
      const longContent = Array(100).fill('word').join(' '); // 100 words
      render(<WordCount content={longContent} readingSpeed={100} />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('1 min read')).toBeInTheDocument();
      });
    });
  });

  describe('Display Options', () => {
    it('shows only words when other options disabled', async () => {
      render(
        <WordCount 
          content="hello world"
          showWords={true}
          showCharacters={false}
          showReadingTime={false}
        />
      );
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.queryByText('10')).not.toBeInTheDocument();
        expect(screen.queryByText('< 1 min read')).not.toBeInTheDocument();
      });
    });

    it('shows paragraphs and sentences when enabled', async () => {
      render(
        <WordCount 
          content="Hello world. This is a test."
          showParagraphs={true}
          showSentences={true}
        />
      );
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // paragraphs
        expect(screen.getByText('2')).toBeInTheDocument(); // sentences
      });
    });
  });

  describe('Tooltips', () => {
    it('shows word count tooltip', async () => {
      render(<WordCount content="hello world" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        const wordStat = screen.getByText('2').closest('.word-count__stat');
        expect(wordStat).toHaveAttribute('title', 'Word count: 2 words in this document');
      });
    });

    it('shows character count tooltip', async () => {
      render(<WordCount content="hello world" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        const charStat = screen.getByText('10').closest('.word-count__stat');
        expect(charStat).toHaveAttribute('title', 'Character count: 10 characters (excluding spaces)');
      });
    });

    it('shows reading time tooltip with speed', async () => {
      render(<WordCount content="hello world" readingSpeed={250} />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        const readingStat = screen.getByText('< 1 min read').closest('.word-count__stat');
        expect(readingStat).toHaveAttribute('title', 'Estimated reading time: < 1 min read at 250 words per minute');
      });
    });
  });

  describe('Debouncing', () => {
    it('debounces updates with default delay', async () => {
      const { rerender } = render(<WordCount content="hello" />);
      
      rerender(<WordCount content="hello world" />);
      rerender(<WordCount content="hello world test" />);
      
      // Should not update immediately
      expect(screen.queryByText('3')).not.toBeInTheDocument();
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('uses custom update delay', async () => {
      const { rerender } = render(<WordCount content="hello" updateDelay={500} />);
      
      rerender(<WordCount content="hello world" updateDelay={500} />);
      
      vi.advanceTimersByTime(300);
      expect(screen.queryByText('2')).not.toBeInTheDocument();
      
      vi.advanceTimersByTime(200);
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  describe('Callbacks', () => {
    it('calls onStatsChange when stats update', async () => {
      const mockCallback = vi.fn();
      
      render(<WordCount content="hello world" onStatsChange={mockCallback} />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            words: 2,
            charactersNoSpaces: 10,
            readingTime: 1
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<WordCount content="hello world" />);
      
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(status).toHaveAttribute('aria-label', 'Document statistics');
    });

    it('has proper ARIA labels for values', async () => {
      render(<WordCount content="hello world" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        const wordValue = screen.getByText('2');
        expect(wordValue).toHaveAttribute('aria-label', 'words: 2');
      });
    });

    it('hides labels from screen readers in compact mode', () => {
      render(<WordCount content="hello world" compact={true} />);
      
      // In compact mode, labels should not be present
      expect(screen.queryByText('words')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles service errors gracefully', async () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock TextAnalysisService to throw error
      vi.doMock('../../core/services/TextAnalysisService', () => ({
        TextAnalysisService: {
          analyzeText: vi.fn().mockImplementation(() => {
            throw new Error('Service error');
          })
        }
      }));
      
      render(<WordCount content="hello world" />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        // Should fall back to basic counting
        expect(screen.getByText('2')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Number Formatting', () => {
    it('formats large numbers with commas', async () => {
      const longContent = Array(1500).fill('word').join(' '); // 1500 words
      render(<WordCount content={longContent} />);
      
      vi.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText('1,500')).toBeInTheDocument();
      });
    });
  });
});
