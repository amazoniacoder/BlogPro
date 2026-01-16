import { describe, it, expect } from 'vitest';

describe('Date Utils', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-01');
    const formatted = date.toLocaleDateString();
    
    expect(formatted).toContain('2024');
  });

  it('calculates time difference', () => {
    const now = new Date();
    const past = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
    
    const diff = now.getTime() - past.getTime();
    expect(diff).toBeGreaterThan(0);
  });

  it('validates date format', () => {
    const validDate = '2024-01-01';
    const invalidDate = 'invalid-date';
    
    expect(new Date(validDate).toString()).not.toBe('Invalid Date');
    expect(new Date(invalidDate).toString()).toBe('Invalid Date');
  });
});
