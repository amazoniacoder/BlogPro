# Authentication & Role System Documentation

## Overview

The Documentation Manager Plugin implements a comprehensive authentication and role-based access control system that integrates with BlogPro's main authentication infrastructure while providing plugin-specific access controls.

## Authentication Architecture

### 1. JWT Token-Based Authentication

The system uses JSON Web Tokens (JWT) for stateless authentication:

```typescript
interface TokenPayload {
  readonly role: string;
  readonly exp: number;
  readonly userId: string;
  readonly username: string;
}
```

**Token Storage:**
- Stored in `localStorage` with key `'token'`
- 7-day expiration period
- Automatic cleanup on expiration

**Token Structure:**
```json
{
  "userId": "user123",
  "username": "john_doe", 
  "role": "admin",
  "exp": 1640995200,
  "iat": 1640908800
}
```

### 2. Role Hierarchy

The system supports three user roles with hierarchical permissions:

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **admin** | Full access to all features | Create, Read, Update, Delete content + Manage sections + User management |
| **editor** | Content management | Create, Read, Update, Delete content |
| **user** | Read-only access | View published content only |
| **null** | Public access | View published content only |

## Frontend Authentication Implementation

### useUserRole Hook

Central authentication hook that manages user state and permissions:

```typescript
// hooks/useUserRole.ts
export const useUserRole = (): UseUserRoleReturn => {
  const [userRole, setUserRole] = useState<UserRole>(null);

  const getUserRoleFromToken = useCallback((): UserRole => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
      
      // Check token expiration
      if (Date.now() >= payload.exp * 1000) {
        localStorage.removeItem('token');
        return null;
      }

      // Validate and return role
      const role = payload.role?.toLowerCase();
      return ['admin', 'editor', 'user'].includes(role) ? role as UserRole : 'user';
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  }, []);

  // Derived permissions
  const canEdit = userRole === 'admin' || userRole === 'editor';
  const canManage = userRole === 'admin';
  const isAuthenticated = userRole !== null;

  return { userRole, canEdit, canManage, isAuthenticated };
};
```

**Key Features:**
- **Automatic token validation** - Checks expiration on every access
- **Permission derivation** - Calculates `canEdit` and `canManage` from role
- **Storage event listening** - Syncs across browser tabs
- **Error handling** - Graceful fallback for invalid tokens

### Route Protection

#### AdminManagerPage Protection

```typescript
// components/pages/AdminManagerPage.tsx
export const AdminManagerPage: React.FC = () => {
  const { userRole, canEdit, canManage } = useUserRole();

  // Development mode - authentication disabled
  if (false && !canEdit) {
    return (
      <div className="admin-access-denied">
        <h1>Access Denied</h1>
        <p>You need editor or admin permissions to access this panel.</p>
        <a href="/auth">Login</a>
      </div>
    );
  }

  // Provide fallback values for development
  return (
    <AdminHeader
      userRole={userRole || 'admin'}
      canManage={canManage || true}
      // ... other props
    />
  );
};
```

**Development vs Production:**
- **Development**: Authentication bypassed with `false &&` condition
- **Production**: Remove `false &&` and fallback values to enable full security

#### App-Level Route Protection

```typescript
// App.tsx
<Route path="/plugins/texteditor/documentation-manager">
  <ProtectedRoute adminOrEditor>
    <AdminManagerPage />
  </ProtectedRoute>
</Route>
```

## Backend Authentication Implementation

### Middleware Functions

#### Basic Authentication
```typescript
// middleware/authMiddleware.ts
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
```

#### Role-Based Access
```typescript
export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      req.user = { id: decoded.userId, role: decoded.role };
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}
```

### API Endpoint Protection

#### Public Endpoints (No Authentication)
```typescript
// api/documentation/public.ts
router.get('/sections/:libraryType', async (req, res) => {
  // No authentication required
  const sections = await enhancedDocumentationService.getSectionsByLibrary(libraryType);
  res.json(sections);
});
```

#### Protected Endpoints
```typescript
// api/documentation/content.ts
router.post('/', requireAuth, requireRole(['admin', 'editor']), async (req, res) => {
  // Only admin and editor can create content
});

router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  // Only admin can delete content
});
```

## Frontend API Integration

### Authenticated Requests

All API requests include authentication headers when available:

```typescript
// hooks/useLibraryContent.ts
const loadLibraryContent = useCallback(async () => {
  // Get auth token for API requests
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`/api/documentation/public/sections/${apiLibraryType}`, { 
    headers 
  });
}, [libraryType]);
```

### Error Handling

```typescript
// Automatic token cleanup on 401 errors
if (response.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/auth';
  return;
}
```

## Permission Matrix

### Feature Access Control

| Feature | Public | User | Editor | Admin |
|---------|--------|------|--------|-------|
| **View Documentation** | ✅ | ✅ | ✅ | ✅ |
| **Search Content** | ✅ | ✅ | ✅ | ✅ |
| **Admin Panel Access** | ❌ | ❌ | ✅ | ✅ |
| **Create Content** | ❌ | ❌ | ✅ | ✅ |
| **Edit Content** | ❌ | ❌ | ✅ | ✅ |
| **Delete Content** | ❌ | ❌ | ✅ | ✅ |
| **Manage Sections** | ❌ | ❌ | ❌ | ✅ |
| **Version Control** | ❌ | ❌ | ✅ | ✅ |
| **Content Locking** | ❌ | ❌ | ✅ | ✅ |
| **User Management** | ❌ | ❌ | ❌ | ✅ |

