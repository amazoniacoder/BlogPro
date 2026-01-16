import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAdminData } from '../../hooks/useAdminData';

// Mock the API
vi.mock('../../lib/queryClient', () => ({
  apiRequest: vi.fn()
}));

describe('useAdminData', () => {
  it('fetches admin data successfully', async () => {
    const mockData = { users: 10, posts: 5, media: 20 };
    const { apiRequest } = await import('../../lib/queryClient');
    vi.mocked(apiRequest).mockResolvedValue(mockData);

    const { result } = renderHook(() => useAdminData());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles error state', async () => {
    const { apiRequest } = await import('../../lib/queryClient');
    vi.mocked(apiRequest).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useAdminData());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.loading).toBe(false);
    });
  });
});
