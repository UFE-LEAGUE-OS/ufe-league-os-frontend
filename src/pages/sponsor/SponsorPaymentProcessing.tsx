import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiDownload,
  FiLoader,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import {
  verifySponsorFlutterwavePayment,
  type SponsorPayment,
} from '../../services/sponsorshipService';
import './SponsorPaymentProcessing.css';

type PendingSponsorCheckout = {
  agreement_id?: number;
  payment_id?: number;
  tx_ref?: string;
  checkout_url?: string;
};

function readPendingCheckout():
  | PendingSponsorCheckout
  | null {
  const stored = localStorage.getItem(
    'league_os_pending_sponsor_checkout',
  );

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(
      stored,
    ) as PendingSponsorCheckout;
  } catch {
    return null;
  }
}

export default function SponsorPaymentProcessing() {
  const [searchParams] =
    useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [retryKey, setRetryKey] =
    useState(0);
  const [verificationError, setVerificationError] =
    useState('');
  const [verifiedPayment, setVerifiedPayment] =
    useState<SponsorPayment | null>(null);

  const pendingCheckout = useMemo(
    () => readPendingCheckout(),
    [],
  );

  const txRef =
    searchParams.get('tx_ref') ||
    searchParams.get('reference') ||
    (
      location.state as {
        tx_ref?: string;
      } | null
    )?.tx_ref ||
    pendingCheckout?.tx_ref ||
    '';

  const providerStatus = (
    searchParams.get('status') || ''
  ).toLowerCase();

  useEffect(() => {
    let active = true;

    async function verifyPayment() {
      setVerificationError('');

      if (!txRef) {
        localStorage.removeItem(
          'league_os_pending_sponsor_checkout',
        );

        navigate(
          '/sponsor/payments?payment=missing-reference',
          {
            replace: true,
          },
        );
        return;
      }

      if (
        providerStatus &&
        ![
          'successful',
          'success',
          'succeeded',
        ].includes(providerStatus)
      ) {
        localStorage.removeItem(
          'league_os_pending_sponsor_checkout',
        );

        navigate(
          `/sponsor/payments?payment=cancelled&tx_ref=${encodeURIComponent(
            txRef,
          )}`,
          {
            replace: true,
          },
        );
        return;
      }

      try {
        const response =
          await verifySponsorFlutterwavePayment(
            txRef,
          );

        if (!active) {
          return;
        }

        localStorage.removeItem(
          'league_os_pending_sponsor_checkout',
        );

        setVerifiedPayment(response.data.payment);
      } catch {
        if (!active) {
          return;
        }

        setVerificationError(
          'Flutterwave returned the payment, but League OS could not verify it. Retry verification before making another payment.',
        );
      }
    }

    void verifyPayment();

    return () => {
      active = false;
    };
  }, [
    navigate,
    providerStatus,
    retryKey,
    txRef,
  ]);

  function handleContinue() {
    if (!verifiedPayment) {
      return;
    }

    navigate(
      `/sponsor/payments?payment=success&agreement=${verifiedPayment.agreement}&tx_ref=${encodeURIComponent(
        txRef,
      )}`,
      {
        replace: true,
      },
    );
  }

  if (verifiedPayment) {
    return (
      <main className="sppc-page">
        <section className="sppc-card">
          <div className="sppc-icon sppc-icon-success">
            <FiCheckCircle size={40} />
          </div>

          <div>
            <div className="sppc-eyebrow">
              Secure sponsorship checkout
            </div>
            <h1>Payment Verified</h1>
            <p>
              Your sponsorship payment of{' '}
              {verifiedPayment.amount_paid}{' '}
              {verifiedPayment.currency} has been
              confirmed.
            </p>
          </div>

          <div className="sppc-reference">
            <span>Transaction reference</span>
            <strong>{txRef || 'Missing reference'}</strong>
          </div>

          {verifiedPayment.receipt_url && (
            <a
              className="sppc-retry"
              href={verifiedPayment.receipt_url}
              target="_blank"
              rel="noreferrer"
            >
              <FiDownload size={16} />
              Download receipt
            </a>
          )}

          <button
            type="button"
            className="sppc-retry"
            onClick={handleContinue}
          >
            Continue to Agreements & Payments
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="sppc-page">
      <section className="sppc-card">
        <div
          className={`sppc-icon ${
            verificationError
              ? 'sppc-icon-error'
              : 'sppc-icon-loading'
          }`}
        >
          {verificationError ? (
            <FiAlertTriangle
              size={40}
            />
          ) : (
            <FiLoader size={40} />
          )}
        </div>

        <div>
          <div className="sppc-eyebrow">
            Secure sponsorship
            checkout
          </div>
          <h1>
            {verificationError
              ? 'Payment verification needs attention'
              : 'Verifying Sponsor Payment'}
          </h1>
          <p>
            {verificationError ||
              'Please wait while League OS verifies the Flutterwave transaction and updates your sponsorship agreement.'}
          </p>
        </div>

        <div className="sppc-reference">
          <span>
            Transaction reference
          </span>
          <strong>
            {txRef ||
              'Missing reference'}
          </strong>
        </div>

        <div className="sppc-security">
          {verificationError ? (
            <FiCheckCircle
              size={18}
            />
          ) : (
            <FiShield size={18} />
          )}
          Flutterwave payments are
          confirmed only after
          server-side verification.
        </div>

        {verificationError && (
          <button
            type="button"
            className="sppc-retry"
            onClick={() =>
              setRetryKey(
                (value) => value + 1,
              )
            }
          >
            <FiRefreshCw
              size={16}
            />
            Retry verification
          </button>
        )}

        <Link to="/sponsor/payments">
          Return to agreements and
          payments
        </Link>
      </section>
    </main>
  );
}
