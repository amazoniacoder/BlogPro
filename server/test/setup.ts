import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Mock WebSocket globals
global.WebSocket = vi.fn() as any;

// Setup test database connection mock
vi.mock('../db/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  pool: {
    connect: vi.fn(),
    query: vi.fn()
  }
}));