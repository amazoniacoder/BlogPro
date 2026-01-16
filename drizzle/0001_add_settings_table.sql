CREATE TABLE IF NOT EXISTS "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);

-- Insert default settings
INSERT INTO "settings" ("key", "value") VALUES 
('contactRecipientEmail', 'admin@blogpro.com'),
('contactAutoReply', 'true'),
('contactAutoReplyMessage', 'Thank you for your message. We will get back to you soon.')
ON CONFLICT ("key") DO NOTHING;