-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES blog_categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent_id ON blog_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_sort_order ON blog_categories(sort_order);

-- Add constraint to prevent empty names
ALTER TABLE blog_categories ADD CONSTRAINT IF NOT EXISTS check_name_not_empty CHECK (LENGTH(TRIM(name)) > 0);

-- Create unique constraint for name within same parent level
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_categories_name_parent 
ON blog_categories (name, COALESCE(parent_id, 0));

-- Update blog_posts table to add category_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'category_id') THEN
        ALTER TABLE blog_posts ADD COLUMN category_id INTEGER REFERENCES blog_categories(id) ON DELETE SET NULL;
        CREATE INDEX idx_blog_posts_category_id ON blog_posts(category_id);
    END IF;
END $$;

-- Insert some default categories
INSERT INTO blog_categories (name, slug, description, sort_order) VALUES
('Technology', 'technology', 'Technology related posts', 1),
('Web Development', 'web-development', 'Web development tutorials and tips', 2),
('Programming', 'programming', 'Programming languages and concepts', 3),
('Design', 'design', 'UI/UX and graphic design', 4),
('General', 'general', 'General blog posts', 5)
ON CONFLICT (slug) DO NOTHING;

-- Create some subcategories
INSERT INTO blog_categories (name, slug, description, parent_id, sort_order) VALUES
('Frontend', 'frontend', 'Frontend development', (SELECT id FROM blog_categories WHERE slug = 'web-development'), 1),
('Backend', 'backend', 'Backend development', (SELECT id FROM blog_categories WHERE slug = 'web-development'), 2),
('JavaScript', 'javascript', 'JavaScript programming', (SELECT id FROM blog_categories WHERE slug = 'programming'), 1),
('Python', 'python', 'Python programming', (SELECT id FROM blog_categories WHERE slug = 'programming'), 2),
('React', 'react', 'React framework', (SELECT id FROM blog_categories WHERE slug = 'frontend'), 1),
('Node.js', 'nodejs', 'Node.js development', (SELECT id FROM blog_categories WHERE slug = 'backend'), 1)
ON CONFLICT (slug) DO NOTHING;