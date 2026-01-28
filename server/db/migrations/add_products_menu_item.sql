-- Migration: Add Products menu item
-- Date: 2026-01-28
-- Description: Add "Продукты" menu item to main navigation

-- Check if Products menu item already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM menu_items 
        WHERE title = 'Продукты' AND url = '/products'
    ) THEN
        -- Get the next order index after Blog (assuming Blog has order_index = 1)
        INSERT INTO menu_items (
            title, 
            url, 
            parent_id, 
            order_index, 
            is_active, 
            target, 
            icon, 
            type,
            created_at,
            updated_at
        ) VALUES (
            'Продукты',
            '/products',
            NULL,
            2,  -- After Blog (1) and before other items
            true,
            '_self',
            'shopping-bag',  -- Icon for products
            'manual',
            NOW(),
            NOW()
        );
        
        -- Update order_index for existing items that should come after Products
        UPDATE menu_items 
        SET order_index = order_index + 1 
        WHERE order_index >= 2 
        AND title != 'Продукты'
        AND parent_id IS NULL;
        
        RAISE NOTICE 'Products menu item added successfully';
    ELSE
        RAISE NOTICE 'Products menu item already exists';
    END IF;
END $$;