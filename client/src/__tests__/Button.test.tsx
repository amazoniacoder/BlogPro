import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { Button } from '@/ui-system/components/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies correct variant class', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button--secondary');
  });

  it('renders as link when href provided', () => {
   
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
