-- Update old social media field names to new ones
UPDATE settings SET key = 'youtubeUrl' WHERE key = 'facebookUrl';
UPDATE settings SET key = 'vkUrl' WHERE key = 'twitterUrl';
UPDATE settings SET key = 'telegramUrl' WHERE key = 'instagramUrl';

-- Insert new social media settings if they don't exist
INSERT INTO settings (key, value) VALUES 
('youtubeUrl', ''),
('vkUrl', ''),
('telegramUrl', '')
ON CONFLICT (key) DO NOTHING;