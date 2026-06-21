import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Navbar from './Navbar'

function renderNavbar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>,
  )
}

describe('Navbar', () => {
  it('renders primary navigation and auth actions', () => {
    renderNavbar()

    expect(screen.getByAltText('League OS')).toBeInTheDocument()
    expect(screen.getByText(/competitions/i)).toBeInTheDocument()
    expect(screen.getByText(/news/i)).toBeInTheDocument()
    expect(screen.getByText(/tickets/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('opens and closes the search input', async () => {
    const user = userEvent.setup()

    renderNavbar()

    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(screen.getByPlaceholderText(/search competitions/i)).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByPlaceholderText(/search competitions/i)).not.toBeInTheDocument()
  })

  it('marks the current navigation item as active', () => {
    renderNavbar('/tickets')

    expect(screen.getByText('Tickets')).toHaveClass('active-link')
  })
})
