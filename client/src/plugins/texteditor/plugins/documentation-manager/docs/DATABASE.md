# Database Schema Documentation

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENTATION SCHEMA                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐
│     documentation_sections      │
├─────────────────────────────────┤
│ id (UUID, PK)                  │
│ name (VARCHAR(255))             │
│ slug (VARCHAR(255))             │
│ description (TEXT)              │
│ parent_id (UUID, FK) ──────────┐│
│ level (INTEGER)                ││
│ order_index (INTEGER)          ││
│ icon (VARCHAR(50))             ││
│ is_active (BOOLEAN)            ││
│ library_type (texteditor|site) ││
│ created_at (TIMESTAMP)         ││
│ updated_at (TIMESTAMP)         ││
└─────────────────────────────────┘│
                                  │
        ┌─────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│     documentation_content       │
├─────────────────────────────────┤
│ id (UUID, PK)                  │
│ title (VARCHAR(255))            │
│ slug (VARCHAR(255))             │
│ content (TEXT)                  │
│ excerpt (TEXT)                  │
│ section_id (UUID, FK) ─────────┘
│ library_type (texteditor|site)  │
│ is_published (BOOLEAN)          │
│ order_index (INTEGER)           │
│ created_at (TIMESTAMP)          │
│ updated_at (TIMESTAMP)          │
│ created_by (VARCHAR(255))       │
│ updated_by (VARCHAR(255))       │
└─────────────────────────────────┘
        │
        │ (1:N)
        ▼
┌─────────────────────────────────┐
│ documentation_content_versions  │
├─────────────────────────────────┤
│ id (UUID, PK)                  │
│ content_id (UUID, FK) ─────────┘
│ version (INTEGER)               │
│ title (VARCHAR(255))            │
│ content (TEXT)                  │
│ excerpt (TEXT)                  │
│ change_summary (VARCHAR(500))   │
│ created_by (VARCHAR(255))       │
│ created_at (TIMESTAMP)          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  documentation_content_locks    │
├─────────────────────────────────┤
│ id (UUID, PK)                  │
│ content_id (UUID, FK) ─────────┐│
│ user_id (VARCHAR(255))         ││
│ user_name (VARCHAR(255))       ││
│ locked_at (TIMESTAMP)          ││
│ expires_at (TIMESTAMP)         ││
└─────────────────────────────────┘│
                                  │
        ┌─────────────────────────┘
        │
        ▼
    (References documentation_content.id)
