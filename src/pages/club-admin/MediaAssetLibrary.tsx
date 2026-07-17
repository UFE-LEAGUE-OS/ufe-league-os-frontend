import { useState } from "react";
import { Upload, Image, FileText, Video, Download, Trash2 } from "lucide-react";

interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "document" | "video";
  size: string;
  date: string;
  thumbnail?: string;
}

const initialAssets: MediaAsset[] = [
  { id: "1", name: "club-logo.png", type: "image", size: "240 KB", date: "2026-06-15" },
  { id: "2", name: "team-photo-2026.jpg", type: "image", size: "1.2 MB", date: "2026-06-10" },
  { id: "3", name: "sponsor-banner.png", type: "image", size: "860 KB", date: "2026-06-08" },
  { id: "4", name: "match-highlight.mp4", type: "video", size: "24 MB", date: "2026-06-05" },
  { id: "5", name: "club-brochure.pdf", type: "document", size: "1.8 MB", date: "2026-06-01" },
];

const typeIcons: Record<MediaAsset["type"], typeof Image> = {
  image: Image,
  document: FileText,
  video: Video,
};

export default function MediaAssetLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [filter, setFilter] = useState<MediaAsset["type"] | "all">("all");

  const filteredAssets = filter === "all" ? assets : assets.filter((a) => a.type === filter);

  const handleUpload = () => {
    // TODO: Implement file upload
    console.log("Opening file upload dialog...");
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="club-page">
      <div className="club-page-header">
        <h1>Media Assets</h1>
        <p>Upload and manage your club's images, videos, and documents.</p>
      </div>

      {/* Upload Area */}
      <div className="club-panel">
        <div className="upload-area" onClick={handleUpload}>
          <Upload size={32} color="var(--muted)" />
          <span>Drop files here or click to upload</span>
          <small>Supports PNG, JPG, MP4, PDF — Max 50 MB per file</small>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="media-filter-bar">
        {(["all", "image", "document", "video"] as const).map((type) => (
          <button
            key={type}
            type="button"
            className={`preview-device-btn ${filter === type ? "active" : ""}`}
            onClick={() => setFilter(type)}
            style={{ textTransform: "capitalize" }}
          >
            {type}
          </button>
        ))}
        <span className="filter-count">
          {filteredAssets.length} file{filteredAssets.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Media Grid */}
      <div className="media-grid">
        {filteredAssets.length === 0 && (
          <div className="club-panel empty-state-panel">
            <p style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>
              No {filter !== "all" ? filter : ""} assets found. Upload files to get started.
            </p>
          </div>
        )}

        {filteredAssets.map((asset) => {
          const TypeIcon = typeIcons[asset.type];

          return (
            <div className="media-item" key={asset.id}>
              <div className="media-item-thumb">
                <TypeIcon size={36} />
              </div>
              <div className="media-item-info">
                <h4>{asset.name}</h4>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span>{asset.size}</span>
                  <span>{asset.date}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    className="club-btn-secondary"
                    style={{ padding: "6px 10px", fontSize: 11, flex: 1 }}
                  >
                    <Download size={12} /> Download
                  </button>
                  <button
                    type="button"
                    className="club-btn-danger"
                    style={{ padding: "6px 10px", fontSize: 11 }}
                    onClick={() => handleDelete(asset.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
