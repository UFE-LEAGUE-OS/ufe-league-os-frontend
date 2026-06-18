import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import PublicIcon from '@mui/icons-material/Public';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import type { SvgIconComponent } from '@mui/icons-material';
import { PageShell } from '../../components/site/LeagueUI.js';
import { useAuth } from '../../hooks/useAuth.js';
import {
  clearPendingOnboardingSession,
  getPendingOnboardingSession,
} from '../../utils/onboardingSession.js';
import '../../styles/pages/personalize.css';

type Item = { id: string; name: string; sub?: string; emoji?: string };

type Category = {
  id: string;
  label: string;
  sublabel: string;
  icon: SvgIconComponent;
  items: Item[];
};

const CATEGORIES: Category[] = [
  {
    id: 'sports',
    label: 'FAVOURITE SPORTS',
    sublabel: 'Select at least one sport you love.',
    icon: SportsSoccerIcon,
    items: [
      { id: 'rugby', name: 'Rugby' },
      { id: 'football', name: 'Football' },
      { id: 'basketball', name: 'Basketball' },
      { id: 'cricket', name: 'Cricket'},
      { id: 'netball', name: 'Netball' },
    ],
  },
  {
    id: 'clubs',
    label: 'CLUBS',
    sublabel: 'Follow at least one club you support.',
    icon: ShieldOutlinedIcon,
    items: [
      { id: 'kobs', name: 'KOBS', sub: 'Rugby Club' },
      { id: 'heathens', name: 'Heathens' },
      { id: 'scvilla', name: 'SC Villa'},
      { id: 'vipers', name: 'Vipers SC' },
      { id: 'cityoilers', name: 'City Oilers' },
    ],
  },
  {
    id: 'federations',
    label: 'UNIONS / FEDERATIONS',
    sublabel: 'Select at least one union or federation.',
    icon: PublicIcon,
    items: [
      { id: 'uru', name: 'Uganda Rugby Union'},
      { id: 'fufa', name: 'FUFA'},
      { id: 'fuba', name: 'FUBA'},
      { id: 'unoc', name: 'UNOC' },
    ],
  },
  {
    id: 'leagues',
    label: 'LEAGUES',
    sublabel: 'Select at least one league to follow.',
    icon: EmojiEventsOutlinedIcon,
    items: [
      { id: 'nrp', name: 'Nile Special Rugby Premiership' },
      { id: 'upl', name: 'Uganda Premier League'},
      { id: 'nbl', name: 'National Basketball League'},
      { id: 'fufa2', name: 'FUFA Big League' },
    ],
  },
  {
    id: 'schoolleagues',
    label: 'SCHOOL LEAGUES',
    sublabel: 'Select at least one school league to follow.',
    icon: SchoolOutlinedIcon,
    items: [
      { id: 'budo', name: 'Budo League'},
      { id: 'smack', name: 'SMACK League' },
      { id: 'ntare', name: 'Ntare League' },
      { id: 'kakira', name: 'Kakira League'},
    ],
  },
];

const STEPS = ['Welcome', 'Sign Up', 'Verify OTP', 'Follow Interests', 'Log In'];

export default function Personalize() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = (location.state as { email?: string } | null)?.email ?? '';
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggle = (catId: string, itemId: string) => {
    setSelected((prev) => {
      const set = new Set(prev[catId] ?? []);
if (set.has(itemId)) {
  set.delete(itemId);
} else {
  set.add(itemId);
}
      return { ...prev, [catId]: set };
    });
  };

  const isSelected = (catId: string, itemId: string) =>
    selected[catId]?.has(itemId) ?? false;

  const handleContinue = async () => {
    const preferences = Object.fromEntries(
      Object.entries(selected).map(([category, values]) => [category, Array.from(values)]),
    );

    localStorage.setItem('league_os_personalization_preferences', JSON.stringify(preferences));

    const pendingOnboarding = getPendingOnboardingSession();
    if (!pendingOnboarding) {
      navigate('/login', {
        replace: true,
        state: {
          email,
          message: 'Your email has been verified. Please log in to continue.',
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({
        identifier: pendingOnboarding.email,
        password: pendingOnboarding.password,
      });
      clearPendingOnboardingSession();

      const dashboardRoute =
        response.frontend_dashboard_route && response.frontend_dashboard_route.startsWith('/dashboard')
          ? response.frontend_dashboard_route
          : '/dashboard/fan';

      navigate(dashboardRoute, {
        replace: true,
        state: {
          message: 'Your profile is ready. Welcome to League OS.',
        },
      });
    } catch {
      navigate('/login', {
        replace: true,
        state: {
          email: pendingOnboarding.email,
          message: 'Your profile is ready. Please log in to continue.',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell className="auth-page personalize-page">
      <div className="personalize-topbar">
        <button className="personalize-back" onClick={() => navigate(-1)}>
          ‹ Back
        </button>
        <div className="personalize-steps">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`p-step ${i < 3 ? 'p-step-done' : i === 3 ? 'p-step-active' : 'p-step-idle'}`}
            >
              <span className="p-step-num">
                {i < 3 ? <CheckIcon fontSize="inherit" /> : i + 1}
              </span>
              <span className="p-step-label">{step}</span>
              {i < STEPS.length - 1 && <span className="p-step-line" />}
            </div>
          ))}
        </div>
      </div>

      <main className="personalize-main">
        <div className="personalize-header">
          <h1>Personalize Your Experience</h1>
          <p>Follow what you love. We'll customize your home feed and recommend the best content, matches, and updates for you.</p>
        </div>

        <div className="personalize-categories">
          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            return (
            <div key={cat.id} className="p-category">
              <div className="p-category-label">
                <span className="p-category-icon"><CatIcon fontSize="inherit" /></span>
                <div className="p-category-text">
                  <strong>{cat.label}</strong>
                  <span>{cat.sublabel}</span>
                </div>
              </div>
              <div className="p-items">
                {cat.items.map((item) => {
                  const on = isSelected(cat.id, item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`p-item${on ? ' p-item-on' : ''}`}
                      onClick={() => toggle(cat.id, item.id)}
                    >
                      {item.emoji && <span className="p-item-emoji">{item.emoji}</span>}
                      <span className="p-item-text">
                        <span className="p-item-name">{item.name}</span>
                        {item.sub && <span className="p-item-sub">{item.sub}</span>}
                      </span>
                      {on && (
                        <span className="p-item-check">
                          <CheckIcon fontSize="inherit" />
                        </span>
                      )}
                    </button>
                  );
                })}
                <button type="button" className="p-add-more">
                  <AddIcon fontSize="inherit" /> Add More
                </button>
              </div>
            </div>
          );
          })}
        </div>
      </main>

      <div className="personalize-footer">
        <button className="personalize-continue" onClick={handleContinue} disabled={isSubmitting}>
          {isSubmitting ? 'Finishing...' : 'Continue'}
        </button>
      </div>
    </PageShell>
  );
}


