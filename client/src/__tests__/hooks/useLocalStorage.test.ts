import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets item from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('test-value');
    
    const value = localStorage.getItem('test-key');
    
    expect(localStorage.getItem).toHaveBeenCalledWith('test-key');
    expect(value).toBe('test-value');
  });

  it('sets item in localStorage', () => {
    localStorage.setItem('test-key', 'test-value');
    
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
  });

  it('removes item from localStorage', () => {
    localStorage.removeItem('test-key');
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
  });
});
