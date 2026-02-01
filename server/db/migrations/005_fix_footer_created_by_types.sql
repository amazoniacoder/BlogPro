-- Fix Footer Editor Tables - Update created_by columns to VARCHAR
-- This script fixes the data type mismatch between users.id (VARCHAR) and footer table references (INTEGER)

-- First, check if tables exist and have the wrong column type
DO $$
BEGIN
    -- Fix footer_configs table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'footer_configs' 
        AND column_name = 'created_by' 
        AND data_type = 'integer'
    ) THEN
        -- Drop foreign key constraint first
        ALTER TABLE footer_configs DROP CONSTRAINT IF EXISTS footer_configs_created_by_users_id_fk;
        
        -- Change column type to VARCHAR
        ALTER TABLE footer_configs ALTER COLUMN created_by TYPE VARCHAR USING created_by::VARCHAR;
        
        -- Re-add foreign key constraint
        ALTER TABLE footer_configs ADD CONSTRAINT footer_configs_created_by_users_id_fk 
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
            
        RAISE NOTICE 'Fixed footer_configs.created_by column type';
    END IF;

    -- Fix footer_history table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'footer_history' 
        AND column_name = 'created_by' 
        AND data_type = 'integer'
    ) THEN
        -- Drop foreign key constraint first
        ALTER TABLE footer_history DROP CONSTRAINT IF EXISTS footer_history_created_by_users_id_fk;
        
        -- Change column type to VARCHAR
        ALTER TABLE footer_history ALTER COLUMN created_by TYPE VARCHAR USING created_by::VARCHAR;
        
        -- Re-add foreign key constraint
        ALTER TABLE footer_history ADD CONSTRAINT footer_history_created_by_users_id_fk 
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
            
        RAISE NOTICE 'Fixed footer_history.created_by column type';
    END IF;
END $$;