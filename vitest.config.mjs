import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    css: false,
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/services/**', 'src/utils/**', 'src/stores/**'],
      // Tauri/BLE/Web-Sensor integration layers require real device or
      // native runtimes; they are exercised by Playwright e2e tests instead.
      exclude: [
        'src/services/bleService.jsx',
        'src/services/tauriBle.js',
        'src/services/WebSensorServices/**',
        '**/index.jsx',
        '**/__tests__/**',
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
