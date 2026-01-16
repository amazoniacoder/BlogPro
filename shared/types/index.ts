// shared/types/index.ts - Central export for all types

// Core types
export * from './user';
export * from './analytics';
export * from './menu';
export * from './deletion';

// API types (includes blog, media, contact types)
export * from './api';

// API responses (with explicit re-export to resolve conflict)
export type {
  StandardSuccessResponse,
  StandardErrorResponse,
  PaginatedResponse as StandardPaginatedResponse,
  ErrorCodes
} from './api-responses';

export {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse
} from './api-responses';

// New system types
export * from './documentation';
export * from './email';

// Database schema
export * from './schema';