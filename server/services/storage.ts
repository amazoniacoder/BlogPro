import * as blogService from './blogService';
import * as mediaService from './mediaService';
import * as userService from './userService';
import * as contactService from './contactService';
import * as categoryService from './categoryService';

export const storage = {
  // Blog posts
  getBlogPosts: blogService.getBlogPosts,
  getBlogPostsPaginated: blogService.getBlogPostsPaginated,
  getFeaturedBlogPosts: blogService.getFeaturedBlogPosts,
  getBlogPost: blogService.getBlogPost,
  createBlogPost: blogService.createBlogPost,
  updateBlogPost: blogService.updateBlogPost,
  deleteBlogPost: blogService.deleteBlogPost,
  
  // Media files
  getMediaFiles: mediaService.getMediaFiles,
  getMediaFilesPaginated: mediaService.getMediaFilesPaginated,
  getMediaFile: mediaService.getMediaFile,
  createMediaFile: mediaService.createMediaFile,
  updateMediaFile: mediaService.updateMediaFile,
  deleteMediaFile: mediaService.deleteMediaFile,
  
  // Users
  getUsers: userService.getAllUsers,
  getUsersPaginated: userService.getUsersPaginated,
  getUserById: userService.getUserById,
  createUser: userService.createUser,
  updateUser: userService.updateUser,
  deleteUser: userService.deleteUser,
  verifyUserEmail: userService.verifyUserEmail,
  
  // Contacts
  getContacts: contactService.getContacts,
  getContact: contactService.getContact,
  createContact: contactService.createContact,
  
  // Categories
  getCategories: categoryService.categoryService.getCategoriesTree,
};