### Component-Level Permissions

```typescript
// Conditional rendering based on permissions
{canEdit && (
  <button onClick={handleEdit}>Edit Content</button>
)}

{canManage && (
  <SectionManager libraryType={activeLibrary} />
)}

{userRole === 'admin' && (
  <UserManagementPanel />
)}
```

## Development vs Production Configuration

### Development Mode (Current)

**Frontend:**
```typescript
// Authentication bypassed for development
if (false && !canEdit) {
  return <AccessDenied />;
}

// Fallback values provided
userRole={userRole || 'admin'}
canManage={canManage || true}
```

**Benefits:**
- ✅ **No login required** - Immediate access for development
- ✅ **Full feature testing** - All admin features accessible
- ✅ **Rapid iteration** - No authentication setup needed

### Production Mode (TODO)

**Required Changes:**
```typescript
// Remove development bypasses
if (!canEdit) {
  return <AccessDenied />;
}

// Remove fallback values
userRole={userRole}
canManage={canManage}
```

**Security Features:**
- 🔒 **Full authentication** - JWT token validation required
- 🔒 **Role enforcement** - Strict permission checking
- 🔒 **Route protection** - Unauthorized access blocked

## Security Considerations

### Token Security
- **Storage**: localStorage (consider httpOnly cookies for production)
- **Transmission**: HTTPS only in production
- **Expiration**: 7-day automatic expiry
- **Validation**: Server-side JWT verification

### Input Validation
- **API endpoints**: All inputs validated and sanitized
- **SQL injection**: Parameterized queries used throughout
- **XSS protection**: Content properly escaped in rendering

### Access Control
- **Principle of least privilege**: Users get minimum required permissions
- **Role hierarchy**: Clear permission inheritance
- **Feature gating**: UI elements hidden based on permissions

## Testing Authentication

### Manual Testing Steps

1. **Public Access**
   ```bash
   # Test public documentation pages
   curl http://localhost:3000/plugins/texteditor/documentation-texteditor
   curl http://localhost:3000/plugins/texteditor/documentation-site
   ```

2. **Admin Access**
   ```bash
   # Test admin panel (should work in development)
   curl http://localhost:3000/plugins/texteditor/documentation-manager
   ```

3. **API Authentication**
   ```bash
   # Test protected API endpoint
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:5000/api/documentation/content
   ```

### Automated Testing

```typescript
// Test authentication hook
describe('useUserRole', () => {
  test('returns null for invalid token', () => {
    localStorage.setItem('token', 'invalid-token');
    const { result } = renderHook(() => useUserRole());
    expect(result.current.userRole).toBe(null);
  });

  test('returns admin role for valid admin token', () => {
    const adminToken = createMockToken({ role: 'admin' });
    localStorage.setItem('token', adminToken);
    const { result } = renderHook(() => useUserRole());
    expect(result.current.userRole).toBe('admin');
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canManage).toBe(true);
  });
});
```

## Migration to Production

### Step 1: Enable Authentication
```typescript
// Remove development bypasses
- if (false && !canEdit) {
+ if (!canEdit) {
```

### Step 2: Remove Fallbacks
```typescript
// Remove development fallbacks
- userRole={userRole || 'admin'}
+ userRole={userRole}
- canManage={canManage || true}
+ canManage={canManage}
```

### Step 3: Configure JWT Secret
```bash
# Set secure JWT secret in production
export JWT_SECRET="your-secure-production-secret"
```

### Step 4: Test Authentication Flow
1. Verify login redirects work
2. Test role-based access control
3. Validate token expiration handling
4. Check API authentication

## Troubleshooting

### Common Issues

**"Access Denied" in Development**
- Check if authentication bypass is enabled: `if (false && !canEdit)`
- Verify fallback values are provided: `userRole || 'admin'`

**API 401 Errors**
- Ensure JWT token is included in request headers
- Check token expiration and format
- Verify API endpoint authentication requirements

**Role Permissions Not Working**
- Check token payload contains correct role
- Verify role hierarchy implementation
- Test permission derivation logic

### Debug Tools

```typescript
// Add debug logging to useUserRole hook
console.log('Token:', localStorage.getItem('token'));
console.log('Decoded payload:', payload);
console.log('User role:', userRole);
console.log('Can edit:', canEdit);
console.log('Can manage:', canManage);
```

## Future Enhancements

### Planned Improvements
1. **Refresh Token System** - Automatic token renewal
2. **Session Management** - Better concurrent session handling  
3. **Audit Logging** - Track authentication events
4. **Multi-Factor Authentication** - Enhanced security for admin access
5. **Permission Granularity** - More fine-grained access control
6. **OAuth Integration** - Third-party authentication providers

### Security Roadmap
1. **httpOnly Cookies** - More secure token storage
2. **CSRF Protection** - Cross-site request forgery prevention
3. **Rate Limiting** - Brute force attack prevention
4. **Security Headers** - Additional HTTP security headers
5. **Audit Trails** - Complete user action logging