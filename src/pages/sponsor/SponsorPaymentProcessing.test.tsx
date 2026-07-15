import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  verifySponsorFlutterwavePayment,
} from '../../services/sponsorshipService';
import SponsorPaymentProcessing from './SponsorPaymentProcessing';

vi.mock(
  '../../services/sponsorshipService',
  () => ({
    verifySponsorFlutterwavePayment:
      vi.fn(),
  }),
);

const verifyPaymentMock =
  vi.mocked(
    verifySponsorFlutterwavePayment,
  );

function renderRoute(path: string) {
  return render(
    <MemoryRouter
      initialEntries={[path]}
    >
      <Routes>
        <Route
          path="/sponsor/payment/processing"
          element={
            <SponsorPaymentProcessing />
          }
        />
        <Route
          path="/sponsor/payments"
          element={
            <h1>
              Sponsor Payments
              Destination
            </h1>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe(
  'SponsorPaymentProcessing',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
      localStorage.clear();
    });

    it(
      'verifies a successful Flutterwave return',
      async () => {
        verifyPaymentMock.mockResolvedValue(
          {
            data: {
              message:
                'Payment verified.',
              payment: {
                id: 501,
                agreement: 201,
                status:
                  'CONFIRMED',
              },
              revenue_distributions:
                [],
            },
          } as never,
        );

        renderRoute(
          '/sponsor/payment/processing?status=successful&tx_ref=LOS-SPONSOR-201-TEST',
        );

        await waitFor(() => {
          expect(
            verifyPaymentMock,
          ).toHaveBeenCalledWith(
            'LOS-SPONSOR-201-TEST',
          );
        });

        expect(
          await screen.findByRole(
            'heading',
            {
              name: /sponsor payments destination/i,
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      'does not verify a cancelled Flutterwave return',
      async () => {
        renderRoute(
          '/sponsor/payment/processing?status=cancelled&tx_ref=LOS-SPONSOR-201-CANCELLED',
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name: /sponsor payments destination/i,
            },
          ),
        ).toBeInTheDocument();

        expect(
          verifyPaymentMock,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'uses the locally stored transaction reference',
      async () => {
        localStorage.setItem(
          'league_os_pending_sponsor_checkout',
          JSON.stringify({
            agreement_id: 201,
            tx_ref:
              'LOS-SPONSOR-STORED',
          }),
        );

        verifyPaymentMock.mockResolvedValue(
          {
            data: {
              message:
                'Payment verified.',
              payment: {
                id: 501,
                agreement: 201,
                status:
                  'CONFIRMED',
              },
              revenue_distributions:
                [],
            },
          } as never,
        );

        renderRoute(
          '/sponsor/payment/processing?status=successful',
        );

        await waitFor(() => {
          expect(
            verifyPaymentMock,
          ).toHaveBeenCalledWith(
            'LOS-SPONSOR-STORED',
          );
        });
      },
    );
  },
);
