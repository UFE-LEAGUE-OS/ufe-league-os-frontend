import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Landing from '../pages/landing/Landing'
import TicketsLandingPage from '../pages/landing/TicketsLandingPage'

describe('Feature: Fan discovers League OS from the public landing page', () => {
  it('Scenario: a guest can understand the product and find public entry points', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /every game\. every fan\./i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByText(/featured competitons/i)).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: /fixtures/i })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: /news/i })[0]).toBeInTheDocument()
  })
})

describe('Feature: Guest buys a match ticket', () => {
  it('Scenario: the guest filters ticket listings and is asked to sign in before checkout', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <TicketsLandingPage />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: /national basketball league/i }))
    expect(screen.getByText(/city oilers/i)).toBeInTheDocument()
    expect(screen.getByText(/kiu titans/i)).toBeInTheDocument()
    expect(screen.queryByText(/kcca fc/i)).not.toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /buy ticket/i })[0])
    expect(screen.getByRole('heading', { name: /sign in to buy tickets/i })).toBeInTheDocument()
  })
})