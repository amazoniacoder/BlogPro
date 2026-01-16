/**
 * Admin Panel Integration Hook
 * Manages admin panel state and operations
 */

import { useState, useCallback } from 'react';

interface AdminPanelState {
  isOpen: boolean;
  activeTab: 'content' | 'structure' | 'settings';
  selectedContentId?: string;
  selectedSectionId?: string;
}

interface UseAdminPanelReturn {
  adminState: AdminPanelState;
  openAdminPanel: (tab?: string) => void;
  closeAdminPanel: () => void;
  setActiveTab: (tab: 'content' | 'structure' | 'settings') => void;
  selectContent: (contentId: string) => void;
  selectSection: (sectionId: string) => void;
  clearSelection: () => void;
}

export const useAdminPanel = (
  userRole?: 'admin' | 'editor' | 'user' | null
): UseAdminPanelReturn => {
  const [adminState, setAdminState] = useState<AdminPanelState>({
    isOpen: false,
    activeTab: 'content',
    selectedContentId: undefined,
    selectedSectionId: undefined
  });

  const openAdminPanel = useCallback((tab?: string) => {
    // Check permissions
    if (!userRole || (userRole !== 'admin' && userRole !== 'editor')) {
      console.warn('Admin panel requires admin or editor role');
      return;
    }

    const defaultTab = userRole === 'admin' ? 'content' : 'content';
    const activeTab = (tab as any) || defaultTab;

    setAdminState(prev => ({
      ...prev,
      isOpen: true,
      activeTab: activeTab
    }));
  }, [userRole]);

  const closeAdminPanel = useCallback(() => {
    setAdminState(prev => ({
      ...prev,
      isOpen: false,
      selectedContentId: undefined,
      selectedSectionId: undefined
    }));
  }, []);

  const setActiveTab = useCallback((tab: 'content' | 'structure' | 'settings') => {
    // Check permissions for structure tab
    if (tab === 'structure' && userRole !== 'admin') {
      console.warn('Structure management requires admin role');
      return;
    }

    setAdminState(prev => ({
      ...prev,
      activeTab: tab,
      selectedContentId: undefined,
      selectedSectionId: undefined
    }));
  }, [userRole]);

  const selectContent = useCallback((contentId: string) => {
    setAdminState(prev => ({
      ...prev,
      selectedContentId: contentId,
      selectedSectionId: undefined
    }));
  }, []);

  const selectSection = useCallback((sectionId: string) => {
    setAdminState(prev => ({
      ...prev,
      selectedSectionId: sectionId,
      selectedContentId: undefined
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setAdminState(prev => ({
      ...prev,
      selectedContentId: undefined,
      selectedSectionId: undefined
    }));
  }, []);

  return {
    adminState,
    openAdminPanel,
    closeAdminPanel,
    setActiveTab,
    selectContent,
    selectSection,
    clearSelection
  };
};
