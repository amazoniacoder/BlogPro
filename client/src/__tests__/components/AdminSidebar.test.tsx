import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { AdminSidebar } from '../../admin/components/AdminSidebar';

describe('AdminSidebar', () => {
  const mockOnSectionChange = vi.fn();

  it('renders all navigation items', () => {
    render(<AdminSidebar activeSection="dashboard" onSectionChange={mockOnSectionChange} />);
    
    expect(screen.getByText(/dashboard|admin:dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/blog|admin:blogPosts/i)).toBeInTheDocument();
    expect(screen.getByText(/media|медиа/i)).toBeInTheDocument();
    expect(screen.getByText(/users|пользователи/i)).toBeInTheDocument();
    expect(screen.getByText(/settings|nav:settings/i)).toBeInTheDocument();
  });

  it('highlights active section', () => {
    render(<AdminSidebar activeSection="blog" onSectionChange={mockOnSectionChange} />);
    
    const blogItem = screen.getByText(/blog|admin:blogPosts/i).closest('.admin-sidebar__item');
    expect(blogItem).toHaveClass('admin-sidebar__item--active');
  });

  it('calls onSectionChange when item clicked', () => {
    render(<AdminSidebar activeSection="dashboard" onSectionChange={mockOnSectionChange} />);
    
    fireEvent.click(screen.getByText(/media|медиа/i));
    expect(mockOnSectionChange).toHaveBeenCalledWith('media', '/admin/media');
  });
});
