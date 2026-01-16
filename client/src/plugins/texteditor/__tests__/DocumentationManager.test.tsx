/**
 * Documentation Manager Integration Tests
 * Comprehensive test suite for the documentation manager plugin
 */
// @ts-ignore: React is used for JSX
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LIBRARY_CONFIGS } from '../plugins/documentation-manager/src/types/LibraryContext';
import { DocumentationManager } from '../plugins/documentation-manager/src/components/UpdatedDocumentationManager';
import { LibrarySwitcher } from '../plugins/documentation-manager/src/components/LibrarySwitcher';
import { UnifiedAdminPanel } from '../plugins/documentation-manager/src/components/UnifiedAdminPanel';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('DocumentationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ sections: [], content: [] }),
    });
  });

  describe('Public Access', () => {
    it('renders public content without authentication', async () => {
      render(
        <DocumentationManager 
          libraryContext={LIBRARY_CONFIGS.texteditor}
          userRole={null}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Text Editor Documentation/)).toBeInTheDocument();
      });
    });

    it('does not show admin features for public users', () => {
      render(
        <DocumentationManager 
          libraryContext={LIBRARY_CONFIGS.texteditor}
          userRole={null}
        />
      );
      
      expect(screen.queryByText(/Edit/)).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access', () => {
    it('shows admin features for admin users', async () => {
      render(
        <DocumentationManager 
          libraryContext={LIBRARY_CONFIGS.texteditor}
          userRole="admin"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Text Editor Documentation/)).toBeInTheDocument();
      });
    });

    it('restricts structure management to admin only', () => {
      const { rerender } = render(
        <UnifiedAdminPanel 
          context={LIBRARY_CONFIGS.texteditor}
          userRole="editor"
        />
      );
      
      // Editor should not see structure tab
      expect(screen.queryByText(/Structure/)).not.toBeInTheDocument();
      
      rerender(
        <UnifiedAdminPanel 
          context={LIBRARY_CONFIGS.texteditor}
          userRole="admin"
        />
      );
      
      // Admin should see structure tab
      expect(screen.getByText(/Structure/)).toBeInTheDocument();
    });
  });

  describe('Library Switching', () => {
    it('switches between libraries correctly', async () => {
      const mockOnSwitch = vi.fn();
      
      render(
        <LibrarySwitcher
          activeLibrary="texteditor"
          onSwitch={mockOnSwitch}
          userRole="admin"
        />
      );
      
      const websiteButton = screen.getByText(/Website Documentation/);
      fireEvent.click(websiteButton);
      
      expect(mockOnSwitch).toHaveBeenCalledWith('website');
    });

    it('prevents library switching for non-admin users', () => {
      const mockOnSwitch = vi.fn();
      
      render(
        <LibrarySwitcher
          activeLibrary="texteditor"
          onSwitch={mockOnSwitch}
          userRole={null}
        />
      );
      
      const websiteButton = screen.getByText(/Website Documentation/);
      expect(websiteButton).toBeDisabled();
    });

    it('displays correct library features', () => {
      const { rerender } = render(
        <DocumentationManager 
          libraryContext={LIBRARY_CONFIGS.texteditor}
          userRole="admin"
        />
      );
      
      expect(screen.getByText(/Text Editor Documentation/)).toBeInTheDocument();
      
      rerender(
        <DocumentationManager 
          libraryContext={LIBRARY_CONFIGS.website}
          userRole="admin"
        />
      );
      
      expect(screen.getByText(/Website Documentation/)).toBeInTheDocument();
    });
  });

  describe('Content Management', () => {
    it('loads content on mount', async () => {
      const mockContent = [
        { id: '1', title: 'Test Content', slug: 'test-content', content: 'Test content body' }
      ];
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContent,
      });
      
      render(
        <DocumentationManager 
          libraryContext={LIBRARY_CONFIGS.texteditor}
          userRole="admin"
        />
      );
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/documentation/public/content/texteditor')
        );
      });
    });

    it('handles loading errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      render(
        <DocumentationManager 
          libraryContext={LIBRARY_CONFIGS.texteditor}
          userRole="admin"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load documentation/)).toBeInTheDocument();
      });
    });
  });

  describe('Integration Tests', () => {
    it('integrates all components correctly', async () => {
      render(
        <DocumentationManager 
          libraryContext={LIBRARY_CONFIGS.texteditor}
          userRole="admin"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Text Editor Documentation/)).toBeInTheDocument();
      });
      
      // Should have library switcher for admin
      expect(screen.getByText(/Website Documentation/)).toBeInTheDocument();
    });

    it('maintains state consistency across components', () => {
      const { rerender } = render(
        <DocumentationManager 
          libraryContext={LIBRARY_CONFIGS.texteditor}
          userRole="admin"
        />
      );
      
      // Change library context
      rerender(
        <DocumentationManager 
          libraryContext={LIBRARY_CONFIGS.website}
          userRole="admin"
        />
      );
      
      expect(screen.getByText(/Website Documentation/)).toBeInTheDocument();
    });
  });
});
