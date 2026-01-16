/**
 * Public Routes Configuration
 * Demonstrates how to set up public documentation routes
 */

import React from 'react';
import { LIBRARY_CONFIGS } from '../types/LibraryContext';
import { DocumentationManager } from '../components/UpdatedDocumentationManager';

// Mock function to get user role (in real app, this would come from auth context)
const getUserRole = (): 'admin' | 'editor' | 'user' | null => {
  // In real implementation, get from auth context or localStorage
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  // Mock role extraction from token
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || 'user';
  } catch {
    return null;
  }
};

// Text Editor Documentation Route (Public Access)
export const TextEditorDocsRoute: React.FC = () => {
  const userRole = getUserRole();
  
  return (
    <DocumentationManager
      libraryContext={LIBRARY_CONFIGS.texteditor}
      userRole={userRole}
    />
  );
};

// Website Documentation Route (Public Access)
export const WebsiteDocsRoute: React.FC = () => {
  const userRole = getUserRole();
  
  return (
    <DocumentationManager
      libraryContext={LIBRARY_CONFIGS.website}
      userRole={userRole}
    />
  );
};

// Route configuration for React Router
export const documentationRoutes = [
  {
    path: '/plugins/texteditor/docs',
    component: TextEditorDocsRoute,
    public: true, // No authentication required
    title: 'Text Editor Documentation'
  },
  {
    path: '/docs',
    component: WebsiteDocsRoute,
    public: true, // No authentication required
    title: 'Website Documentation'
  }
];

// Example usage in main app router:
/*
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TextEditorDocsRoute, WebsiteDocsRoute } from './routes/PublicRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/plugins/texteditor/docs" element={<TextEditorDocsRoute />} />
        <Route path="/docs" element={<WebsiteDocsRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
*/
