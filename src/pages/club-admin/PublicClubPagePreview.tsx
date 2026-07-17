import { useState } from "react";
import { Smartphone, Monitor, ExternalLink, Share2 } from "lucide-react";

export default function PublicClubPagePreview() {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const clubUrl = "https://ufe-league-os.vercel.app/clubs/kampala-city-fc";

  return (
    <div className="club-page">
      <div className="club-page-header">
        <h1>Public Page Preview</h1>
        <p>See how your club page looks to visitors before publishing changes.</p>
      </div>

      {/* Info Bar */}
      <div className="club-panel">
        <div className="publish-actions-bar">
          <div className="publish-info">
            <h2 style={{ marginBottom: 4 }}>Your Club Page</h2>
            <p className="panel-desc" style={{ marginBottom: 0 }}>
              This is how your club appears to fans, members, and the public on League OS.
            </p>
          </div>
          <a
            href={clubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="club-btn-primary"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <ExternalLink size={16} />
            Open Live Page
          </a>
        </div>
      </div>

      {/* Device Toolbar */}
      <div className="preview-frame">
        <div className="preview-device-bar">
          <button
            type="button"
            className={`preview-device-btn ${device === "desktop" ? "active" : ""}`}
            onClick={() => setDevice("desktop")}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            type="button"
            className={`preview-device-btn ${device === "mobile" ? "active" : ""}`}
            onClick={() => setDevice("mobile")}
          >
            <Smartphone size={14} /> Mobile
          </button>
          <span className="preview-url">{clubUrl}</span>
          <button
            type="button"
            className="preview-device-btn share-btn"
          >
            <Share2 size={14} /> Share
          </button>
        </div>

        {/* Preview Content */}
        <div
          style={{
            padding: device === "mobile" ? "0 12px" : 0,
            maxWidth: device === "mobile" ? 420 : "100%",
            margin: "0 auto",
            background: "#ffffff",
            color: "#1a1a1a",
            minHeight: 500,
          }}
        >
          {/* Club Hero */}
          <div
            style={{
              background: "linear-gradient(135deg, #7C4DFF, #5B2EE7)",
              padding: device === "mobile" ? 24 : 48,
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: device === "mobile" ? 12 : 24,
                flexDirection: device === "mobile" ? "column" : "row",
                textAlign: device === "mobile" ? "center" : "left",
              }}
            >
              {/* Logo placeholder */}
              <div
                style={{
                  width: device === "mobile" ? 80 : 120,
                  height: device === "mobile" ? 80 : 120,
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: device === "mobile" ? 24 : 36,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                KCC
              </div>
              <div>
                <h1
                  style={{
                    fontSize: device === "mobile" ? 22 : 36,
                    fontWeight: 800,
                    margin: "0 0 4px",
                    color: "white",
                  }}
                >
                  Kampala City FC
                </h1>
                <p style={{ opacity: 0.85, margin: 0, fontSize: device === "mobile" ? 13 : 15 }}>
                  Football Club • Kampala, Uganda • Founded 1967
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    flexWrap: "wrap",
                    justifyContent: device === "mobile" ? "center" : "flex-start",
                  }}
                >
                  <span
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Uganda Premier League
                  </span>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Football
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Club Info Section */}
          <div style={{ padding: device === "mobile" ? 16 : 32 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: device === "mobile" ? "1fr" : "2fr 1fr",
                gap: 24,
              }}
            >
              {/* About */}
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#1a1a1a" }}>
                  About
                </h2>
                <p style={{ lineHeight: 1.7, color: "#4a4a4a", fontSize: 14 }}>
                  Kampala City FC is a professional football club based in Kampala, Uganda. 
                  Founded in 1967, the club competes in the Uganda Premier League and is one 
                  of the most successful clubs in the country, with multiple league titles 
                  and domestic cup victories.
                </p>

                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    marginTop: 24,
                    marginBottom: 12,
                    color: "#1a1a1a",
                  }}
                >
                  Club Details
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    fontSize: 14,
                  }}
                >
                  {[
                    { label: "Founded", value: "1967" },
                    { label: "Sport", value: "Football" },
                    { label: "Home Venue", value: "StarTimes Stadium" },
                    { label: "Capacity", value: "5,000" },
                    { label: "League", value: "Uganda Premier League" },
                    { label: "Website", value: "kampalacityfc.ug" },
                  ].map((detail) => (
                    <div key={detail.label}>
                      <span style={{ color: "#888", fontSize: 12 }}>{detail.label}</span>
                      <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{detail.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Info Sidebar */}
              <div
                style={{
                  background: "#f5f5f5",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#1a1a1a" }}>
                  Quick Info
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#7C4DFF" }}>12</div>
                    <div style={{ fontSize: 12, color: "#888" }}>League Titles</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#7C4DFF" }}>8</div>
                    <div style={{ fontSize: 12, color: "#888" }}>Cup Victories</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#7C4DFF" }}>3</div>
                    <div style={{ fontSize: 12, color: "#888" }}>Active Teams</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Actions */}
      <div className="club-panel publish-actions-bar">
        <div className="publish-info">
          <h2 style={{ marginBottom: 4 }}>Publish Changes</h2>
          <p className="panel-desc" style={{ marginBottom: 0 }}>
            Your changes are currently in draft. Publish to make them live.
          </p>
        </div>
        <div className="club-btn-group" style={{ marginTop: 0 }}>
          <button type="button" className="club-btn-secondary">
            Save Draft
          </button>
          <button type="button" className="club-btn-primary">
            Publish Now
          </button>
        </div>
      </div>
    </div>
  );
}
