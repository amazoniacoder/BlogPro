# Multi-Library Documentation Implementation Plan

## Phase 1: Project Structure Setup

### Step 1.1: Reorganize Components
```bash
# Create new directory structure
mkdir -p src/components/{common,library,admin,pages}
mkdir -p src/styles/{common,library,admin}
mkdir -p src/hooks
mkdir -p src/utils
```

### Step 1.2: Move Existing Components
- Move `DocumentationHeader.tsx` → `components/common/Header.tsx`
- Move `DocumentationSidebar.tsx` → `components/common/Sidebar.tsx`
- Move `DocumentationContent.tsx` → `components/common/Content.tsx`
- Move `ContextMenu.tsx` → `components/common/ContextMenu.tsx`

### Step 1.3: Create New Components
- `components/library/LibraryWrapper.tsx` - Main wrapper for library pages
- `components/pages/TextEditorDocsPage.tsx` - Text editor documentation page
- `components/pages/SiteDocsPage.tsx` - Site documentation page
- `components/pages/AdminManagerPage.tsx` - Admin control panel

## Phase 2: Hooks and Utilities

### Step 2.1: Create User Role Hook
```typescript
// hooks/useUserRole.ts
export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  
  useEffect(() => {
    const role = getUserRoleFromToken();
    setUserRole(role);
  }, []);
  
  return {
    userRole,
    canEdit: userRole === 'admin' || userRole === 'editor',
    canManage: userRole === 'admin',
    isAuthenticated: !!userRole
  };
};
```

### Step 2.2: Update Library Content Hook
```typescript
// hooks/useLibraryContent.ts - Update existing hook
export const useLibraryContent = (libraryType: 'texteditor' | 'site') => {
  // Update API calls to use library-specific endpoints
  const [sectionsResponse, contentResponse] = await Promise.all([
    fetch(`/api/documentation/public/sections/${libraryType}`),
    fetch(`/api/documentation/public/content/${libraryType}`)
  ]);
};
```

### Step 2.3: Create Admin Features Hook
```typescript
// hooks/useAdminFeatures.ts
export const useAdminFeatures = (userRole: UserRole, libraryType: string) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({});
  
  const enableInlineEdit = (element: HTMLElement) => {
    // Inline editing logic
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    // Context menu logic
  };
  
  return {
    isAdminMode,
    setIsAdminMode,
    contextMenu,
    enableInlineEdit,
    handleContextMenu
  };
};
```

## Phase 3: Page Components

### Step 3.1: Create Library Wrapper
```typescript
// components/library/LibraryWrapper.tsx
interface LibraryWrapperProps {
  libraryType: 'texteditor' | 'site';
  showAdminControls?: boolean;
}

export const LibraryWrapper: React.FC<LibraryWrapperProps> = ({
  libraryType,
  showAdminControls = false
}) => {
  const { userRole, canEdit } = useUserRole();
  const { sections, content, loading } = useLibraryContent(libraryType);
  const adminFeatures = useAdminFeatures(userRole, libraryType);
  
  return (
    <div className={`documentation-library library-${libraryType}`}>
      <Header 
        libraryType={libraryType}
        canEdit={canEdit}
        showAdminControls={showAdminControls}
        {...adminFeatures}
      />
      <div className="documentation-layout">
        <Sidebar sections={sections} />
        <Content 
          content={content}
          canEdit={canEdit && adminFeatures.isAdminMode}
          onContextMenu={adminFeatures.handleContextMenu}
        />
      </div>
      {canEdit && <ContextMenu {...adminFeatures.contextMenu} />}
    </div>
  );
};
```

### Step 3.2: Create Text Editor Documentation Page
```typescript
// components/pages/TextEditorDocsPage.tsx
export const TextEditorDocsPage: React.FC = () => {
  return (
    <LibraryWrapper 
      libraryType="texteditor"
      showAdminControls={true}
    />
  );
};
```

### Step 3.3: Create Site Documentation Page
```typescript
// components/pages/SiteDocsPage.tsx
export const SiteDocsPage: React.FC = () => {
  return (
    <LibraryWrapper 
      libraryType="site"
      showAdminControls={true}
    />
  );
};
```

### Step 3.4: Create Admin Manager Page
```typescript
// components/pages/AdminManagerPage.tsx
export const AdminManagerPage: React.FC = () => {
  const [activeLibrary, setActiveLibrary] = useState<'texteditor' | 'site'>('texteditor');
  
  return (
    <div className="admin-manager">
      <AdminHeader>
        <LibrarySwitcher 
          activeLibrary={activeLibrary}
          onSwitch={setActiveLibrary}
        />
      </AdminHeader>
      <LibraryWrapper 
        libraryType={activeLibrary}
        showAdminControls={true}
      />
    </div>
  );
};
```

## Phase 4: Styling Implementation

### Step 4.1: Create Base Styles
```css
/* styles/common/base.css */
.documentation-library {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.documentation-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}
```

