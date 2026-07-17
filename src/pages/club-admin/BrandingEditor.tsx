import { useState } from "react";
import { Upload } from "lucide-react";

export default function BrandingEditor() {
  const [branding, setBranding] = useState({
    primaryColor: "#7C4DFF",
    secondaryColor: "#02D37F",
    accentColor: "#F7C548",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const colors = [
    { key: "primaryColor", label: "Primary Color", value: branding.primaryColor },
    { key: "secondaryColor", label: "Secondary Color", value: branding.secondaryColor },
    { key: "accentColor", label: "Accent Color", value: branding.accentColor },
  ] as const;

  const handleColorChange = (key: keyof typeof branding, value: string) => {
    setBranding((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // TODO: API call to save branding
    console.log("Saving branding:", branding);
  };

  return (
    <div className="club-page">
      <div className="club-page-header">
        <h1>Branding</h1>
        <p>Customise your club's logo, colours, and kit designs.</p>
      </div>

      <div className="branding-grid">
        {/* Logo Section */}
        <div className="club-panel">
          <h2>Club Logo</h2>
          <p className="panel-desc">Upload your club's official logo.</p>

          {logoPreview ? (
            <div>
              <img src={logoPreview} alt="Club logo" className="logo-preview" />
              <div className="club-btn-group" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="club-btn-secondary"
                  onClick={() => {
                    const input = document.getElementById("logo-upload") as HTMLInputElement;
                    input?.click();
                  }}
                >
                  Change Logo
                </button>
              </div>
            </div>
          ) : (
            <label className="logo-upload-area">
              <Upload size={28} color="var(--muted)" />
              <span>Click to upload logo</span>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>

        {/* Colours Section */}
        <div className="club-panel">
          <h2>Club Colours</h2>
          <p className="panel-desc">Set your club's brand colour palette.</p>

          <div className="branding-section">
            {colors.map((c) => (
              <div className="color-picker-row" key={c.key}>
                <label>{c.label}</label>
                <input
                  type="color"
                  value={c.value}
                  onChange={(e) => handleColorChange(c.key, e.target.value)}
                />
                <div className="color-preview" style={{ background: c.value }} />
                <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>
                  {c.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kit Designs */}
        <div className="club-panel">
          <h2>Kit Designs</h2>
          <p className="panel-desc">Preview your club's home and away kits.</p>

          <div className="kit-preview">
            <div className="kit-shirt">
              <span className="kit-shirt-label">Home</span>
              <div
                className="kit-shirt-shape"
                style={{ background: branding.primaryColor }}
              >
                <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>KCC</span>
              </div>
            </div>

            <div className="kit-shirt">
              <span className="kit-shirt-label">Away</span>
              <div
                className="kit-shirt-shape"
                style={{ background: branding.secondaryColor }}
              >
                <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>KCC</span>
              </div>
            </div>

            <div className="kit-shirt">
              <span className="kit-shirt-label">Third</span>
              <div
                className="kit-shirt-shape"
                style={{ background: branding.accentColor }}
              >
                <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>KCC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="club-panel">
          <h2>Brand Preview</h2>
          <p className="panel-desc">See how your branding looks together.</p>

          <div
            style={{
              background: branding.primaryColor,
              borderRadius: 14,
              padding: 24,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: 16,
                backdropFilter: "blur(8px)",
              }}
            >
              <strong style={{ color: "#fff", fontSize: 16 }}>Kampala City FC</strong>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span
                  style={{
                    background: branding.secondaryColor,
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  Home Kit
                </span>
                <span
                  style={{
                    background: branding.accentColor,
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  Accent
                </span>
              </div>
            </div>
          </div>

          <div className="club-btn-group">
            <button type="button" className="club-btn-primary" onClick={handleSave}>
              Save Branding
            </button>
            <button type="button" className="club-btn-secondary">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
