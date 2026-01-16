import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import HomePage from '../../pages/home';

// Mock dependencies
vi.mock('../../hooks/useRealtimeBlogPosts', () => ({
  useRealtimeBlogPosts: () => ({
    posts: [
      { id: 1, title: 'Test Post', excerpt: 'Test excerpt', imageUrl: '/test.jpg' }
    ],
    loading: false,
    error: null
  })
}));

describe('HomePage', () => {
  it('renders home page content', () => {
    render(<HomePage />);
    
    expect(screen.getByText(/web design|development partner/i)).toBeInTheDocument();
    expect(screen.getByText(/latest blog posts/i)).toBeInTheDocument();
  });

  it('displays empty state when no posts', () => {
    vi.doMock('../../hooks/useRealtimeBlogPosts', () => ({
      useRealtimeBlogPosts: () => ({ posts: [], loading: false, error: null })
    }));
    
    render(<HomePage />);
    
    expect(screen.getByText(/no blog posts available/i)).toBeInTheDocument();
  });
});
