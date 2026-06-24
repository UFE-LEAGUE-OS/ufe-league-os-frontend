import { MemoryRouter } from 'react-router-dom'
import { render, screen, within } from '@testing-library/react'
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
    expect(screen.getByRole('button', { name: /^⭐ vip$/i })).toBeInTheDocument()
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

  it('filters ticket tiers inside match cards', async () => {
    const user = userEvent.setup()

    renderTicketsPage()

    await user.click(screen.getByRole('button', { name: /^ordinary$/i }))

    const firstMatch = screen.getAllByText(/seats left/i)[0].closest('.match-card')

    expect(firstMatch).not.toBeNull()
    expect(within(firstMatch as HTMLElement).getByText(/ordinary/i)).toBeInTheDocument()
    expect(within(firstMatch as HTMLElement).queryByText(/^vip$/i)).not.toBeInTheDocument()
  })

  it('prompts guests to sign in before buying a ticket', async () => {
    const user = userEvent.setup()

    renderTicketsPage()

    await user.click(screen.getAllByRole('button', { name: /buy vip/i })[0])

    expect(screen.getByRole('heading', { name: /sign in to buy tickets/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /log in/i })[1]).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })
})