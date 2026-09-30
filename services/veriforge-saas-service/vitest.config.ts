import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    clearMocks: true,
    // Unit tests mock Prisma; integration suites opt in via RUN_INTEGRATION=1
    fileParallelism: false,
  },
});
