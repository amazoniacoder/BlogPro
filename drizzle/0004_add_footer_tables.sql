-- Migration: Add Footer Editor Tables
-- Created: 2024-01-01
-- Description: Add footer_configs and footer_history tables for the Footer Visual Editor

-- Create footer_configs table
CREATE TABLE IF NOT EXISTS footer_configs (
  id SERIAL PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT FALSE,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL
);

-- Create footer_history table
CREATE TABLE IF NOT EXISTS footer_history (
  id SERIAL PRIMARY KEY,
  footer_config_id INTEGER REFERENCES footer_configs(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  change_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_footer_configs_active ON footer_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_footer_configs_created_by ON footer_configs(created_by);
CREATE INDEX IF NOT EXISTS idx_footer_history_config_id ON footer_history(footer_config_id);
CREATE INDEX IF NOT EXISTS idx_footer_history_created_at ON footer_history(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_footer_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_footer_configs_updated_at
  BEFORE UPDATE ON footer_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_footer_configs_updated_at();