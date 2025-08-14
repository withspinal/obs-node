import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.setup.*',
        'demo-*.js',
        'test-*.js',
        'examples/',
        '**/*.test.js',
        '**/*.test.ts',
        'src/cli/**/*'
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 70,
          lines: 60,
          statements: 60
        },
        './src/analytics/': {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90
        },
        './src/runtime/': {
          branches: 70,
          functions: 80,
          lines: 80,
          statements: 80
        },
        './src/pricing/': {
          branches: 90,
          functions: 100,
          lines: 100,
          statements: 100
        }
      }
    }
  },
})
