import { useNavigate } from "react-router-dom";
import {
  Goal,
  ArrowLeftRight,
  Users,
  GitBranch,
  Calendar,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import "../../../styles/pages/SuperAdminDashboard.css";

const FANTASY_CARDS = [
  {
    key: "scoring",
    label: "Scoring Rules",
    description: "Configure points awarded for goals, assists, clean sheets, saves, bonuses & more",
    icon: Goal,
    path: "/super-admin/fantasy-config/scoring",
    accent: "green",
  },
  {
    key: "transfers",
    label: "Transfer & Trade Rules",
    description: "Set transfer limits, budgets, wildcards, trading windows & deadlines",
    icon: ArrowLeftRight,
    path: "/super-admin/fantasy-config/transfers",
    accent: "amber",
  },
  {
    key: "squad-limits",
    label: "Squad Limits",
    description: "Define squad size, per-club caps, position requirements & formation rules",
    icon: Users,
    path: "/super-admin/fantasy-config/squad-limits",
    accent: "purple",
  },
  {
    key: "competition-mappings",
    label: "Competition Mappings",
    description: "Map fantasy leagues to real-world competitions and configure gameweek alignment",
    icon: GitBranch,
    path: "/super-admin/fantasy-config/competition-mappings",
    accent: "blue",
  },
  {
    key: "season-gw",
    label: "Season & Gameweek Settings",
    description: "Manage fantasy seasons, gameweek deadlines, statuses, and scheduling",
    icon: Calendar,
    path: "/super-admin/fantasy-config/season-gameweek",
    accent: "pink",
  },
  {
    key: "price-structure",
    label: "Price Structure Governance",
    description: "Configure pricing models, price change formulas, floors, ceilings, and dynamic rules",
    icon: DollarSign,
    path: "/super-admin/fantasy-config/price-structure",
    accent: "cyan",
  },
];

export default function FantasyModuleConfig() {
  const navigate = useNavigate();

  return (
    <div className="fantasy-config-page">
      <div className="panel" style={{ marginBottom: "2rem" }}>
        <div className="panel-header">
          <div>
            <h2>Fantasy Module Configuration</h2>
            <p className="governance-subtitle">
              Configure fantasy scoring, transfers, squad rules, and eligibility
              so that the platform can remain secure, compliant, and well governed.
            </p>
          </div>
        </div>
      </div>

      <div className="fantasy-config-grid">
        {FANTASY_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              className={`fantasy-config-card accent-${card.accent}`}
              type="button"
              onClick={() => navigate(card.path)}
            >
              <div className="fantasy-config-card-header">
                <span className="fantasy-config-icon">
                  <Icon size={28} />
                </span>
              </div>
              <div className="fantasy-config-card-body">
                <h3>{card.label}</h3>
                <p>{card.description}</p>
              </div>
              <div className="fantasy-config-card-footer">
                <span className="fantasy-config-cta">
                  Configure <ArrowRight size={14} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}