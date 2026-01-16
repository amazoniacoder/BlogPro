# Blog Categories Migration Scripts

## Overview
These migration scripts implement a hierarchical category system for blog posts, replacing the simple string-based category field with a proper relational structure.

## Migration Order

Run these migrations in the following order:

### 1. `001_create_blog_categories.sql`
- Creates the `blog_categories` table with hierarchical structure
- Adds necessary indexes for performance
- Creates update trigger for `updated_at` field

### 2. `002_migrate_existing_categories.sql`
- Extracts unique categories from existing blog posts
- Creates category records with auto-generated slugs
- Adds `category_id` column to `blog_posts` table
- Links existing posts to new categories

### 3. `003_seed_category_hierarchy.sql`
- Creates organized category structure with subcategories
- Includes: Technology, Business, Design, Marketing, Tutorials
- Creates 2-3 levels of hierarchy for better organization

### 4. `004_finalize_category_migration.sql`
- Maps remaining posts to appropriate categories based on content
- Ensures all posts have a category assigned
- Provides verification of migration success
- Includes commented DROP statement for old category column

### 5. `005_add_category_constraints.sql`
- Adds circular reference prevention
- Creates helper functions for category operations
- Adds constraints for data integrity
- Creates unique indexes for performance

## Running Migrations

Execute each SQL file in your PostgreSQL database:

```bash
# Connect to your database
psql -h localhost -U postgres -d Porto1

# Run migrations in order
\i 001_create_blog_categories.sql
\i 002_migrate_existing_categories.sql
\i 003_seed_category_hierarchy.sql
\i 004_finalize_category_migration.sql
\i 005_add_category_constraints.sql
```

## Verification

After running all migrations, verify the setup:

```sql
-- Check category structure
SELECT 
    c1.name as category,
    c2.name as subcategory,
    c3.name as sub_subcategory,
    COUNT(bp.id) as post_count
FROM blog_categories c1
LEFT JOIN blog_categories c2 ON c2.parent_id = c1.id
LEFT JOIN blog_categories c3 ON c3.parent_id = c2.id
LEFT JOIN blog_posts bp ON bp.category_id IN (c1.id, c2.id, c3.id)
WHERE c1.parent_id IS NULL
GROUP BY c1.id, c1.name, c2.id, c2.name, c3.id, c3.name
ORDER BY c1.sort_order, c2.sort_order, c3.sort_order;

-- Check that all posts have categories
SELECT COUNT(*) as posts_without_category 
FROM blog_posts 
WHERE category_id IS NULL;
```

## Helper Functions Created

- `get_category_path(category_id)` - Returns breadcrumb path for a category
- `get_category_descendants(parent_id)` - Returns all descendant category IDs
- `check_category_circular_reference()` - Prevents circular references in hierarchy

## Rollback (if needed)

To rollback these changes:

```sql
-- Remove constraints and functions
DROP TRIGGER IF EXISTS check_category_circular_reference_trigger ON blog_categories;
DROP FUNCTION IF EXISTS check_category_circular_reference();
DROP FUNCTION IF EXISTS get_category_path(INTEGER);
DROP FUNCTION IF EXISTS get_category_descendants(INTEGER);

-- Remove category_id column from blog_posts
ALTER TABLE blog_posts DROP COLUMN IF EXISTS category_id;

-- Drop categories table
DROP TABLE IF EXISTS blog_categories CASCADE;
```

## Notes

- The old `category` column is preserved during migration for safety
- Uncomment the DROP statement in `004_finalize_category_migration.sql` when ready to remove it
- All migrations include safety checks and error handling
- Category hierarchy is limited to 10 levels to prevent infinite loops