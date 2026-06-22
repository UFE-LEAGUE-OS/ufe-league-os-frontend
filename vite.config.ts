import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  root: projectRoot,
  base: process.env.VITE_BASE_PATH ?? './',
  plugins: [react()],
  test: {
    root: projectRoot,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    exclude: ['**/node_modules/**', '**/.worktrees/**'],
    clearMocks: true,
    restoreMocks: true,
  },
})
