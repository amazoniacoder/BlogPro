# API & Security Documentation

## API Endpoints Overview

### Base URL
```
Production: https://your-domain.com/api/documentation
Development: http://localhost:5000/api/documentation
```

## Public Endpoints (No Authentication)

### Content Retrieval
```http
GET /public/sections/{libraryType}
GET /public/content/{libraryType}
GET /public/content/{libraryType}/{slug}
GET /public/search/{libraryType}?q={query}&limit={limit}
```

**Example:**
```bash
# Get all published content for text editor library
curl "http://localhost:5000/api/documentation/public/content/texteditor"

# Search text editor documentation
curl "http://localhost:5000/api/documentation/public/search/texteditor?q=editor&limit=10"
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Getting Started",
      "slug": "getting-started",
      "content": "<p>Content here...</p>",
      "excerpt": "Brief description",
      "sectionName": "Introduction",
      "libraryType": "texteditor",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Protected Endpoints (Authentication Required)

### Content Management
```http
POST   /content                    # Create new content
PUT    /content/{id}               # Update existing content
DELETE /content/{id}               # Delete content (Admin only)
GET    /content/{id}               # Get content details
```

### Version Management
```http
GET    /content/{id}/versions      # Get version history
GET    /content/{id}/versions/{version}  # Get specific version
POST   /content/{id}/restore/{version}   # Restore to version
GET    /content/{id}/diff/{v1}/{v2}      # Compare versions
```

### Content Locking
```http
GET    /content/{id}/lock          # Check lock status
POST   /content/{id}/lock          # Lock content for editing
DELETE /content/{id}/lock          # Unlock content
POST   /locks/cleanup              # Clean expired locks
```

### Section Management
```http
GET    /sections/{libraryType}     # Get sections
POST   /sections                   # Create section (Admin only)
PUT    /sections/{id}              # Update section (Admin only)
DELETE /sections/{id}              # Delete section (Admin only)
```

## Authentication System

### JWT Token Structure
```json
{
  "userId": "user123",
  "username": "john_doe",
  "role": "editor",
  "exp": 1640995200,
  "iat": 1640908800
}
```

### Authorization Header
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Public** | Read published content, search |
| **User** | Same as public (authenticated but no additional permissions) |
| **Editor** | Create/edit content, manage versions, lock content |
| **Admin** | Full access including delete, section management, user management |

## API Request Examples

### Create Content (Editor/Admin)
```bash
curl -X POST "http://localhost:5000/api/documentation/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Documentation Page",
    "slug": "new-page",
    "content": "<p>Page content here</p>",
    "excerpt": "Brief description",
    "libraryType": "texteditor",
    "sectionId": "section-uuid",
    "isPublished": false
  }'
```

### Update Content (Editor/Admin)
```bash
curl -X PUT "http://localhost:5000/api/documentation/content/content-uuid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "<p>Updated content</p>",
    "isPublished": true
  }'
```

### Lock Content for Editing (Editor/Admin)
```bash
curl -X POST "http://localhost:5000/api/documentation/content/content-uuid/lock" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Version History (Editor/Admin)
```bash
curl "http://localhost:5000/api/documentation/content/content-uuid/versions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## WebSocket Events

### Connection
```javascript
const socket = io('/documentation', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

### Client Events (Emit)
```javascript
// Join library room
socket.emit('join_library', {
  libraryType: 'texteditor',
  userId: 'user123',
  userName: 'John Doe'
});

// Lock content
socket.emit('lock_content', {
  contentId: 'content-uuid',
  userId: 'user123',
  userName: 'John Doe',
  libraryType: 'texteditor'
});

// Update content
socket.emit('update_content', {
  contentId: 'content-uuid',
  content: '<p>Updated content</p>',
  userId: 'user123',
  userName: 'John Doe',
  libraryType: 'texteditor'
});

// Unlock content
socket.emit('unlock_content', {
  contentId: 'content-uuid',
  userId: 'user123',
  libraryType: 'texteditor'
});
```

### Server Events (Listen)
```javascript
// Content locked by another user
socket.on('content_locked', (data) => {
  console.log(`Content ${data.contentId} locked by ${data.lock.userName}`);
});

// Content unlocked
socket.on('content_unlocked', (data) => {
  console.log(`Content ${data.contentId} unlocked`);
});

// Real-time content update
socket.on('content_updated', (data) => {
  console.log(`Content ${data.contentId} updated by ${data.userName}`);
  // Update DOM with new content
});

// User disconnected
socket.on('user_disconnected', (data) => {
  console.log(`User ${data.userName} disconnected`);
});
```

## Security Features

### Input Validation
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Protection**: Content sanitization and proper escaping
- **CSRF Protection**: Token-based request validation
- **Input Sanitization**: All user input validated and cleaned

### Authentication Security
- **JWT Token Validation**: All protected endpoints verify tokens
- **Token Expiration**: 7-day expiration with refresh capability
- **Secure Headers**: HTTPS enforcement, security headers
- **Rate Limiting**: API endpoint rate limiting

### Content Security
- **Content Locking**: Prevents concurrent editing conflicts
- **Version Control**: Complete audit trail of changes
- **Role-based Access**: Granular permission system
- **Data Encryption**: Sensitive data encrypted at rest

### WebSocket Security
- **Authentication Required**: JWT token validation for connections
- **Room Isolation**: Users only receive updates for their library
- **Message Validation**: All WebSocket messages validated
- **Connection Limits**: Prevent abuse with connection limits

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (content locked by another user)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": "Content is already locked by another user",
  "code": "CONTENT_LOCKED",
  "details": {
    "contentId": "content-uuid",
    "lockedBy": "jane_doe",
    "expiresAt": "2024-01-01T01:00:00Z"
  }
}
```

## Rate Limiting

### API Endpoints
- **Public endpoints**: 100 requests/minute per IP
- **Authenticated endpoints**: 1000 requests/minute per user
- **Admin endpoints**: 500 requests/minute per user
- **WebSocket connections**: 10 connections per user

### Implementation
```javascript
// Express rate limiting middleware
const rateLimit = require('express-rate-limit');

const publicLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

const authLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.user.userId
});
```

## Monitoring & Logging

### API Metrics
- Request/response times
- Error rates by endpoint
- Authentication success/failure rates
- WebSocket connection counts

### Security Monitoring
- Failed authentication attempts
- Suspicious activity patterns
- Rate limit violations
- Content lock conflicts

### Audit Logging
- All content changes with user attribution
- Administrative actions
- Permission changes
- System configuration updates