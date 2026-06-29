import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import TicketsLandingPage from './TicketsLandingPage'

function renderTicketsPage() {
  return render(
    <MemoryRouter>
      <TicketsLandingPage />
    </MemoryRouter>,
  )
}

describe('TicketsLandingPage', () => {
  it('renders ticket filters and available matches', () => {
    renderTicketsPage()

    expect(screen.getByText(/match/i, { selector: '.tickets-header-plain' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /all leagues/i })).toBeInTheDocument()
    const buyButtons = screen.getAllByRole('button', { name: /buy ticket/i })
    expect(buyButtons.length).toBeGreaterThan(0)
    expect(screen.getByText(/kcca fc/i)).toBeInTheDocument()
    expect(screen.getByText(/betway kobs/i)).toBeInTheDocument()
    expect(screen.getByText(/city oilers/i)).toBeInTheDocument()
  })

  it('filters matches by league', async () => {
    const user = userEvent.setup()

    renderTicketsPage()

    await user.click(screen.getByRole('button', { name: /nile special rugby premiership/i }))

    expect(screen.getByText(/betway kobs/i)).toBeInTheDocument()
    expect(screen.getByText(/heathens rfc/i)).toBeInTheDocument()
    expect(screen.queryByText(/kcca fc/i)).not.toBeInTheDocument()
  })

  it('shows seats left count on each card', () => {
    renderTicketsPage()

    const seatsLeft = screen.getAllByText(/seats left/i)
    expect(seatsLeft.length).toBeGreaterThan(0)
  })

  it('prompts guests to sign in before buying a ticket', async () => {
    const user = userEvent.setup()

    renderTicketsPage()

    await user.click(screen.getAllByRole('button', { name: /buy ticket/i })[0])

    expect(screen.getByRole('heading', { name: /sign in to buy tickets/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /log in/i })[1]).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })
})