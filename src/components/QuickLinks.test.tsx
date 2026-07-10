import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import QuickLinks from './QuickLinks'

describe('QuickLinks', () => {
  it('renders the core fan shortcuts', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QuickLinks />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /fixtures/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /results/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /standings/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /clubs/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /unions/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /news/i })).toBeInTheDocument()
  })
})