-- Drop dependent tables first
DROP TABLE IF EXISTS "mailing_campaigns" CASCADE;
DROP TABLE IF EXISTS "mailing_list_recipients" CASCADE;
DROP TABLE IF EXISTS "mailing_lists" CASCADE;
DROP TABLE IF EXISTS "email_templates" CASCADE;

-- Create email templates table
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create mailing lists table
CREATE TABLE "mailing_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"template_id" integer REFERENCES "email_templates"("id"),
	"status" varchar(50) DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create mailing list recipients table
CREATE TABLE "mailing_list_recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"mailing_list_id" integer REFERENCES "mailing_lists"("id"),
	"user_id" varchar REFERENCES "users"("id"),
	"status" varchar(50) DEFAULT 'pending'
);

-- Create mailing campaigns table
CREATE TABLE "mailing_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"mailing_list_id" integer REFERENCES "mailing_lists"("id"),
	"sent_at" timestamp,
	"total_recipients" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'pending'
);