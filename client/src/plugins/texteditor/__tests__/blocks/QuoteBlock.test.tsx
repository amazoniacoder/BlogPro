// @ts-ignore: React is used for JSX
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuoteBlock } from '../../blocks/components/quote/QuoteBlock';

describe('QuoteBlock', () => {
  it('renders quote content correctly', () => {
    const quoteBlock = new QuoteBlock('test-id', 'quote', {
      content: 'Test quote content',
      author: 'Test Author'
    });

    render(quoteBlock.render());

    expect(screen.getByText('Test quote content')).toBeDefined();
    expect(screen.getByText('— Test Author')).toBeDefined();
  });

  it('renders without author', () => {
    const quoteBlock = new QuoteBlock('test-id', 'quote', {
      content: 'Test quote content'
    });

    render(quoteBlock.render());

    expect(screen.getByText('Test quote content')).toBeDefined();
    expect(screen.queryByText(/—/)).toBeNull();
  });

  it('serializes and deserializes correctly', () => {
    const quoteBlock = new QuoteBlock('test-id', 'quote', {
      content: 'Test content',
      author: 'Test Author'
    });

    const serialized = quoteBlock.serialize();
    const newBlock = new QuoteBlock('test-id-2', 'quote');
    newBlock.deserialize(serialized);

    expect(newBlock.data.content).toBe('Test content');
    expect(newBlock.data.author).toBe('Test Author');
  });
});
