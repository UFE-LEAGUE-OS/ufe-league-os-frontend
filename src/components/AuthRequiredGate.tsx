import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import logo from "../assets/logos/league-os-horizontal.png";
import './AuthRequiredGate.css';

type AuthAction = 'membership' | 'tickets' | 'follow' | 'checkout' | 'fantasy' | 'polls' | 'mvp' | 'quizzes' | 'default';

const AUTH_MESSAGES: Record<AuthAction, { title: string; message: string; note: string }> = {
  membership: {
    title: 'Sign in to become a member',
    message:
      'Create an account or log in to join club memberships, manage benefits, and receive member-only updates.',
    note: 'Membership access is linked to your League OS fan account.',
  },
  tickets: {
    title: 'Sign in to buy tickets',
    message:
      'Create an account or log in to purchase tickets, manage bookings, and get match-day updates.',
    note: 'Get a free account now and enjoy League OS.',
  },
  follow: {
    title: 'Sign in to follow clubs',
    message:
      'Create an account or log in to follow clubs, teams, players, competitions, and receive personalized updates.',
    note: 'Your favourites will appear on your fan dashboard.',
  },
  checkout: {
    title: 'Sign in to continue checkout',
    message:
      'Create an account or log in to complete payments, save receipts, and manage your purchases.',
    note: 'Secure checkout requires a verified fan account.',
  },
  fantasy: {
    title: 'Sign in to join fantasy leagues',
    message:
      'Create an account or log in to create teams, join fantasy leagues, and track your performance.',
    note: 'Fantasy activity is saved to your fan profile.',
  },
  polls: {
    title: 'Login to have your say',
    message:
      'Create an account or log in to vote in polls and surveys. Your voice shapes the decisions that matter most to the league.',
    note: 'Every vote counts — make yours heard.',
  },
  mvp: {
    title: 'Login to participate',
    message:
      'Create an account or log in to vote for match winners, players of the month, and season MVPs. Your vote decides who takes the spotlight.',
    note: 'Your vote decides the legends.',
  },
  quizzes: {
    title: 'Login to play',
    message:
      'Create an account or log in to test your sports knowledge, compete on leaderboards, and earn bragging rights.',
    note: 'Think you know Ugandan sport? Prove it.',
  },
  default: {
    title: 'Sign in to continue',
    message:
      'Create an account or log in to use this League OS feature and save your activity.',
    note: 'Your account gives you access to fan features across the platform.',
  },
};

function hasAuthToken() {
  return Boolean(
    localStorage.getItem('league_os_access_token') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('league_os_access_token') ||
      sessionStorage.getItem('access_token'),
  );
}

function getElementPath(element: Element) {
  const anchor = element.closest('a');

  if (!anchor) return '';

  try {
    return new URL(anchor.href).pathname;
  } catch {
    return '';
  }
}

function normalizeText(value: string | null | undefined) {
  return (value ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function detectAction(target: Element): AuthAction | null {
  const actionableElement = target.closest(
    'a, button, [role="button"], [data-auth-required], [data-auth-action]',
  );

  if (!actionableElement) return null;

  const explicitAction = actionableElement.getAttribute('data-auth-action') as AuthAction | null;

  if (explicitAction) return explicitAction;

  const path = getElementPath(actionableElement);
  const text = normalizeText(actionableElement.textContent);

  if (path.includes('/memberships/') && path.includes('/checkout')) {
    return 'checkout';
  }

  if (
    text.includes('become member') ||
    text.includes('become a member') ||
    text.includes('join membership') ||
    text.includes('join club') ||
    text.includes('select plan') ||
    text.includes('choose plan')
  ) {
    return 'membership';
  }

  if (
    text.includes('buy ticket') ||
    text.includes('purchase ticket') ||
    text.includes('book ticket') ||
    text.includes('get ticket')
  ) {
    return 'tickets';
  }

  if (
    text.includes('checkout') ||
    text.includes('pay now') ||
    text.includes('confirm payment') ||
    text.includes('complete payment') ||
    text.includes('continue payment')
  ) {
    return 'checkout';
  }

  if (
    text === 'follow' ||
    text.includes('follow club') ||
    text.includes('follow team') ||
    text.includes('follow player') ||
    text.includes('follow competition') ||
    text.includes('follow your clubs') ||
    text.includes('follow teams')
  ) {
    return 'follow';
  }

  if (
    text.includes('join fantasy') ||
    text.includes('fantasy league') ||
    text.includes('play fantasy')
  ) {
    return 'fantasy';
  }

  if (actionableElement.hasAttribute('data-auth-required')) {
    return 'default';
  }

  return null;
}

function AuthRequiredGate() {
  const navigate = useNavigate();
  const [action, setAction] = useState<AuthAction | null>(null);

  const message = action ? AUTH_MESSAGES[action] : null;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) return;
      if (hasAuthToken()) return;

      const nextAction = detectAction(target);

      if (!nextAction) return;

      event.preventDefault();
      event.stopPropagation();
      setAction(nextAction);
    }

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  if (!message) return null;

  const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);

  return (
    <div className="auth-required-overlay" role="dialog" aria-modal="true">
      <div className="auth-required-backdrop" onClick={() => setAction(null)} />

      <section className="auth-required-modal">
        <button
          type="button"
          className="auth-required-close"
          aria-label="Close sign in prompt"
          onClick={() => setAction(null)}
        >
          <FiX size={22} />
        </button>

        <img
          src={logo}
          alt="League OS"
          className="auth-required-logo"
        />

        <h2>{message.title}</h2>
        <p>{message.message}</p>

        <div className="auth-required-actions">
          <button type="button" onClick={() => navigate(`/login?next=${next}`)}>
            Log In
          </button>

          <button type="button" onClick={() => navigate(`/register?next=${next}`)}>
            Create Account
          </button>
        </div>

        <small>{message.note}</small>
      </section>
    </div>
  );
}

export default AuthRequiredGate;