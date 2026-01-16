/**
 * Library Content Hook
 * Manages loading and caching of library-specific documentation content
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
  library_type?: string;
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
  library_type?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

interface LibraryContentData {
  sections: Section[];
  content: Content[];
  loading: boolean;
  error: string | null;
}

interface UseLibraryContentReturn extends LibraryContentData {
  reload: () => Promise<void>;
  getContentBySlug: (slug: string) => Content | undefined;
  getSectionBySlug: (slug: string) => Section | undefined;
}

// Fallback content when API is not available
const getFallbackSections = (libraryType: string): Section[] => {
  if (libraryType === 'texteditor') {
    return [
      {
        id: '1',
        name: 'Getting Started',
        slug: 'getting-started',
        description: 'Quick start guide for the text editor',
        level: 0,
        order_index: 1,
        icon: '🚀',
        is_active: true,
        library_type: 'texteditor'
      },
      {
        id: '2',
        name: 'API Reference',
        slug: 'api-reference',
        description: 'Complete API documentation',
        level: 0,
        order_index: 2,
        icon: '📚',
        is_active: true,
        library_type: 'texteditor'
      }
    ];
  }
  
  if (libraryType === 'site') {
    return [
      {
        id: '1',
        name: 'User Guide',
        slug: 'user-guide',
        description: 'How to use the website',
        level: 0,
        order_index: 1,
        icon: '👤',
        is_active: true,
        library_type: 'site'
      },
      {
        id: '2',
        name: 'Admin Guide',
        slug: 'admin-guide',
        description: 'Administrative features',
        level: 0,
        order_index: 2,
        icon: '<Icon name="gear" size={16} />',
        is_active: true,
        library_type: 'site'
      }
    ];
  }
  
  return [];
};

const getFallbackContent = (libraryType: string): Content[] => {
  if (libraryType === 'texteditor') {
    return [
      {
        id: '1',
        title: 'Welcome to Text Editor Documentation',
        slug: 'welcome',
        content: '<h1>Welcome to Text Editor Documentation</h1><p>This is the documentation for the BlogPro Text Editor plugin. The API is currently being set up.</p><h2>Features</h2><ul><li>Rich text editing</li><li>Real-time collaboration</li><li>Plugin system</li><li>Advanced formatting</li></ul>',
        excerpt: 'Welcome to the text editor documentation',
        order_index: 1,
        is_published: true,
        library_type: 'texteditor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Installation Guide',
        slug: 'installation',
        content: '<h1>Installation</h1><p>Follow these steps to install the text editor:</p><ol><li>Clone the repository</li><li>Install dependencies with <code>npm install</code></li><li>Start the development server with <code>npm run dev</code></li></ol>',
        excerpt: 'How to install and set up the text editor',
        order_index: 2,
        is_published: true,
        library_type: 'texteditor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
  
  if (libraryType === 'site') {
    return [
      {
        id: '1',
        title: 'Welcome to Website Documentation',
        slug: 'welcome',
        content: '<h1>Welcome to Website Documentation</h1><p>This is the documentation for the BlogPro website. The API is currently being set up.</p><h2>Features</h2><ul><li>User management</li><li>Content publishing</li><li>Blog system</li><li>Admin panel</li></ul>',
        excerpt: 'Welcome to the website documentation',
        order_index: 1,
        is_published: true,
        library_type: 'site',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
  
  return [];
};

export const useLibraryContent = (libraryType: string): UseLibraryContentReturn => {
  const [data, setData] = useState<LibraryContentData>({
    sections: [],
    content: [],
    loading: true,
    error: null
  });

  const loadLibraryContent = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Get auth token for API requests
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Map 'site' to 'website' for API compatibility
      const apiLibraryType = libraryType === 'site' ? 'website' : libraryType;
      
      const [sectionsResponse, contentResponse] = await Promise.all([
        fetch(`/api/documentation/public/sections/${apiLibraryType}`, { headers }),
        fetch(`/api/documentation/public/content/${apiLibraryType}`, { headers })
      ]);

      if (!sectionsResponse.ok || !contentResponse.ok) {
        // Provide fallback content when API fails
        console.warn(`API failed (${sectionsResponse.status}/${contentResponse.status}), using fallback content`);
        setData({
          sections: getFallbackSections(libraryType),
          content: getFallbackContent(libraryType),
          loading: false,
          error: null
        });
        return;
      }

      const [sections, content] = await Promise.all([
        sectionsResponse.json(),
        contentResponse.json()
      ]);

      setData({
        sections: sections || getFallbackSections(libraryType),
        content: content || getFallbackContent(libraryType),
        loading: false,
        error: null
      });
    } catch (error) {
      console.warn('API error, using fallback content:', error);
      // Use fallback content instead of showing error
      setData({
        sections: getFallbackSections(libraryType),
        content: getFallbackContent(libraryType),
        loading: false,
        error: null
      });
    }
  }, [libraryType]);

  const getContentBySlug = useCallback((slug: string): Content | undefined => {
    return data.content.find(item => item.slug === slug);
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

  // Load content when library type changes
  useEffect(() => {
    if (libraryType) {
      loadLibraryContent();
    }
  }, [libraryType, loadLibraryContent]);

  return {
    ...data,
    reload: loadLibraryContent,
    getContentBySlug,
    getSectionBySlug
  };
};
