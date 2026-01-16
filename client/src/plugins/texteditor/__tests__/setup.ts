/**
 * Test Setup Configuration
 * Jest setup and configuration for documentation manager tests
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class {
  root = null;
  rootMargin = '';
  thresholds = [];
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
  takeRecords() { return []; }
} as any;

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Setup default fetch responses
beforeEach(() => {
  (fetch as any).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ sections: [], content: [] }),
  });
  
  localStorageMock.getItem.mockReturnValue(null);
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
