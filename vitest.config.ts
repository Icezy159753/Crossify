import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Building real ExcelJS workbooks (export/settings roundtrip) is slow under concurrent load;
    // the 5s default flakes when all suites run together. Headroom for large workbooks.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
})
