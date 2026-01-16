import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

describe('useAnalyticsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockClear();
  });

  it('should fetch analytics data successfully', async () => {
    const mockResponse = {
      totalPageViews: 100,
      uniqueVisitors: 50,
      totalSessions: 75,
      bounceRate: 40,
      avgSessionDuration: 120,
      topPages: [],
      topReferrers: [],
      deviceStats: {},
      countryStats: {},
      chartData: []
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { result } = renderHook(() => useAnalyticsData(7));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAnalyticsData(7));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBeNull();
  });

  it('should handle HTTP errors', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403
    });

    const { result } = renderHook(() => useAnalyticsData(7));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Access denied. Admin privileges required.');
  });

  it('should detect offline status', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false });

    const { result } = renderHook(() => useAnalyticsData(7));

    await waitFor(() => {
      expect(result.current.isOffline).toBe(true);
    });
  });
});
