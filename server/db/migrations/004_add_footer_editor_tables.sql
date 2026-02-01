-- Footer Visual Editor Tables Migration
-- File: 004_add_footer_editor_tables.sql

-- Таблица конфигураций футера
CREATE TABLE IF NOT EXISTS footer_configs (
  id SERIAL PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT FALSE,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Таблица истории изменений футера
CREATE TABLE IF NOT EXISTS footer_history (
  id SERIAL PRIMARY KEY,
  footer_config_id INTEGER REFERENCES footer_configs(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  change_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_footer_configs_active ON footer_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_configs_created_by ON footer_configs(created_by);
CREATE INDEX IF NOT EXISTS idx_footer_history_config_id ON footer_history(footer_config_id);
CREATE INDEX IF NOT EXISTS idx_footer_history_created_at ON footer_history(created_at DESC);

-- Ограничение: только одна активная конфигурация
CREATE UNIQUE INDEX IF NOT EXISTS idx_footer_configs_single_active 
ON footer_configs(is_active) WHERE is_active = true;

-- Вставка дефолтной конфигурации футера
INSERT INTO footer_configs (config, is_active, created_by) 
SELECT 
  '{
    "layout": {
      "type": "grid",
      "columns": 3,
      "gap": "2rem",
      "maxWidth": "1200px"
    },
    "blocks": [
      {
        "id": "brand-block",
        "type": "brand",
        "position": {"x": 0, "y": 0},
        "size": {"width": "100%", "height": "auto"},
        "content": {
          "title": "BlogPro",
          "description": "Профессиональная блог-платформа"
        },
        "styles": {
          "textAlign": "left",
          "color": "#333"
        }
      }
    ],
    "styles": {
      "theme": "light",
      "backgroundColor": "#f8f9fa",
      "textColor": "#333333",
      "linkColor": "#007bff",
      "borderColor": "#dee2e6",
      "padding": "3rem 0",
      "margin": "0"
    },
    "responsive": {
      "mobile": {
        "layout": {"columns": 1}
      },
      "tablet": {
        "layout": {"columns": 2}
      }
    },
    "visibility": {
      "showOnScroll": false,
      "hideOnPages": [],
      "showOnlyOnPages": []
    }
  }'::jsonb,
  true,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM footer_configs WHERE is_active = true);