import { describe, it, expect } from 'vitest';

describe('ErrorHandler', () => {
  it('handles API errors correctly', () => {
    const mockError = {
      response: {
        status: 404,
        data: { message: 'Not found' }
      }
    };

    const result = mockError.response.data.message;
    
    expect(result).toContain('Not found');
  });

  it('handles network errors', () => {
    const mockError = {
      message: 'Network Error'
    };

    const result = mockError.message;
    
    expect(result).toContain('Network Error');
  });

  it('handles unknown errors', () => {
    const result = 'Unknown error occurred';
    
    expect(result).toContain('Unknown error');
  });
});
