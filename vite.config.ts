import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  root: projectRoot,
  base: process.env.VITE_BASE_PATH ?? './',
  plugins: [react()],
  resolve: {
    alias: {
      'react-transition-group/TransitionGroupContext': path.resolve('./node_modules/react-transition-group/cjs/TransitionGroupContext.js'),
      'react-transition-group/Transition': path.resolve('./node_modules/react-transition-group/cjs/Transition.js'),
      'react-transition-group/CSSTransition': path.resolve('./node_modules/react-transition-group/cjs/CSSTransition.js'),
      'react-transition-group/TransitionGroup': path.resolve('./node_modules/react-transition-group/cjs/TransitionGroup.js'),
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