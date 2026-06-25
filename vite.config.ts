import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const require = createRequire(import.meta.url)

// https://vite.dev/config/
export default defineConfig({
  root: projectRoot,
  base: process.env.VITE_BASE_PATH ?? './',
  plugins: [react()],
  resolve: {
    alias: {
      'react-transition-group/TransitionGroupContext': require.resolve('react-transition-group/cjs/TransitionGroupContext.js'),
      'react-transition-group/Transition': require.resolve('react-transition-group/cjs/Transition.js'),
      'react-transition-group/CSSTransition': require.resolve('react-transition-group/cjs/CSSTransition.js'),
      'react-transition-group/TransitionGroup': require.resolve('react-transition-group/cjs/TransitionGroup.js'),
    },
  },
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