```

## Table Definitions

### documentation_sections
Hierarchical organization of documentation content.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | VARCHAR(255) | Section display name |
| `slug` | VARCHAR(255) | URL-friendly identifier |
| `description` | TEXT | Optional section description |
| `parent_id` | UUID | Self-referencing foreign key for hierarchy |
| `level` | INTEGER | Depth level in hierarchy (0 = root) |
| `order_index` | INTEGER | Display order within same level |
| `icon` | VARCHAR(50) | Optional emoji or icon identifier |
| `is_active` | BOOLEAN | Whether section is visible |
| `library_type` | ENUM | 'texteditor' or 'site' |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last modification time |

**Indexes:**
- `idx_sections_library_type` ON (library_type)
- `idx_sections_parent_id` ON (parent_id)
- `idx_sections_active` ON (is_active, library_type)

### documentation_content
Main content storage for documentation pages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `title` | VARCHAR(255) | Content title |
| `slug` | VARCHAR(255) | URL-friendly identifier |
| `content` | TEXT | Main content body (HTML) |
| `excerpt` | TEXT | Optional summary/description |
| `section_id` | UUID | Foreign key to sections table |
| `library_type` | ENUM | 'texteditor' or 'site' |
| `is_published` | BOOLEAN | Whether content is publicly visible |
| `order_index` | INTEGER | Display order within section |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last modification time |
| `created_by` | VARCHAR(255) | User who created content |
| `updated_by` | VARCHAR(255) | User who last modified content |

**Indexes:**
- `idx_content_library_type` ON (library_type)
- `idx_content_published` ON (is_published, library_type)
- `idx_content_section` ON (section_id)
- `idx_content_slug` ON (slug, library_type)

### documentation_content_versions
Version history for content changes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `content_id` | UUID | Foreign key to content table |
| `version` | INTEGER | Version number (incremental) |
| `title` | VARCHAR(255) | Title at this version |
| `content` | TEXT | Content at this version |
| `excerpt` | TEXT | Excerpt at this version |
| `change_summary` | VARCHAR(500) | Optional description of changes |
| `created_by` | VARCHAR(255) | User who made the changes |
| `created_at` | TIMESTAMP | When version was created |

**Indexes:**
- `idx_versions_content_id` ON (content_id)
- `idx_versions_version` ON (content_id, version DESC)
- `idx_versions_created_at` ON (created_at DESC)

### documentation_content_locks
Real-time editing locks to prevent conflicts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `content_id` | UUID | Foreign key to content table |
| `user_id` | VARCHAR(255) | ID of user holding lock |
| `user_name` | VARCHAR(255) | Display name of user |
| `locked_at` | TIMESTAMP | When lock was acquired |
| `expires_at` | TIMESTAMP | When lock expires (30 min default) |

**Indexes:**
- `idx_locks_content_id` ON (content_id)
- `idx_locks_expires` ON (expires_at)
- `idx_locks_user` ON (user_id)

## Database Functions

### get_content_versions(content_id UUID)
Returns version history for a specific content item.

```sql
SELECT * FROM get_content_versions('content-uuid-here');
```

### restore_content_version(content_id UUID, version INTEGER, restored_by VARCHAR)
Restores content to a specific version.

```sql
SELECT restore_content_version('content-uuid', 3, 'admin');
```

### is_content_locked(content_id UUID)
Checks if content is currently locked for editing.

```sql
SELECT * FROM is_content_locked('content-uuid-here');
```

## Triggers

### create_content_version()
Automatically creates version record when content is updated.

**Trigger:** `trigger_create_content_version`
**Event:** AFTER UPDATE ON documentation_content
**Condition:** Only when title, content, or excerpt changes

### cleanup_expired_locks()
Removes expired locks before inserting new ones.

**Trigger:** `trigger_cleanup_expired_locks`
**Event:** BEFORE INSERT ON documentation_content_locks

## Data Relationships

### Hierarchical Sections
```sql
-- Get section hierarchy
WITH RECURSIVE section_tree AS (
  SELECT id, name, parent_id, 0 as level
  FROM documentation_sections 
  WHERE parent_id IS NULL AND library_type = 'texteditor'
  
  UNION ALL
  
  SELECT s.id, s.name, s.parent_id, st.level + 1
  FROM documentation_sections s
  JOIN section_tree st ON s.parent_id = st.id
)
SELECT * FROM section_tree ORDER BY level, order_index;
```

### Content with Sections
```sql
-- Get content with section information
SELECT 
  c.id, c.title, c.slug, c.content,
  s.name as section_name, s.icon as section_icon
FROM documentation_content c
LEFT JOIN documentation_sections s ON c.section_id = s.id
WHERE c.library_type = 'texteditor' AND c.is_published = true
ORDER BY s.order_index, c.order_index;
```

### Version History
```sql
-- Get version history with change tracking
SELECT 
  v.version, v.title, v.created_by, v.created_at,
  v.change_summary,
  LAG(v.created_at) OVER (ORDER BY v.version) as previous_version_date
FROM documentation_content_versions v
WHERE v.content_id = 'content-uuid-here'
ORDER BY v.version DESC;
```

## Performance Considerations

### Query Optimization
- **Composite indexes** for common query patterns
- **Partial indexes** for published content only
- **Full-text search** indexes for content search
- **Foreign key indexes** for join performance

### Data Archival
- **Version cleanup** for old versions (configurable retention)
- **Lock cleanup** for expired locks (automatic)
- **Soft deletes** for content (is_active flag)
- **Audit trails** for administrative actions

### Scaling Strategies
- **Library partitioning** for multi-tenant scenarios
- **Read replicas** for high-traffic public pages
- **Connection pooling** for concurrent users
- **Query caching** for frequently accessed content