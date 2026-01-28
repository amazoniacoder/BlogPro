-- Migration: Add status field to comments table
-- Date: 2026-01-28
-- Description: Add status field with default value 'approved' for existing comments

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND column_name = 'status'
    ) THEN
        ALTER TABLE comments ADD COLUMN status VARCHAR(20) DEFAULT 'approved';
        
        -- Create index for status field
        CREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status);
        
        -- Add other missing fields from the schema
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS thread_path TEXT;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS flagged_count INTEGER DEFAULT 0;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS approved_by VARCHAR;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
        
        -- Create additional indexes
        CREATE INDEX IF NOT EXISTS idx_comments_thread_path ON comments (thread_path);
        CREATE INDEX IF NOT EXISTS idx_comments_flagged ON comments (flagged_count) WHERE flagged_count > 0;
        
        RAISE NOTICE 'Status field and related columns added to comments table';
    ELSE
        RAISE NOTICE 'Status field already exists in comments table';
    END IF;
END $$;