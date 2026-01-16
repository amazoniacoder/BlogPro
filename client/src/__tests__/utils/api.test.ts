import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest } from '../../lib/queryClient';

// Mock fetch
global.fetch = vi.fn();

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('makes GET request successfully', async () => {
    const mockResponse = { data: 'test' };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await apiRequest('GET', '/api/test');

    expect(fetch).toHaveBeenCalledWith('/api/test', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(mockResponse);
  });

  it('makes POST request with data', async () => {
    const mockData = { name: 'test' };
    const mockResponse = { id: 1, ...mockData };
    
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await apiRequest('POST', '/api/test', mockData);

    expect(fetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockData),
    });
    expect(result).toEqual(mockResponse);
  });

  it('handles API errors', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ message: 'Not Found' }),
    } as Response);

    await expect(apiRequest('GET', '/api/nonexistent')).rejects.toThrow('Not Found');
  });
});
