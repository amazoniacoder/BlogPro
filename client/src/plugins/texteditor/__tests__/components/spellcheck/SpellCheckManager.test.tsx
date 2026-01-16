// @ts-ignore: React is used for JSX
import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SpellCheckManager } from '../../../core/components/spellcheck/SpellCheckManager';

// Mock ServiceFactory for consolidated architecture
vi.mock('../../../core/services/ServiceFactory', () => ({
  ServiceFactory: {
    getSpellCheckService: vi.fn(() => ({
      initialize: vi.fn(),
      enableSpellCheck: vi.fn(),
      disableSpellCheck: vi.fn(),
      destroy: vi.fn()
    })),
    getDictionaryService: vi.fn(() => ({
      initialize: vi.fn(),
      addWord: vi.fn(),
      destroy: vi.fn()
    })),
    getLanguageDetectionService: vi.fn(() => ({
      detectLanguage: vi.fn(() => ({ language: 'en', confidence: 0.9 }))
    }))
  }
}));

describe('SpellCheckManager', () => {
  const defaultProps = {
    editorRef: createRef<HTMLDivElement>(),
    content: 'Test content',
    onContentChange: vi.fn(),
    enabled: true,
    onEnabledChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders spell check controls', () => {
    render(<SpellCheckManager {...defaultProps} />);
    
    expect(screen.getByText('Spell Check')).toBeInTheDocument();
    expect(screen.getByText('Dictionary')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('toggles spell check when button clicked', () => {
    const onEnabledChange = vi.fn();
    
    render(
      <SpellCheckManager 
        {...defaultProps} 
        enabled={false}
        onEnabledChange={onEnabledChange}
      />
    );
    
    fireEvent.click(screen.getByText('Spell Check'));
    expect(onEnabledChange).toHaveBeenCalledWith(true);
  });

  test('shows language indicator when enabled', () => {
    render(<SpellCheckManager {...defaultProps} enabled={true} />);
    
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  test('hides additional controls when disabled', () => {
    render(<SpellCheckManager {...defaultProps} enabled={false} />);
    
    expect(screen.queryByText('Dictionary')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });
});
