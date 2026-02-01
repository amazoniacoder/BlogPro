// shared/types/schema.ts - Updated with blog categories and analytics
import { pgTable, serial, varchar, text, integer, timestamp, boolean, decimal, jsonb, inet } from 'drizzle-orm/pg-core';

// Blog Categories Table
export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  parentId: integer('parent_id'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Updated Blog Posts Table
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content: text('content').notNull(),
  categoryId: integer('category_id').references(() => blogCategories.id, { onDelete: 'set null' }),
  imageUrl: text('image_url').default(''),
  thumbnailUrl: text('thumbnail_url'),
  projectUrl: text('project_url'),
  technologies: text('technologies').array().default([]),
  tags: text('tags').array().default([]),
  slug: text('slug'),
  status: varchar('status', { length: 20 }).default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Existing tables (unchanged)
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  username: varchar('username').unique(),
  email: varchar('email').unique().notNull(),
  password: varchar('password').notNull(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  role: varchar('role').default('user').notNull(),
  emailVerified: boolean('email_verified').default(false),
  verificationToken: varchar('verification_token'),
  resetPasswordToken: varchar('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
  profileImageUrl: varchar('profile_image_url'),
  emailNotifications: boolean('email_notifications').default(true),
  marketingEmails: boolean('marketing_emails').default(false),
  isBlocked: boolean('is_blocked').default(false),
  isScheduledForDeletion: boolean('is_scheduled_for_deletion').default(false),
  deletionScheduledAt: timestamp('deletion_scheduled_at'),
  deletionReason: text('deletion_reason'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const mediaFiles = pgTable('media_files', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  category: varchar('category', { length: 50 }),
  source: varchar('source', { length: 20 }).default('general'),
  folderPath: varchar('folder_path', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow()
});

export const sessions = pgTable('sessions', {
  sid: varchar('sid').primaryKey(),
  sess: text('sess').notNull(),
  expire: timestamp('expire').notNull()
});

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).unique().notNull(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Analytics Tables
export const analyticsPageViews = pgTable('analytics_page_views', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  pagePath: varchar('page_path', { length: 500 }).notNull(),
  pageTitle: varchar('page_title', { length: 500 }),
  referrer: varchar('referrer', { length: 500 }),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),
  country: varchar('country', { length: 2 }),
  deviceType: varchar('device_type', { length: 50 }),
  browser: varchar('browser', { length: 100 }),
  os: varchar('os', { length: 100 }),
  screenResolution: varchar('screen_resolution', { length: 20 }),
  timeOnPage: integer('time_on_page').default(0),
  createdAt: timestamp('created_at').defaultNow()
});

export const analyticsSessions = pgTable('analytics_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'set null' }),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  country: varchar('country', { length: 2 }),
  deviceType: varchar('device_type', { length: 50 }),
  browser: varchar('browser', { length: 100 }),
  os: varchar('os', { length: 100 }),
  entryPage: varchar('entry_page', { length: 500 }),
  exitPage: varchar('exit_page', { length: 500 }),
  pageViewsCount: integer('page_views_count').default(0),
  durationSeconds: integer('duration_seconds').default(0),
  isBounce: boolean('is_bounce').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const analyticsDailyStats = pgTable('analytics_daily_stats', {
  id: serial('id').primaryKey(),
  date: varchar('date', { length: 10 }).unique().notNull(),
  pageViews: integer('page_views').default(0),
  uniqueVisitors: integer('unique_visitors').default(0),
  sessions: integer('sessions').default(0),
  bounceRate: decimal('bounce_rate', { precision: 5, scale: 2 }).default('0.00'),
  avgSessionDuration: integer('avg_session_duration').default(0),
  topPages: jsonb('top_pages').default('[]'),
  topReferrers: jsonb('top_referrers').default('[]'),
  deviceBreakdown: jsonb('device_breakdown').default('{}'),
  countryBreakdown: jsonb('country_breakdown').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const analyticsRealtime = pgTable('analytics_realtime', {
  id: serial('id').primaryKey(),
  activeUsers: integer('active_users').default(0),
  currentPageViews: jsonb('current_page_views').default('{}'),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Documentation System Tables
export const documentationSections = pgTable('documentation_sections', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  parentId: integer('parent_id'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const documentationContent = pgTable('documentation_content', {
  id: serial('id').primaryKey(),
  sectionId: integer('section_id').references(() => documentationSections.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  tags: text('tags').array().default([]),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  authorId: varchar('author_id').references(() => users.id, { onDelete: 'set null' }),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const documentationMenu = pgTable('documentation_menu', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }),
  parentId: integer('parent_id'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const documentationSearchIndex = pgTable('documentation_search_index', {
  id: serial('id').primaryKey(),
  contentId: integer('content_id').references(() => documentationContent.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  searchVector: text('search_vector'),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const documentationFiles = pgTable('documentation_files', {
  id: serial('id').primaryKey(),
  contentId: integer('content_id').references(() => documentationContent.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const documentationConversions = pgTable('documentation_conversions', {
  id: serial('id').primaryKey(),
  sourceFormat: varchar('source_format', { length: 50 }).notNull(),
  targetFormat: varchar('target_format', { length: 50 }).notNull(),
  sourceContent: text('source_content').notNull(),
  convertedContent: text('converted_content').notNull(),
  status: varchar('status', { length: 20 }).default('completed'),
  createdAt: timestamp('created_at').defaultNow()
});

export const documentationContentVersions = pgTable('documentation_content_versions', {
  id: serial('id').primaryKey(),
  contentId: integer('content_id').references(() => documentationContent.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  changeLog: text('change_log'),
  authorId: varchar('author_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow()
});

export const documentationContentLocks = pgTable('documentation_content_locks', {
  id: serial('id').primaryKey(),
  contentId: integer('content_id').references(() => documentationContent.id, { onDelete: 'cascade' }),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }),
  lockedAt: timestamp('locked_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull()
});

// Email System Tables
export const emailTemplates = pgTable('email_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),
  variables: jsonb('variables').default('[]'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const mailingLists = pgTable('mailing_lists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  subscriberCount: integer('subscriber_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const mailingCampaigns = pgTable('mailing_campaigns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  templateId: integer('template_id').references(() => emailTemplates.id, { onDelete: 'set null' }),
  mailingListId: integer('mailing_list_id').references(() => mailingLists.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('draft'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  recipientCount: integer('recipient_count').default(0),
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const mailingListRecipients = pgTable('mailing_list_recipients', {
  id: serial('id').primaryKey(),
  mailingListId: integer('mailing_list_id').references(() => mailingLists.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  isActive: boolean('is_active').default(true),
  subscribedAt: timestamp('subscribed_at').defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at')
});

export const mailingListSubscriptions = pgTable('mailing_list_subscriptions', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  mailingListId: integer('mailing_list_id').references(() => mailingLists.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('subscribed'),
  subscribedAt: timestamp('subscribed_at').defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at'),
  confirmationToken: varchar('confirmation_token', { length: 255 }),
  confirmedAt: timestamp('confirmed_at')
});

// Products Table (existing)
export const products = pgTable('products', {
  id: varchar('id').primaryKey(), // UUID as varchar
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content'),
  price: decimal('price', { precision: 10, scale: 2 }),
  image: varchar('image', { length: 500 }),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  categoryId: varchar('category_id'), // UUID references product_categories
  features: jsonb('features').default('[]'),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// E-commerce Tables
export const cartItems = pgTable('cart_items', {
  id: varchar('id').primaryKey(), // UUID as varchar
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 255 }),
  productId: varchar('product_id'), // UUID as varchar, references products.id
  quantity: integer('quantity').notNull().default(1),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const orders = pgTable('orders', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'set null' }),
  orderNumber: varchar('order_number', { length: 50 }).unique().notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  shippingAmount: decimal('shipping_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentTransactionId: varchar('payment_transaction_id', { length: 255 }),
  shippingAddress: jsonb('shipping_address'),
  billingAddress: jsonb('billing_address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const orderItems = pgTable('order_items', {
  id: varchar('id').primaryKey(),
  orderId: varchar('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  productId: varchar('product_id'),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  productSnapshot: jsonb('product_snapshot')
});

export const paymentTransactions = pgTable('payment_transactions', {
  id: varchar('id').primaryKey(),
  orderId: varchar('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  transactionId: varchar('transaction_id', { length: 255 }).unique(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  gateway: varchar('gateway', { length: 50 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  status: varchar('status', { length: 50 }).default('pending'),
  gatewayResponse: jsonb('gateway_response'),
  createdAt: timestamp('created_at').defaultNow()
});

// Footer Editor Tables
export const footerConfigs = pgTable('footer_configs', {
  id: serial('id').primaryKey(),
  version: integer('version').notNull().default(1),
  isActive: boolean('is_active').default(false),
  config: jsonb('config').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: varchar('created_by').references(() => users.id, { onDelete: 'set null' })
});

export const footerHistory = pgTable('footer_history', {
  id: serial('id').primaryKey(),
  footerConfigId: integer('footer_config_id').references(() => footerConfigs.id, { onDelete: 'cascade' }),
  config: jsonb('config').notNull(),
  changeDescription: text('change_description'),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: varchar('created_by').references(() => users.id, { onDelete: 'set null' })
});

