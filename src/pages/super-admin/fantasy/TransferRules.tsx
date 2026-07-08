import { useState } from "react";
import {
  ArrowLeftRight,
  Save,
  ArrowLeft,
  RotateCcw,
  Clock,
  DollarSign,
  Ban,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type TransferConfig = {
  maxTransfersPerGW: number;
  maxTransfersPerSeason: number;
  wildcardLimit: number;
  freeHitLimit: number;
  tripleCaptainLimit: number;
  benchBoostLimit: number;
  transferDeadline: string; // hours before match
  tradingWindowOpen: string;
  tradingWindowClose: string;
  budget: number;
  priceLockDuration: string;
  allowMultiClubTrades: boolean;
  allowCashTrades: boolean;
  tradeApprovalRequired: boolean;
  tradeVetoThreshold: number;
};

export default function TransferRules() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<TransferConfig>({
    maxTransfersPerGW: 2,
    maxTransfersPerSeason: 40,
    wildcardLimit: 2,
    freeHitLimit: 1,
    tripleCaptainLimit: 1,
    benchBoostLimit: 1,
    transferDeadline: "1",
    tradingWindowOpen: "00:00",
    tradingWindowClose: "23:59",
    budget: 100,
    priceLockDuration: "24h",
    allowMultiClubTrades: false,
    allowCashTrades: false,
    tradeApprovalRequired: true,
    tradeVetoThreshold: 3,
  });
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof TransferConfig>(key: K, value: TransferConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fantasy-sub-page">
      <div className="fantasy-sub-header">
        <button className="back-btn" onClick={() => navigate("/dashboard/super-admin/fantasy-config")}>
          <ArrowLeft size={16} />
          Back to Fantasy Config
        </button>
        <div>
          <h2>Transfer & Trade Rules</h2>
          <p className="governance-subtitle">
            Configure transfer limits, budgets, wildcards, trading windows, and deadlines
          </p>
        </div>
      </div>

      <div className="transfer-rules-grid">
        {/* Transfer Limits */}
        <div className="panel">
          <div className="panel-header">
            <h3><ArrowLeftRight size={16} /> Transfer Limits</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Max transfers per gameweek</label>
              <input
                type="number"
                min={0}
                value={config.maxTransfersPerGW}
                onChange={(e) => update("maxTransfersPerGW", parseInt(e.target.value) || 0)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Max transfers per season</label>
              <input
                type="number"
                min={0}
                value={config.maxTransfersPerSeason}
                onChange={(e) => update("maxTransfersPerSeason", parseInt(e.target.value) || 0)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Transfer deadline (hours before match)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={config.transferDeadline}
                onChange={(e) => update("transferDeadline", e.target.value)}
                className="fantasy-input"
              />
            </div>
          </div>
        </div>

        {/* Chip Limits */}
        <div className="panel">
          <div className="panel-header">
            <h3><RotateCcw size={16} /> Chip & Boost Limits</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Wildcards per season</label>
              <input
                type="number"
                min={0}
                value={config.wildcardLimit}
                onChange={(e) => update("wildcardLimit", parseInt(e.target.value) || 0)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Free Hits per season</label>
              <input
                type="number"
                min={0}
                value={config.freeHitLimit}
                onChange={(e) => update("freeHitLimit", parseInt(e.target.value) || 0)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Triple Captain per season</label>
              <input
                type="number"
                min={0}
                value={config.tripleCaptainLimit}
                onChange={(e) => update("tripleCaptainLimit", parseInt(e.target.value) || 0)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Bench Boost per season</label>
              <input
                type="number"
                min={0}
                value={config.benchBoostLimit}
                onChange={(e) => update("benchBoostLimit", parseInt(e.target.value) || 0)}
                className="fantasy-input"
              />
            </div>
          </div>
        </div>

        {/* Budget & Pricing */}
        <div className="panel">
          <div className="panel-header">
            <h3><DollarSign size={16} /> Budget & Pricing</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Starting budget (million)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={config.budget}
                onChange={(e) => update("budget", parseFloat(e.target.value) || 0)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Price lock duration</label>
              <select
                value={config.priceLockDuration}
                onChange={(e) => update("priceLockDuration", e.target.value)}
                className="fantasy-select"
              >
                <option value="1h">1 hour</option>
                <option value="6h">6 hours</option>
                <option value="12h">12 hours</option>
                <option value="24h">24 hours</option>
                <option value="48h">48 hours</option>
                <option value="1w">1 week</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trading Window */}
        <div className="panel">
          <div className="panel-header">
            <h3><Clock size={16} /> Trading Window</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Window opens</label>
              <input
                type="time"
                value={config.tradingWindowOpen}
                onChange={(e) => update("tradingWindowOpen", e.target.value)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Window closes</label>
              <input
                type="time"
                value={config.tradingWindowClose}
                onChange={(e) => update("tradingWindowClose", e.target.value)}
                className="fantasy-input"
              />
            </div>
          </div>
        </div>

        {/* Trade Restrictions */}
        <div className="panel">
          <div className="panel-header">
            <h3><Ban size={16} /> Trade Restrictions</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field toggle-field">
              <label>Allow multi-club trades</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={config.allowMultiClubTrades}
                  onChange={(e) => update("allowMultiClubTrades", e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="config-field toggle-field">
              <label>Allow cash trades</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={config.allowCashTrades}
                  onChange={(e) => update("allowCashTrades", e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="config-field toggle-field">
              <label>Trade approval required</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={config.tradeApprovalRequired}
                  onChange={(e) => update("tradeApprovalRequired", e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="config-field">
              <label>Veto threshold (number of vetoes to block trade)</label>
              <input
                type="number"
                min={1}
                value={config.tradeVetoThreshold}
                onChange={(e) => update("tradeVetoThreshold", parseInt(e.target.value) || 1)}
                className="fantasy-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="save-bar">
        <button className="action-btn primary" onClick={handleSave}>
          <Save size={16} /> {saved ? "Saved!" : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}