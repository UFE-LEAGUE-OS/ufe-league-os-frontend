import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Landing from '../pages/landing/Landing'
import TicketsLandingPage from '../pages/landing/TicketsLandingPage'
import { getPublicFixtures } from '../services/publicDashboardService'
import { getMatchTicketTypes } from '../services/ticketCheckoutService'

vi.mock('../services/publicDashboardService', () => ({
  getPublicFixtures: vi.fn(),
}))

vi.mock('../services/ticketCheckoutService', () => ({
  getMatchTicketTypes: vi.fn(),
}))

const backendFixtures = [
  {
    id: 1,
    competition: 1,
    competition_name: 'Nile Special Rugby Premiership 2026',
    home_club: 1,
    home_club_name: 'KCB KOBS',
    home_club_slug: 'kobs',
    home_club_logo_url: '',
    away_club: 2,
    away_club_name: 'Platinum Credit Heathens',
    away_club_slug: 'heathens-rfc',
    away_club_logo_url: '',
    status: 'SCHEDULED',
    match_date: '2026-07-14T20:10:00Z',
    venue: 'Legends Rugby Grounds',
  },
  {
    id: 2,
    competition: 2,
    competition_name: 'StarTimes Uganda Premier League 2026',
    home_club: 3,
    home_club_name: 'KCCA FC',
    home_club_slug: 'kcca-fc',
    home_club_logo_url: '',
    away_club: 4,
    away_club_name: 'SC Villa',
    away_club_slug: 'sc-villa',
    away_club_logo_url: '',
    status: 'SCHEDULED',
    match_date: '2026-07-16T20:10:00Z',
    venue: 'MTN Omondi Stadium',
  },
  {
    id: 3,
    competition: 3,
    competition_name: 'National Basketball League 2026',
    home_club: 5,
    home_club_name: 'City Oilers',
    home_club_slug: 'city-oilers',
    home_club_logo_url: '',
    away_club: 6,
    away_club_name: 'KIU Titans',
    away_club_slug: 'kiu-titans',
    away_club_logo_url: '',
    status: 'SCHEDULED',
    match_date: '2026-07-18T20:10:00Z',
    venue: 'Lugogo Indoor Arena',
  },
]

function buildTicketTypes(matchId: number) {
  return {
    match: {
      id: matchId,
      label: `Fixture ${matchId}`,
      venue: 'Backend venue',
      match_date: '2026-07-14T20:10:00Z',
      status: 'SCHEDULED',
    },
    count: 1,
    ticket_types: [
      {
        id: matchId * 10 + 1,
        match: matchId,
        match_label: `Fixture ${matchId}`,
        name: 'Regular',
        description: 'Backend regular ticket',
        price: '20000.00',
        currency: 'UGX',
        quantity_available: 500,
        quantity_sold: 25,
        active_reserved_quantity: 0,
        remaining_quantity: 475,
        status: 'ACTIVE',
      },
    ],
  }
}

describe('Feature: Fan discovers League OS from the public landing page', () => {
  it('Scenario: a guest can understand the product and find public entry points', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPublicFixtures).mockResolvedValue(backendFixtures)
    vi.mocked(getMatchTicketTypes).mockImplementation((matchId) =>
      Promise.resolve(buildTicketTypes(Number(matchId))),
    )
  })

  it('Scenario: the guest filters ticket listings and is asked to sign in before checkout', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TicketsLandingPage />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: /national basketball league/i }))
    expect(await screen.findByText(/city oilers/i)).toBeInTheDocument()
    expect(screen.getByText(/kiu titans/i)).toBeInTheDocument()
    expect(screen.queryByText(/kcca fc/i)).not.toBeInTheDocument()
    await user.click((await screen.findAllByRole('button', { name: /buy ticket/i }))[0])
    expect(screen.getByRole('heading', { name: /sign in to buy tickets/i })).toBeInTheDocument()
  })
})