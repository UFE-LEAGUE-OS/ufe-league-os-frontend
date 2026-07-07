import { useState } from "react";
import { Save, ArrowLeft, DollarSign, TrendingUp, RotateCcw, BadgePercent } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PriceConfig = {
  defaultPlayerPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  priceUpdateFrequency: "daily" | "weekly" | "gamethread" | "manual";
  priceFormula: "performance" | "market" | "hybrid";
  priceChangeMaxPerUpdate: number;
  priceDropProtection: boolean;
  priceDropProtectionWeeks: number;
  popularityWeight: number;
  performanceWeight: number;
  formLookbackPeriod: number;
  priceRoundTo: number;
  enablePriceFloor: boolean;
  priceFloor: number;
  enablePriceCeiling: boolean;
  priceCeiling: number;
  priceLockNewSignings: boolean;
  priceLockDuration: string;
  enableDynamicPricing: boolean;
  enableInjuryDiscount: boolean;
  injuryDiscountPercent: number;
};

export default function PriceStructureGovernance() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<PriceConfig>({
    defaultPlayerPrice: 8.5,
    priceRangeMin: 4.0,
    priceRangeMax: 15.0,
    priceUpdateFrequency: "weekly",
    priceFormula: "hybrid",
    priceChangeMaxPerUpdate: 0.5,
    priceDropProtection: true,
    priceDropProtectionWeeks: 3,
    popularityWeight: 30,
    performanceWeight: 70,
    formLookbackPeriod: 5,
    priceRoundTo: 0.5,
    enablePriceFloor: true,
    priceFloor: 4.0,
    enablePriceCeiling: true,
    priceCeiling: 15.0,
    priceLockNewSignings: true,
    priceLockDuration: "2w",
    enableDynamicPricing: true,
    enableInjuryDiscount: true,
    injuryDiscountPercent: 15,
  });
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof PriceConfig>(key: K, value: PriceConfig[K]) => {
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
          <h2>Price Structure Governance</h2>
          <p className="governance-subtitle">
            Configure player pricing models, price change formulas, floors/ceilings, and dynamic pricing rules
          </p>
        </div>
      </div>

      <div className="price-structure-grid">
        {/* Base Pricing */}
        <div className="panel">
          <div className="panel-header">
            <h3><DollarSign size={16} /> Base Pricing</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Default player price (million)</label>
              <input type="number" min={1} step={0.5} value={config.defaultPlayerPrice}
                onChange={(e) => update("defaultPlayerPrice", parseFloat(e.target.value) || 1)}
                className="fantasy-input" />
            </div>
            <div className="config-field">
              <label>Price range — min (million)</label>
              <input type="number" min={0.5} step={0.5} value={config.priceRangeMin}
                onChange={(e) => update("priceRangeMin", parseFloat(e.target.value) || 0.5)}
                className="fantasy-input" />
            </div>
            <div className="config-field">
              <label>Price range — max (million)</label>
              <input type="number" min={1} step={0.5} value={config.priceRangeMax}
                onChange={(e) => update("priceRangeMax", parseFloat(e.target.value) || 1)}
                className="fantasy-input" />
            </div>
            <div className="config-field">
              <label>Price round to</label>
              <select value={config.priceRoundTo} onChange={(e) => update("priceRoundTo", parseFloat(e.target.value))} className="fantasy-select">
                <option value={0.1}>0.1</option>
                <option value={0.25}>0.25</option>
                <option value={0.5}>0.5</option>
                <option value={1}>1.0</option>
              </select>
            </div>
          </div>
        </div>

        {/* Price Formula */}
        <div className="panel">
          <div className="panel-header">
            <h3><TrendingUp size={16} /> Price Change Formula</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Pricing model</label>
              <select value={config.priceFormula} onChange={(e) => update("priceFormula", e.target.value as "performance" | "market" | "hybrid")} className="fantasy-select">
                <option value="performance">Performance-based</option>
                <option value="market">Market demand (transfers in/out)</option>
                <option value="hybrid">Hybrid (performance + market)</option>
              </select>
            </div>
            <div className="config-field">
              <label>Update frequency</label>
              <select value={config.priceUpdateFrequency} onChange={(e) => update("priceUpdateFrequency", e.target.value as "daily" | "weekly" | "gamethread" | "manual")} className="fantasy-select">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="gamethread">After each gameweek</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
            <div className="config-field">
              <label>Max price change per update</label>
              <input type="number" min={0.1} step={0.1} value={config.priceChangeMaxPerUpdate}
                onChange={(e) => update("priceChangeMaxPerUpdate", parseFloat(e.target.value) || 0.1)}
                className="fantasy-input" />
            </div>
            <div className="config-field">
              <label>Performance weight (%)</label>
              <input type="number" min={0} max={100} value={config.performanceWeight}
                onChange={(e) => update("performanceWeight", parseInt(e.target.value) || 0)}
                className="fantasy-input" />
            </div>
            <div className="config-field">
              <label>Popularity/Transfer weight (%)</label>
              <input type="number" min={0} max={100} value={config.popularityWeight}
                onChange={(e) => update("popularityWeight", parseInt(e.target.value) || 0)}
                className="fantasy-input" />
            </div>
            <div className="config-field">
              <label>Form lookback period (gameweeks)</label>
              <input type="number" min={1} max={20} value={config.formLookbackPeriod}
                onChange={(e) => update("formLookbackPeriod", parseInt(e.target.value) || 1)}
                className="fantasy-input" />
            </div>
          </div>
        </div>

        {/* Price Floors & Ceilings */}
        <div className="panel">
          <div className="panel-header">
            <h3><RotateCcw size={16} /> Price Floors & Ceilings</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field toggle-field">
              <label>Enable price floor</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={config.enablePriceFloor}
                  onChange={(e) => update("enablePriceFloor", e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
            {config.enablePriceFloor && (
              <div className="config-field">
                <label>Price floor (million)</label>
                <input type="number" min={0.5} step={0.5} value={config.priceFloor}
                  onChange={(e) => update("priceFloor", parseFloat(e.target.value) || 0.5)}
                  className="fantasy-input" />
              </div>
            )}
            <div className="config-field toggle-field">
              <label>Enable price ceiling</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={config.enablePriceCeiling}
                  onChange={(e) => update("enablePriceCeiling", e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
            {config.enablePriceCeiling && (
              <div className="config-field">
                <label>Price ceiling (million)</label>
                <input type="number" min={1} step={0.5} value={config.priceCeiling}
                  onChange={(e) => update("priceCeiling", parseFloat(e.target.value) || 1)}
                  className="fantasy-input" />
              </div>
            )}
            <div className="config-field toggle-field">
              <label>Price drop protection</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={config.priceDropProtection}
                  onChange={(e) => update("priceDropProtection", e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
            {config.priceDropProtection && (
              <div className="config-field">
                <label>Drop protection period (gameweeks)</label>
                <input type="number" min={1} max={10} value={config.priceDropProtectionWeeks}
                  onChange={(e) => update("priceDropProtectionWeeks", parseInt(e.target.value) || 1)}
                  className="fantasy-input" />
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Pricing & Injuries */}
        <div className="panel">
          <div className="panel-header">
            <h3><BadgePercent size={16} /> Dynamic Pricing & Adjustments</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field toggle-field">
              <label>Enable dynamic pricing</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={config.enableDynamicPricing}
                  onChange={(e) => update("enableDynamicPricing", e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="config-field toggle-field">
              <label>Lock price for new signings</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={config.priceLockNewSignings}
                  onChange={(e) => update("priceLockNewSignings", e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
            {config.priceLockNewSignings && (
              <div className="config-field">
                <label>Price lock duration</label>
                <select value={config.priceLockDuration} onChange={(e) => update("priceLockDuration", e.target.value)} className="fantasy-select">
                  <option value="1w">1 week</option>
                  <option value="2w">2 weeks</option>
                  <option value="3w">3 weeks</option>
                  <option value="4w">4 weeks</option>
                </select>
              </div>
            )}
            <div className="config-field toggle-field">
              <label>Enable injury discount</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={config.enableInjuryDiscount}
                  onChange={(e) => update("enableInjuryDiscount", e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
            {config.enableInjuryDiscount && (
              <div className="config-field">
                <label>Injury discount (%)</label>
                <input type="number" min={0} max={50} value={config.injuryDiscountPercent}
                  onChange={(e) => update("injuryDiscountPercent", parseInt(e.target.value) || 0)}
                  className="fantasy-input" />
              </div>
            )}
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