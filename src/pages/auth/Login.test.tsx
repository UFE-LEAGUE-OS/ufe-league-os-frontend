import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Login from './Login'
import { buildGoogleAuthUrl } from './loginUtils'

describe('buildGoogleAuthUrl', () => {
  it('builds the Google OAuth redirect URL from the configured values', () => {
    expect(
      buildGoogleAuthUrl({
        apiBaseUrl: 'http://localhost:8000',
        googleClientId: 'client-123',
        googleRedirectUri: 'https://league.example.com/google/callback',
      }),
    ).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth?client_id=client-123&redirect_uri=https%3A%2F%2Fleague.example.com%2Fgoogle%2Fcallback&response_type=code&scope=openid+email+profile&access_type=offline&prompt=select_account',
    )
  })
})

describe('Login page', () => {
  it('renders the sign-in form and toggles password visibility', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter phone number or email')).toBeInTheDocument()

    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const toggleButton = screen.getByRole('button', { name: /show password/i })

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
  })

  it('shows a success message passed from email verification', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { message: 'Your email has been verified. You can now sign in.' } }]}>
        <Login />
      </MemoryRouter>,
    )

    expect(screen.getByRole('status')).toHaveTextContent(/email has been verified/i)
  })
})
