import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Hero from './Hero'

function renderHero() {
  return render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>,
  )
}

describe('Hero', () => {
  it('communicates the main landing page promise', () => {
    renderHero()

    expect(screen.getByRole('heading', { name: /every game\. every fan\./i })).toBeInTheDocument()
    expect(screen.getByText(/follow your teams/i)).toBeInTheDocument()
    expect(screen.getByText('20+')).toBeInTheDocument()
    expect(screen.getByText('150+')).toBeInTheDocument()
    expect(screen.getByText('500+')).toBeInTheDocument()
    expect(screen.getByText('1M+')).toBeInTheDocument()
  })

  it('shows calls to action for competition browsing, sponsors, and sign up', async () => {
    const user = userEvent.setup()

    renderHero()

    expect(screen.getByRole('button', { name: /browse competitions/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /become a sponsor/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(window.location.pathname).toBe('/')
  })
})
