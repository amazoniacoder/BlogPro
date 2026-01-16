import { describe, it, expect, beforeEach } from 'vitest';
import { clientCache } from '../../utils/clientCache';

describe('ClientCache', () => {
  beforeEach(() => {
    clientCache.clear();
  });

  it('stores and retrieves data', () => {
    const testData = { id: 1, name: 'test' };
    
    clientCache.set('test-key', testData, 1000);
    const retrieved = clientCache.get('test-key');
    
    expect(retrieved).toEqual(testData);
  });

  it('returns null for non-existent keys', () => {
    const retrieved = clientCache.get('non-existent');
    expect(retrieved).toBeNull();
  });

  it('invalidates cache entries', () => {
    clientCache.set('test-key', { data: 'test' }, 1000);
    clientCache.invalidate('test-key');
    
    const retrieved = clientCache.get('test-key');
    expect(retrieved).toBeNull();
  });
});
