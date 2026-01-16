/**
 * Unit tests for positionUtils
 */

import { vi } from 'vitest';
import { calculateContextMenuPosition, getMenuDimensions } from '../../shared/utils/positionUtils';

// Mock getBoundingClientRect
const mockGetBoundingClientRect = (rect: Partial<DOMRect>) => {
  return vi.fn(() => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => {},
    ...rect
  })) as any;
};

describe('positionUtils', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
  });

  describe('calculateContextMenuPosition', () => {
    test('should position menu below target element', () => {
      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect({
          left: 100,
          top: 200,
          bottom: 220,
          right: 150
        }),
        closest: vi.fn(() => null)
      } as any;

      const position = calculateContextMenuPosition(mockElement);

      expect(position.x).toBe(100);
      expect(position.y).toBe(225); // bottom + 5
    });

    test('should adjust position when menu would overflow viewport', () => {
      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect({
          left: 900, // Near right edge
          top: 700, // Near bottom edge
          bottom: 720,
          right: 950
        }),
        closest: vi.fn(() => null)
      } as any;

      const position = calculateContextMenuPosition(mockElement, { width: 200, height: 150 });

      expect(position.x).toBeLessThan(900); // Should be adjusted left
      expect(position.y).toBeLessThan(720); // Should be adjusted up
    });

    test('should respect container boundaries', () => {
      const mockContainer = {
        getBoundingClientRect: mockGetBoundingClientRect({
          left: 50,
          top: 50,
          right: 500,
          bottom: 400
        })
      };

      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect({
          left: 450,
          top: 350,
          bottom: 370,
          right: 480
        }),
        closest: vi.fn(() => mockContainer)
      } as any;

      const position = calculateContextMenuPosition(mockElement, { width: 200, height: 150 });

      expect(position.x).toBeLessThanOrEqual(500 - 200); // Within container right boundary
      expect(position.y).toBeLessThanOrEqual(400 - 150); // Within container bottom boundary
    });
  });

  describe('getMenuDimensions', () => {
    test('should return actual dimensions from element', () => {
      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect({
          width: 250,
          height: 180
        })
      } as any;

      const dimensions = getMenuDimensions(mockElement);

      expect(dimensions.width).toBe(250);
      expect(dimensions.height).toBe(180);
    });

    test('should return default dimensions when no element provided', () => {
      const dimensions = getMenuDimensions();

      expect(dimensions.width).toBe(200);
      expect(dimensions.height).toBe(150);
    });
  });
});
