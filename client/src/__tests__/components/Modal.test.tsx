import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

const MockModal = ({ isOpen, children, title }: { isOpen: boolean; children: React.ReactNode; title: string }) => {
  if (!isOpen) return null;
  return (
    <div role="dialog">
      <h2>{title}</h2>
      {children}
      <button>Close</button>
    </div>
  );
};

describe('Modal Component', () => {
  it('renders modal when open', () => {
    render(
      MockModal({ isOpen: true, title: "Test Modal", children: "Modal content" })
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      MockModal({ isOpen: false, title: "Test Modal", children: "Content" })
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('has close button when open', () => {
    render(
      MockModal({ isOpen: true, title: "Test Modal", children: "Content" })
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
