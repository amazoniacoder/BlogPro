# Multi-Library Documentation Architecture

## Overview

This document describes the architecture for a multi-library documentation system with separate public pages for each library and a unified admin control panel.

## Architecture Components

### 1. Route Structure
```
/plugins/texteditor/documentation-texteditor  # Text Editor Library (Public)
/plugins/texteditor/documentation-site        # Website Library (Public)  
/plugins/texteditor/documentation-manager     # Admin Control Panel (Admin/Editor Only)
```

### 2. Directory Structure
```
plugins/documentation-manager/
├── src/
│   ├── components/
│   │   ├── common/           # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Content.tsx
│   │   │   └── ContextMenu.tsx
│   │   ├── library/          # Library-specific components
│   │   │   ├── TextEditorDocs.tsx
│   │   │   ├── SiteDocs.tsx
│   │   │   └── LibraryWrapper.tsx
│   │   ├── admin/            # Admin-only components
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── LibrarySwitcher.tsx
│   │   │   └── ContentEditor.tsx
│   │   └── pages/            # Page components
│   │       ├── TextEditorDocsPage.tsx
│   │       ├── SiteDocsPage.tsx
│   │       └── AdminManagerPage.tsx
│   ├── hooks/
│   │   ├── useLibraryContent.ts    # Content loading by library
│   │   ├── useUserRole.ts          # Role detection
│   │   ├── useAdminFeatures.ts     # Admin functionality
│   │   └── useContextMenu.ts       # Context menu logic
│   ├── styles/
│   │   ├── common/           # Shared styles
│   │   │   ├── base.css
│   │   │   ├── layout.css
│   │   │   └── components.css
│   │   ├── library/          # Library-specific styles
│   │   │   ├── texteditor.css
│   │   │   └── site.css
│   │   └── admin/            # Admin-only styles
│   │       ├── admin-panel.css
│   │       └── context-menu.css
│   ├── types/
│   │   ├── LibraryContext.ts
│   │   ├── UserRole.ts
│   │   └── Content.ts
│   └── utils/
│       ├── roleUtils.ts
│       ├── apiUtils.ts
│       └── routeUtils.ts
```

### 3. Database Schema

#### Tables by Library Type
- **documentation_sections** - Sections for both libraries (library_type: 'texteditor' | 'site')
- **documentation_content** - Content for both libraries (library_type: 'texteditor' | 'site')
- **documentation_menu** - Navigation menus per library
- **documentation_search_index** - Search index per library

#### Key Fields
```sql
-- All tables have library_type column
library_type VARCHAR(50) CHECK (library_type IN ('texteditor', 'site'))

-- Content filtering queries
SELECT * FROM documentation_content 
WHERE library_type = 'texteditor' AND is_published = true;

SELECT * FROM documentation_sections 
WHERE library_type = 'site' AND is_active = true;
```

### 4. Component Architecture

#### Library Wrapper Pattern
```typescript
interface LibraryWrapperProps {
  libraryType: 'texteditor' | 'site';
  userRole: 'admin' | 'editor' | 'user' | null;
  isAdminMode?: boolean;
}

const LibraryWrapper: React.FC<LibraryWrapperProps> = ({
  libraryType,
  userRole,
  isAdminMode = false
}) => {
  const { sections, content, loading } = useLibraryContent(libraryType);
  const { canEdit, canManage } = useUserRole(userRole);
  
  return (
    <div className={`library-${libraryType} ${isAdminMode ? 'admin-mode' : ''}`}>
      <Header libraryType={libraryType} canEdit={canEdit} />
      <Sidebar sections={sections} />
      <Content content={content} canEdit={canEdit && isAdminMode} />
      {canEdit && <ContextMenu />}
    </div>
  );
};
```

### 5. Role-Based Access Control

#### User Role Detection
```typescript
// hooks/useUserRole.ts
export const useUserRole = () => {
  const getUserRole = (): UserRole => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  };

  const userRole = getUserRole();
  
  return {
    userRole,
    canEdit: userRole === 'admin' || userRole === 'editor',
    canManage: userRole === 'admin',
    isAuthenticated: !!userRole
  };
};
```

### 6. API Endpoints Structure

#### Public Endpoints (No Auth Required)
```
GET /api/documentation/public/sections/texteditor
GET /api/documentation/public/content/texteditor
GET /api/documentation/public/sections/site
GET /api/documentation/public/content/site
GET /api/documentation/public/search/texteditor?q=query
GET /api/documentation/public/search/site?q=query
```

#### Admin Endpoints (Auth Required)
```
PUT /api/documentation/content/:id
POST /api/documentation/content
DELETE /api/documentation/content/:id
PUT /api/documentation/sections/:id
POST /api/documentation/sections
```

### 7. Styling Strategy

#### CSS Architecture
```css
/* Base styles - shared across all libraries */
@import 'common/base.css';
@import 'common/layout.css';
@import 'common/components.css';

/* Library-specific styles */
.library-texteditor {
  @import 'library/texteditor.css';
}

.library-site {
  @import 'library/site.css';
}

/* Admin mode styles */
.admin-mode {
  @import 'admin/admin-panel.css';
  @import 'admin/context-menu.css';
}
```

### 8. Admin Features Integration

#### Context Menu System
- **Right-click detection** on editable elements
- **Role-based actions** (edit, delete, export)
- **Library-aware operations** (content belongs to current library)

#### Inline Editing
- **Double-click activation** for admin/editor users
- **Real-time content updates** via API
- **Library-specific validation** and saving

#### Admin Panel
- **Library switcher** for managing multiple libraries
- **Content CRUD operations** per library
- **Bulk operations** and import/export tools