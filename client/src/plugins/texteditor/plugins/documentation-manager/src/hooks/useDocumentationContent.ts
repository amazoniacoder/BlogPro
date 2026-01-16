/**
 * Documentation Content Hook
 * 
 * Hook for loading and managing dynamic documentation content from database.
 */

import { useState, useEffect, useCallback } from 'react';

export interface Section {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  level: number;
  order_index: number;
  icon?: string;
  is_active: boolean;
  children?: Section[];
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  section_id?: string;
  parent_id?: string;
  order_index: number;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface MenuItem {
  id: string;
  title: string;
  url?: string;
  content_id?: string;
  section_id?: string;
  parent_id?: string;
  level: number;
  order_index: number;
  icon?: string;
  is_active: boolean;
  target: string;
  children?: MenuItem[];
}

interface DocumentationData {
  sections: Section[];
  content: Content[];
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
}

export const useDocumentationContent = () => {
  const [data, setData] = useState<DocumentationData>({
    sections: [],
    content: [],
    menuItems: [],
    loading: true,
    error: null
  });

  const loadSections = useCallback(async () => {
    try {
      const response = await fetch('/api/documentation/sections');
      if (!response.ok) throw new Error('Failed to load sections');
      const sections = await response.json();
      return sections;
    } catch (error) {
      console.error('Error loading sections:', error);
      throw error;
    }
  }, []);

  const loadContent = useCallback(async () => {
    try {
      const response = await fetch('/api/documentation/content');
      if (!response.ok) throw new Error('Failed to load content');
      const content = await response.json();
      return content.filter((item: Content) => item.is_published);
    } catch (error) {
      console.error('Error loading content:', error);
      throw error;
    }
  }, []);

  const loadMenuItems = useCallback(async () => {
    try {
      const response = await fetch('/api/documentation/menu');
      if (!response.ok) throw new Error('Failed to load menu');
      const menuItems = await response.json();
      return menuItems;
    } catch (error) {
      console.error('Error loading menu:', error);
      throw error;
    }
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [sections, content, menuItems] = await Promise.all([
        loadSections(),
        loadContent(),
        loadMenuItems()
      ]);

      setData({
        sections,
        content,
        menuItems,
        loading: false,
        error: null
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [loadSections, loadContent, loadMenuItems]);

  const updateContent = useCallback(async (contentId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/documentation/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });

      if (!response.ok) throw new Error('Failed to update content');

      // Update local state
      setData(prev => ({
        ...prev,
        content: prev.content.map(item =>
          item.id === contentId ? { ...item, content: newContent } : item
        )
      }));

      return true;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }, []);

  const getContentBySlug = useCallback((slug: string): Content | undefined => {
    return data.content.find(item => item.slug === slug);
  }, [data.content]);

  const getContentBySection = useCallback((sectionId: string): Content[] => {
    return data.content.filter(item => item.section_id === sectionId);
  }, [data.content]);

  const getSectionBySlug = useCallback((slug: string): Section | undefined => {
    const findInSections = (sections: Section[]): Section | undefined => {
      for (const section of sections) {
        if (section.slug === slug) return section;
        if (section.children) {
          const found = findInSections(section.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findInSections(data.sections);
  }, [data.sections]);

  const buildBreadcrumbs = useCallback((sectionSlug?: string, contentSlug?: string) => {
    const breadcrumbs: Array<{ title: string; slug: string; type: 'section' | 'content' }> = [];

    if (sectionSlug) {
      const section = getSectionBySlug(sectionSlug);
      if (section) {
        // Build section breadcrumbs (traverse up the hierarchy)
        const buildSectionPath = (currentSection: Section) => {
          const parent = data.sections.find(s => 
            s.children?.some(child => child.id === currentSection.id)
          );
          if (parent) {
            buildSectionPath(parent);
          }
          breadcrumbs.push({
            title: currentSection.name,
            slug: currentSection.slug,
            type: 'section'
          });
        };
        buildSectionPath(section);
      }
    }

    if (contentSlug) {
      const content = getContentBySlug(contentSlug);
      if (content) {
        breadcrumbs.push({
          title: content.title,
          slug: content.slug,
          type: 'content'
        });
      }
    }

    return breadcrumbs;
  }, [data.sections, getSectionBySlug, getContentBySlug]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    sections: data.sections,
    content: data.content,
    menuItems: data.menuItems,
    loading: data.loading,
    error: data.error,
    loadAllData,
    updateContent,
    getContentBySlug,
    getContentBySection,
    getSectionBySlug,
    buildBreadcrumbs
  };
};
