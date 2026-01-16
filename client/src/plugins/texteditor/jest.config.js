/**
 * Vitest configuration for text editor tests
 * Updated to work without Jest dependencies
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    include: [
      '__tests__/**/*.test.ts',
      '__tests__/**/*.test.tsx'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'services/**/*.ts',
        'utils/**/*.ts',
        'hooks/**/*.ts',
        'components/**/*.tsx'
      ],
      exclude: [
        '**/*.d.ts',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    testTimeout: 10000
  }
});