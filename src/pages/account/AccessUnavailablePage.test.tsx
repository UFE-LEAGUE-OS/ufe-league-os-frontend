import { fireEvent, render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import AccessUnavailablePage from './AccessUnavailablePage';
import { useAuthStore } from '../../store/authStore';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    user: { id: 14, email: 'operator@example.com' },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    requiresEmailVerification: false,
    accessStatus: 'unavailable',
  });
});

describe('AccessUnavailablePage', () => {
  it('offers safe account actions without exposing role details', () => {
    render(
      <MemoryRouter>
        <AccessUnavailablePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /your dashboard is not available yet/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /open profile/i }),
    ).toHaveAttribute('href', '/profile');
    expect(
      screen.getByRole('link', { name: /get support/i }),
    ).toHaveAttribute('href', '/support');
    expect(
      screen.queryByText(/permission|role|entitlement/i),
    ).not.toBeInTheDocument();
  });

  it('clears authentication when the user logs out', () => {
    render(
      <MemoryRouter initialEntries={['/account/access-unavailable']}>
        <Routes>
          <Route
            path="/account/access-unavailable"
            element={<AccessUnavailablePage />}
          />
          <Route
            path="/login"
            element={<h1>Login page</h1>}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /log out/i }),
    );

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(
      screen.getByRole('heading', { name: /login page/i }),
    ).toBeInTheDocument();
  });
});
