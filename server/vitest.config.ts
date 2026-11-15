import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globalSetup: ['./tests/setup/globalSetup.ts'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: [
        'src/modules/**/*.service.ts',
        'src/modules/**/totals.ts',
        'src/modules/**/balance.ts',
        'src/modules/**/progress.ts',
        'src/modules/**/formulas.ts',
        'src/modules/**/machine.ts',
        'src/modules/**/lifecycle.ts',
        'src/modules/**/eligibility.ts',
        'src/shared/**',
      ],
      exclude: [
        'tests/**',
        'src/generated/**',
        'src/**/*.routes.ts',
        'src/**/*.schemas.ts',
        'src/types/**',
        'src/config/**',
        'src/server.ts',
        'src/app.ts',
        '**/*.d.ts',
      ],
    },
  },
});
