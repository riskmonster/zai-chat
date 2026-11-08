import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const testsDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(testsDir, '..')

export default defineConfig({
  root: projectRoot,
  cacheDir: path.resolve(projectRoot, '.cache/vitest'),
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: [path.resolve(testsDir, 'test-setup.ts')],
  },
})
