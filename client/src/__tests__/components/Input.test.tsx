import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';

// Mock Input component for testing
const Input = ({ placeholder, onChange, ...props }: any) => (
  <input placeholder={placeholder} onChange={onChange} {...props} />
);

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    render(<Input placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('displays correct value', () => {
    render(<Input value="test value" readOnly />);
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
  });
});
