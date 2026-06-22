import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Register from './Register'
import {
    buildPhoneNumber,
    mapRegisterApiErrors,
    normalizePhoneInput,
    validateRegisterForm,
} from './registerUtils'

const navigateMock = vi.hoisted(() => vi.fn())
const registerMock = vi.hoisted(() => vi.fn())

vi.mock('../../services/authService.js', () => ({
    register: registerMock,
}))

vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

    return {
        ...actual,
        useNavigate: () => navigateMock,
    }
})

function renderRegisterPage() {
    return render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>,
    )
}

async function fillValidRegistrationForm() {
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/first name/i), 'Amina')
    await user.type(screen.getByLabelText(/last name/i), 'Kizza')
    await user.type(screen.getByPlaceholderText('7XX XXX XXX'), '0701234567')
    await user.type(
        screen.getByLabelText(/email address/i),
        'AMINA.KIZZA@EXAMPLE.COM',
    )
    await user.type(screen.getByLabelText(/^password$/i), 'StrongPass1!')
    await user.type(screen.getByLabelText(/^confirm password$/i), 'StrongPass1!')
    await user.click(screen.getByRole('checkbox', { name: /terms of service/i }))

    return user
}

beforeEach(() => {
    navigateMock.mockClear()
    registerMock.mockReset()
})

describe('register helpers', () => {
    it('normalizes phone input and preserves digits for submission', () => {
        expect(normalizePhoneInput('+256 70A1-23B456')).toBe('256 701-23456')
        expect(buildPhoneNumber('+256', '0701234567')).toBe('+256701234567')
    })

    it('validates the identity form before submit', () => {
        expect(
            validateRegisterForm({
                firstName: '',
                lastName: '',
                countryCode: '+256',
                phoneNumber: '',
                email: '',
                password: '',
                confirmPassword: '',
                termsAccepted: false,
            }),
        ).toMatchObject({
            firstName: 'First name is required.',
            lastName: 'Last name is required.',
            phoneNumber: 'Phone number is required.',
            email: 'Email address is required.',
            password: 'Password is required.',
            confirmPassword: 'Please confirm your password.',
            termsAccepted: 'You must agree to the terms to continue.',
        })
    })

    it('accepts names that the backend already allows', () => {
        const errors = validateRegisterForm({
            firstName: 'Zoë',
            lastName: 'A',
            countryCode: '+256',
            phoneNumber: '0701234567',
            email: 'zoe@example.com',
            password: 'StrongPass1!',
            confirmPassword: 'StrongPass1!',
            termsAccepted: true,
        })

        expect(errors.firstName).toBeUndefined()
        expect(errors.lastName).toBeUndefined()
    })

    it('maps backend registration errors to the correct frontend fields', () => {
        expect(
            mapRegisterApiErrors({
                email: ['A user with this email address already exists.'],
                phone_number: ['A user with this phone number already exists.'],
                confirm_password: ['Passwords do not match.'],
                non_field_errors: ['Registration failed.'],
            }),
        ).toMatchObject({
            email: 'A user with this email address already exists.',
            phoneNumber: 'A user with this phone number already exists.',
            confirmPassword: 'Passwords do not match.',
            form: 'Registration failed.',
        })
    })
})

describe('Register page', () => {
    it('navigates back from the registration page', async () => {
        const user = userEvent.setup()

        render(
            <MemoryRouter initialEntries={['/', '/register']} initialIndex={1}>
                <Register />
            </MemoryRouter>,
        )

        await user.click(screen.getByRole('button', { name: /back/i }))

        expect(navigateMock).toHaveBeenCalledWith(-1)
    })

    it('renders the shared site navbar', () => {
        renderRegisterPage()

        expect(
            screen
                .getAllByAltText('League OS')
                .some((image) => image.classList.contains('logo-img')),
        ).toBe(true)
        expect(screen.getByText(/competitions/i)).toBeInTheDocument()
        expect(screen.getByText(/tickets/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })

    it('does not call the backend when the form is empty', async () => {
        const user = userEvent.setup()

        renderRegisterPage()

        await user.click(screen.getByRole('button', { name: /start registration/i }))

        expect(registerMock).not.toHaveBeenCalled()
        expect(navigateMock).not.toHaveBeenCalled()

        expect(screen.getByText('First name is required.')).toBeInTheDocument()
        expect(screen.getByText('Last name is required.')).toBeInTheDocument()
        expect(screen.getByText('Phone number is required.')).toBeInTheDocument()
        expect(screen.getByText('Email address is required.')).toBeInTheDocument()
        expect(screen.getByText('Password is required.')).toBeInTheDocument()
        expect(screen.getByText('Please confirm your password.')).toBeInTheDocument()
        expect(
            screen.getByText('You must agree to the terms to continue.'),
        ).toBeInTheDocument()
    })

    it(
        'submits the backend registration payload and continues the OTP workflow',
        async () => {
            registerMock.mockResolvedValueOnce({
                data: {
                    message:
                        'Registration successful. Please verify your email address using the OTP sent to your email.',
                    requires_email_verification: true,
                    next_step: 'VERIFY_EMAIL',
                },
            })

            renderRegisterPage()

            const user = await fillValidRegistrationForm()

            await user.click(screen.getByRole('button', { name: /sign up/i }))

            await waitFor(() => {
                expect(registerMock).toHaveBeenCalledWith({
                    first_name: 'Amina',
                    last_name: 'Kizza',
                    phone_number: '+256701234567',
                    email: 'amina.kizza@example.com',
                    password: 'StrongPass1!',
                    confirm_password: 'StrongPass1!',
                })
            })

            expect(registerMock).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    phone: expect.any(String),
                }),
            )

            expect(navigateMock).toHaveBeenCalledWith('/personalize', {
                replace: true,
                state: {
                    email: 'amina.kizza@example.com',
                },
            })
        },
        10000,
    )

    it('shows backend email field errors clearly', async () => {
        registerMock.mockRejectedValueOnce({
            response: {
                data: {
                    email: ['A user with this email address already exists.'],
                },
            },
        })

        renderRegisterPage()

        const user = await fillValidRegistrationForm()

        await user.click(screen.getByRole('button', { name: /sign up/i }))

        expect(
            await screen.findByText('A user with this email address already exists.'),
        ).toBeInTheDocument()

        expect(navigateMock).not.toHaveBeenCalled()
    })

    it('shows backend phone_number field errors clearly', async () => {
        registerMock.mockRejectedValueOnce({
            response: {
                data: {
                    phone_number: ['A user with this phone number already exists.'],
                },
            },
        })

        renderRegisterPage()

        const user = await fillValidRegistrationForm()

        await user.click(screen.getByRole('button', { name: /sign up/i }))

        expect(
            await screen.findByText('A user with this phone number already exists.'),
        ).toBeInTheDocument()

        expect(navigateMock).not.toHaveBeenCalled()
    })

    it('shows general backend registration errors clearly', async () => {
        registerMock.mockRejectedValueOnce({
            response: {
                data: {
                    detail:
                        'Registration could not be completed because the verification email could not be sent. Please try again.',
                },
            },
        })

        renderRegisterPage()

        const user = await fillValidRegistrationForm()

        await user.click(screen.getByRole('button', { name: /sign up/i }))

        expect(
            await screen.findByText(
                'Registration could not be completed because the verification email could not be sent. Please try again.',
            ),
        ).toBeInTheDocument()

        expect(navigateMock).not.toHaveBeenCalled()
    })
})