### Step 4.2: Create Library-Specific Styles
```css
/* styles/library/texteditor.css */
.library-texteditor {
  --primary-color: #2563eb;
  --accent-color: #3b82f6;
}

.library-texteditor .header {
  background: var(--primary-color);
}

/* styles/library/site.css */
.library-site {
  --primary-color: #059669;
  --accent-color: #10b981;
}

.library-site .header {
  background: var(--primary-color);
}
```

### Step 4.3: Create Admin Styles
```css
/* styles/admin/admin-panel.css */
.admin-mode {
  border: 2px solid #f59e0b;
}

.admin-mode .editable-content:hover {
  outline: 2px dashed #f59e0b;
  cursor: pointer;
}

/* styles/admin/context-menu.css */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
```

## Phase 5: Route Configuration

### Step 5.1: Update App.tsx Routes
```typescript
// App.tsx
const TextEditorDocsPage = lazy(() => import('./plugins/texteditor/plugins/documentation-manager/src/components/pages/TextEditorDocsPage'));
const SiteDocsPage = lazy(() => import('./plugins/texteditor/plugins/documentation-manager/src/components/pages/SiteDocsPage'));
const AdminManagerPage = lazy(() => import('./plugins/texteditor/plugins/documentation-manager/src/components/pages/AdminManagerPage'));

// Add routes
<Route path="/plugins/texteditor/documentation-texteditor">
  <TextEditorDocsPage />
</Route>

<Route path="/plugins/texteditor/documentation-site">
  <SiteDocsPage />
</Route>

<Route path="/plugins/texteditor/documentation-manager">
  <ProtectedRoute adminOrEditor>
    <AdminManagerPage />
  </ProtectedRoute>
</Route>
```

### Step 5.2: Create Protected Route for Admin/Editor
```typescript
// components/common/ProtectedRoute.tsx - Update existing
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  adminOrEditor?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  adminOrEditor = false
}) => {
  const { userRole } = useUserRole();
  
  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  if (adminOrEditor && !['admin', 'editor'].includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

## Phase 6: Database Integration

### Step 6.1: Verify Database Tables
```sql
-- Check if tables exist with library_type support
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'documentation_%';

-- Verify library_type column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'documentation_content' AND column_name = 'library_type';
```

### Step 6.2: Seed Sample Data
```sql
-- Insert sample sections for texteditor
INSERT INTO documentation_sections (name, slug, library_type, level, order_index) VALUES
('Getting Started', 'getting-started', 'texteditor', 0, 1),
('API Reference', 'api-reference', 'texteditor', 0, 2);

-- Insert sample sections for site
INSERT INTO documentation_sections (name, slug, library_type, level, order_index) VALUES
('User Guide', 'user-guide', 'site', 0, 1),
('Features', 'features', 'site', 0, 2);

-- Insert sample content
INSERT INTO documentation_content (title, slug, content, library_type, is_published) VALUES
('Welcome to Text Editor', 'welcome', '<h1>Welcome</h1><p>Text editor documentation</p>', 'texteditor', true),
('Website Guide', 'guide', '<h1>Guide</h1><p>Website documentation</p>', 'site', true);
```

## Phase 7: Testing and Validation

### Step 7.1: Test Public Pages
- Visit `/plugins/texteditor/documentation-texteditor`
- Verify content loads for texteditor library
- Test responsive design and navigation

### Step 7.2: Test Admin Features
- Login as admin/editor
- Visit `/plugins/texteditor/documentation-manager`
- Test library switching
- Test context menu (right-click)
- Test inline editing (double-click)

### Step 7.3: Test Role-Based Access
- Test as anonymous user (public access only)
- Test as regular user (public access only)
- Test as editor (public + admin features)
- Test as admin (full access)

## Phase 8: Performance Optimization

### Step 8.1: Implement Code Splitting
```typescript
// Lazy load admin components only when needed
const AdminPanel = lazy(() => import('./admin/AdminPanel'));
const LibrarySwitcher = lazy(() => import('./admin/LibrarySwitcher'));
```

### Step 8.2: Add Caching
```typescript
// hooks/useLibraryContent.ts - Add caching
const cache = new Map<string, { data: any; timestamp: number }>();

const loadWithCache = async (key: string, fetcher: () => Promise<any>) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

## Success Criteria

### Functional Requirements
- ✅ Separate public pages for texteditor and site libraries
- ✅ Unified admin control panel with library switching
- ✅ Role-based access control (public, user, editor, admin)
- ✅ Context menu and inline editing for admin/editor users
- ✅ Library-specific content and styling

### Technical Requirements
- ✅ Clean component architecture with shared and library-specific parts
- ✅ Proper CSS organization with BEM methodology
- ✅ Database integration with library_type filtering
- ✅ Performance optimization with code splitting and caching
- ✅ TypeScript compliance and proper type definitions

### User Experience Requirements
- ✅ Intuitive navigation between libraries
- ✅ Consistent admin experience across libraries
- ✅ Fast loading and responsive design
- ✅ Clear visual distinction between libraries
- ✅ Seamless editing workflow for content managers