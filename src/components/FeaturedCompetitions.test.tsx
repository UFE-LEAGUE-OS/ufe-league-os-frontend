import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import FeaturedCompetitions from './FeaturedCompetitions'

describe('FeaturedCompetitions', () => {
  it('lists featured competitions with a link to the full competition view', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FeaturedCompetitions />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { name: /featured competitons/i })).toBeInTheDocument()
    expect(screen.getByText(/nile special rugby premiership/i)).toBeInTheDocument()
    expect(screen.getByText(/star times uganda premier league/i)).toBeInTheDocument()
    expect(screen.getByText(/national basketball league/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view all competitions/i })).toBeInTheDocument()
  })
})
