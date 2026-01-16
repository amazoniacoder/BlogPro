import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock WebSocket
const MockWebSocket = vi.fn(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  send: vi.fn(),
  readyState: 1,
})) as any;

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

global.WebSocket = MockWebSocket;

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
);

// Mock window.getSelection for text editor
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    getRangeAt: vi.fn(),
    addRange: vi.fn(),
    removeAllRanges: vi.fn(),
    toString: vi.fn(() => ''),
    rangeCount: 0
  }))
});

// Mock document.createRange for text editor
Object.defineProperty(document, 'createRange', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    setStart: vi.fn(),
    setEnd: vi.fn(),
    collapse: vi.fn(),
    selectNodeContents: vi.fn()
  }))
});

// Mock performance.now for performance tests
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now())
  }
});
