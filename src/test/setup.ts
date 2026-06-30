import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Fix: react-transition-group ES module resolution error with MUI
vi.mock('react-transition-group/TransitionGroupContext', async () => {
  const mod = await vi.importActual('react-transition-group/cjs/TransitionGroupContext.js')
  return mod
})

vi.mock('react-transition-group/Transition', async () => {
  const mod = await vi.importActual('react-transition-group/cjs/Transition.js')
  return mod
})

vi.mock('react-transition-group/CSSTransition', async () => {
  const mod = await vi.importActual('react-transition-group/cjs/CSSTransition.js')
  return mod
})

vi.mock('react-transition-group/TransitionGroup', async () => {
  const mod = await vi.importActual('react-transition-group/cjs/TransitionGroup.js')
  return mod
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})