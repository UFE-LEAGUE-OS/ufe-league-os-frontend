import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import PublicIcon from '@mui/icons-material/Public';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import type { SvgIconComponent } from '@mui/icons-material';
import { PageShell } from '../../components/site/LeagueUI.js';
import { DASHBOARD_ROUTE } from '../../utils/authFlow.js';
import { publicClubs, competitionStandings } from '../../data/publicBrowseCatalog.js';
import '../../styles/pages/personalize.css';

type Item = { id: string; name: string; sub?: string; emoji?: string; sport?: string };

type Category = {
  id: string;
  label: string;
  sublabel: string;
  icon: SvgIconComponent;
  items: Item[];
};

// Sport ID to display name mapping
const SPORT_NAMES: Record<string, string> = {
  rugby: 'Rugby',
  football: 'Football',
  basketball: 'Basketball',
};

// Base sports category (always shown)
const SPORTS_CATEGORY: Category = {
  id: 'sports',
  label: 'FAVOURITE SPORTS',
  sublabel: 'Select at least one sport you love.',
  icon: SportsSoccerIcon,
  items: [
    { id: 'rugby', name: 'Rugby' },
    { id: 'football', name: 'Football' },
    { id: 'basketball', name: 'Basketball' },
  ],
};

// Federation mapping by sport
const FEDERATIONS_BY_SPORT: Record<string, Item[]> = {
  Rugby: [{ id: 'uru', name: 'Uganda Rugby Union' }],
  Football: [
    { id: 'fufa', name: 'FUFA' },
    { id: 'unoc', name: 'UNOC' },
  ],
  Basketball: [{ id: 'fuba', name: 'FUBA' }],
};

// Generate dynamic categories based on selected sports
const getDynamicCategories = (selectedSports: Set<string>): Category[] => {
  const categories: Category[] = [SPORTS_CATEGORY];

  // If no sports selected, return only sports category
  if (selectedSports.size === 0) {
    return categories;
  }

  // Build clubs category filtered by selected sports
  const selectedSportNames = Array.from(selectedSports).map(s => SPORT_NAMES[s]);
  const clubsItems: Item[] = publicClubs
    .filter(club => selectedSportNames.includes(club.sport))
    .map(club => ({
      id: club.slug,
      name: club.shortName || club.name,
      sub: club.sport,
      sport: club.sport,
    }));

  if (clubsItems.length > 0) {
    categories.push({
      id: 'clubs',
      label: 'CLUBS',
      sublabel: 'Follow at least one club you support.',
      icon: ShieldOutlinedIcon,
      items: clubsItems,
    });
  }

  // Build federations category filtered by selected sports
  const federationsItems: Item[] = [];
  selectedSportNames.forEach(sportName => {
    const sportFederations = FEDERATIONS_BY_SPORT[sportName] || [];
    federationsItems.push(...sportFederations.map(f => ({ ...f, sport: sportName })));
  });

  if (federationsItems.length > 0) {
    categories.push({
      id: 'federations',
      label: 'UNIONS / FEDERATIONS',
      sublabel: 'Select at least one union or federation.',
      icon: PublicIcon,
      items: federationsItems,
    });
  }

  // Build leagues category filtered by selected sports
  const leaguesItems: Item[] = competitionStandings
    .filter(comp => selectedSportNames.includes(comp.sport))
    .map(comp => ({
      id: comp.id,
      name: comp.name,
      sport: comp.sport,
    }));

  if (leaguesItems.length > 0) {
    categories.push({
      id: 'leagues',
      label: 'LEAGUES',
      sublabel: 'Select at least one league to follow.',
      icon: EmojiEventsOutlinedIcon,
      items: leaguesItems,
    });
  }

  // School leagues (general, not sport-specific in current data)
  categories.push({
    id: 'schoolleagues',
    label: 'SCHOOL LEAGUES',
    sublabel: 'Select at least one school league to follow.',
    icon: SchoolOutlinedIcon,
    items: [
      { id: 'budo', name: 'Budo League' },
      { id: 'smack', name: 'SMACK League' },
      { id: 'ntare', name: 'Ntare League' },
      { id: 'kakira', name: 'Kakira League' },
    ],
  });

  return categories;
};

const STEPS = ['Welcome', 'Sign Up', 'Verify OTP', 'Log In', 'Follow Interests'];

export default function Personalize() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});

  // Get selected sports
  const selectedSports = useMemo(() => {
    return new Set(selected['sports'] ? Array.from(selected['sports']) : []);
  }, [selected]);

  // Generate dynamic categories based on selected sports
  const categories = useMemo(() => {
    return getDynamicCategories(selectedSports);
  }, [selectedSports]);

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

  const handleContinue = () => {
    navigate(DASHBOARD_ROUTE, {
      replace: true,
      state: {
        message: 'Your interests are saved for this session.',
      },
    });
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
              className={`p-step ${i < 2 ? 'p-step-done' : i === 2 ? 'p-step-active' : 'p-step-idle'}`}
            >
              <span className="p-step-num">
                {i < 2 ? <CheckIcon fontSize="inherit" /> : i + 1}
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
          {categories.map((cat) => {
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
        <button className="personalize-continue" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </PageShell>
  );
}


