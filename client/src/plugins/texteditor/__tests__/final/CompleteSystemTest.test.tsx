/**
 * Complete System Integration Test
 * 
 * Final end-to-end test of the complete plugin system with React components.
 */
// @ts-ignore: React is used for JSX
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContentEditableEditor } from '../../core/components/ContentEditableEditor';
import { PluginRegistry } from '../../plugins/core/PluginRegistry';
import { PluginSettings } from '../../shared/utils/PluginSettings';

declare global {
  var describe: any;
  var test: any;
  var expect: any;
  var beforeEach: any;
  var afterEach: any;
  var vi: any;
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Complete Plugin System Integration', () => {
  beforeEach(() => {
    PluginRegistry.destroyAll();
    PluginSettings.clear();
    document.body.innerHTML = '';
  });

  afterEach(async () => {
    await PluginRegistry.destroyAll();
    PluginSettings.clear();
  });

  describe('Editor with Plugin System', () => {
    test('should render editor with plugins for regular user', async () => {
      const mockOnChange = vi.fn();
      const mockOnSave = vi.fn().mockResolvedValue(undefined);

      render(
        <ContentEditableEditor
          initialContent="<p>Test content</p>"
          onChange={mockOnChange}
          onSave={mockOnSave}
          userRole="user"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
      expect(editor).toHaveClass('editor-content');

      const pluginButton = screen.queryByText('🔌 Plugins');
      expect(pluginButton).not.toBeInTheDocument();
    });

    test('should render admin controls for admin user', async () => {
      const mockOnChange = vi.fn();
      const mockOnSave = vi.fn().mockResolvedValue(undefined);

      render(
        <ContentEditableEditor
          initialContent="<p>Admin test</p>"
          onChange={mockOnChange}
          onSave={mockOnSave}
          userRole="admin"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      await waitFor(() => {
        const pluginButton = screen.getByText('🔌 Plugins');
        expect(pluginButton).toBeInTheDocument();
      });
    });

    test('should handle content changes', async () => {
      const mockOnChange = vi.fn();
      const mockOnSave = vi.fn().mockResolvedValue(undefined);

      render(
        <ContentEditableEditor
          initialContent="<p>Initial</p>"
          onChange={mockOnChange}
          onSave={mockOnSave}
          userRole="user"
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      const editor = screen.getByRole('textbox');
      fireEvent.input(editor, {
        target: { innerHTML: '<p>Updated</p>' }
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });

  describe('Plugin Lifecycle', () => {
    test('should initialize and cleanup plugins', async () => {
      const mockOnChange = vi.fn();
      const mockOnSave = vi.fn().mockResolvedValue(undefined);

      const { unmount } = render(
        <ContentEditableEditor
          initialContent="<p>Test</p>"
          onChange={mockOnChange}
          onSave={mockOnSave}
          userRole="user"
        />
      );

      await waitFor(() => {
        expect(PluginRegistry.getInitializedPlugins().length).toBeGreaterThan(0);
      });

      unmount();

      await waitFor(() => {
        expect(PluginRegistry.getInitializedPlugins()).toHaveLength(0);
      });
    });
  });
});
