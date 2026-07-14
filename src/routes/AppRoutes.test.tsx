import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AppRoutes from './AppRoutes'
import { useAuthStore } from '../store/authStore'

vi.mock('../pages', () => ({
    Landing: () => <h1>Landing Page</h1>,
    Login: () => <h1>Login Page</h1>,
    GoogleCallback: () => <h1>Google Callback Page</h1>,
    ForgotPassword: () => <h1>Forgot Password Page</h1>,
    Register: () => <h1>Register Page</h1>,
    VerifyEmail: () => <h1>Verify Email Page</h1>,
    Dashboard: () => <h1>Fan Dashboard</h1>,
    Profile: () => <h1>Profile Page</h1>,
    Competitions: () => <h1>Competitions Page</h1>,
    Fixtures: () => <h1>Fixtures Page</h1>,
    Results: () => <h1>Results Page</h1>,
    Support: () => <h1>Support Page</h1>,
}))

vi.mock('../pages/auth/Personalize', () => ({
    default: () => <h1>Personalize Page</h1>,
}))

vi.mock('../pages/NewsPage', () => ({
    default: () => <h1>News Page</h1>,
}))


vi.mock('../pages/landing/TicketsLandingPage', () => ({
    default: () => <h1>Tickets Page</h1>,
}))

function visit(path: string) {
    window.history.pushState({}, '', path)
    render(<AppRoutes />)
}

describe('AppRoutes protected routes', () => {
    beforeEach(() => {
        localStorage.clear()
        useAuthStore.getState().clearAuth()
        window.history.pushState({}, '', '/')
    })

    it('redirects logged-out users from /dashboard to login', () => {
        visit('/dashboard')

        expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: /fan dashboard/i })).not.toBeInTheDocument()
    })

    it('redirects logged-out users from /dashboard/fan to login', () => {
        visit('/dashboard/fan')

        expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: /fan dashboard/i })).not.toBeInTheDocument()
    })

    it('redirects logged-out users from /profile to login', () => {
        visit('/profile')

        expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: /profile page/i })).not.toBeInTheDocument()
    })

    it('redirects logged-out users from /edit-profile to login', () => {
        visit('/edit-profile')

        expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: /edit profile page/i })).not.toBeInTheDocument()
    })

    it('allows users with a stored access token to view /dashboard', () => {
        localStorage.setItem('league_os_access_token', 'access-token')

        visit('/dashboard')

        expect(screen.getByRole('heading', { name: /fan dashboard/i })).toBeInTheDocument()
    })

    it('allows users with auth store access token to view /profile', () => {
        useAuthStore.getState().setAuth({
            user: { email: 'fan@example.com', role: 'fan' },
            access: 'access-token',
            refresh: 'refresh-token',
            requiresEmailVerification: false,
        })

        visit('/profile')

        expect(screen.getByRole('heading', { name: /profile page/i })).toBeInTheDocument()
    })

    it('allows union administrators to explicitly open the fan dashboard', () => {
        useAuthStore.getState().setAuth({
            user: {
                email: 'union-admin@example.com',
                role: 'union_admin',
            },
            access: 'access-token',
            refresh: 'refresh-token',
            requiresEmailVerification: false,
        })

        visit('/dashboard/fan')

        expect(
            screen.getByRole('heading', {
                name: /fan dashboard/i,
            }),
        ).toBeInTheDocument()
    })

    it('redirects signed-in users with unverified email to verification before protected pages', () => {
        useAuthStore.getState().setAuth({
            user: { email: 'fan@example.com', role: 'fan' },
            access: 'access-token',
            refresh: 'refresh-token',
            requiresEmailVerification: true,
        })

        visit('/profile')

        expect(screen.getByRole('heading', { name: /verify email page/i })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: /profile page/i })).not.toBeInTheDocument()
    })

    it('redirects logged-out users from the sponsor dashboard to login', () => {
        visit('/sponsor/dashboard')

        expect(
            screen.getByRole('heading', {
                name: /login page/i,
            }),
        ).toBeInTheDocument()
    })

    it('keeps public routes available without login', () => {
        visit('/fixtures')

        expect(screen.getByRole('heading', { name: /fixtures page/i })).toBeInTheDocument()
    })
})
