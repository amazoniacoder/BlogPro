import { lazy } from 'react';

// Lazy load admin components
export const AdminDashboard = lazy(() => import('../admin/pages/dashboard'));
export const BlogEditor = lazy(() => import('../admin/pages/blog'));
export const MediaManager = lazy(() => import('../admin/pages/media'));
export const UserManager = lazy(() => import('../admin/pages/users'));

// Lazy load page components
export const BlogDetailPage = lazy(() => import('../pages/blog-detail'));
export const ContactPage = lazy(() => import('../pages/contact'));
export const ProfilePage = lazy(() => import('../pages/profile'));

// Lazy load heavy components
export const TextEditor = lazy(() => import('../plugins/texteditor/core/components/ContentEditableEditor').then(module => ({ default: module.ContentEditableEditor })));
export const ImageGallery = lazy(() => import('../admin/components/ImageGalleryUpload').then(module => ({ default: module.ImageGalleryUpload })));
