/**
 * Route Configuration for Documentation Manager
 * Deployment configuration for both libraries with public access
 */

import React from 'react';
import { LIBRARY_CONFIGS } from '../types/LibraryContext';
import UpdatedDocumentationManager from '../components/UpdatedDocumentationManager';

// Mock function to get user role (replace with actual auth implementation)
const getUserRole = (): 'admin' | 'editor' | 'user' | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || 'user';
  } catch {
    return null;
  }
};



// Text Editor Documentation Route (Public Access)
export const TextEditorDocsRoute: React.FC = () => {
  const userRole = getUserRole();
  
  return React.createElement(UpdatedDocumentationManager, {
    libraryContext: LIBRARY_CONFIGS.texteditor,
    userRole: userRole
  });
};

// Website Documentation Route (Public Access)
export const WebsiteDocsRoute: React.FC = () => {
  const userRole = getUserRole();
  
  return React.createElement(UpdatedDocumentationManager, {
    libraryContext: LIBRARY_CONFIGS.website,
    userRole: userRole
  });
};

// Route configuration for React Router
export const documentationRoutes = [
  {
    path: '/plugins/texteditor/docs',
    component: TextEditorDocsRoute,
    public: true, // No authentication required
    title: 'Text Editor Documentation',
    description: 'Professional text editor documentation and API reference',
    meta: {
      keywords: 'text editor, documentation, API, BlogPro',
      author: 'BlogPro Team'
    }
  },
  {
    path: '/docs',
    component: WebsiteDocsRoute,
    public: true, // No authentication required
    title: 'Website Documentation',
    description: 'Complete website documentation and user guides',
    meta: {
      keywords: 'website, documentation, user guide, BlogPro',
      author: 'BlogPro Team'
    }
  }
];

// Route configuration for Next.js (if using Next.js)
export const nextJSRoutes = {
  '/plugins/texteditor/docs': {
    component: TextEditorDocsRoute,
    getStaticProps: async () => ({
      props: {
        title: 'Text Editor Documentation',
        description: 'Professional text editor documentation and API reference'
      }
    })
  },
  '/docs': {
    component: WebsiteDocsRoute,
    getStaticProps: async () => ({
      props: {
        title: 'Website Documentation', 
        description: 'Complete website documentation and user guides'
      }
    })
  }
};

// Express.js route configuration (server-side)
export const expressRoutes = [
  {
    method: 'GET',
    path: '/plugins/texteditor/docs',
    handler: (req: any, res: any) => {
      res.render('documentation', {
        libraryType: 'texteditor',
        title: 'Text Editor Documentation',
        userRole: req.user?.role || null
      });
    }
  },
  {
    method: 'GET', 
    path: '/docs',
    handler: (req: any, res: any) => {
      res.render('documentation', {
        libraryType: 'website',
        title: 'Website Documentation',
        userRole: req.user?.role || null
      });
    }
  }
];

// Deployment environment configuration
export const deploymentConfig = {
  development: {
    apiBaseUrl: import.meta.env?.VITE_API_URL || 'https://blogpro.tech/api',
    enablePerformanceMonitoring: true,
    enableSecurityAudit: true,
    cacheEnabled: true,
    debugMode: true
  },
  staging: {
    apiBaseUrl: 'https://staging-api.blogpro.com/api',
    enablePerformanceMonitoring: true,
    enableSecurityAudit: true,
    cacheEnabled: true,
    debugMode: false
  },
  production: {
    apiBaseUrl: 'https://blogpro.tech/api',
    enablePerformanceMonitoring: false,
    enableSecurityAudit: true,
    cacheEnabled: true,
    debugMode: false
  }
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return deploymentConfig[env as keyof typeof deploymentConfig] || deploymentConfig.development;
};
