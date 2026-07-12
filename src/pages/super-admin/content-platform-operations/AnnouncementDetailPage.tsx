import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone } from 'lucide-react';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';


// In a real app this would come from an API call keyed by :id.
// Kept local here so the page renders standalone.
const ANNOUNCEMENT_DETAILS: Record<string, { title: string; body: string; audience: string; start: string; end: string }> = {
  a2: {
    title: 'New Feature: Advanced Search',
    body: "We've rolled out Advanced Search across the platform, making it easier to find clubs, players, fixtures, and articles in seconds. Use filters for sport, competition, and date range to narrow results instantly.",
    audience: 'All Users',
    start: 'May 18, 2024 9:00 AM',
    end: 'May 24, 2024 11:59 PM',
  },
};

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const detail = (id && ANNOUNCEMENT_DETAILS[id]) || {
    title: 'Announcement',
    body: 'Full details for this announcement will appear here.',
    audience: 'All Users',
    start: '—',
    end: '—',
  };

  return (
    <main className="super-admin-page content-child">
      <button
        className="link-inline"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="panel-card">
        <div className="panel-card-header">
          <span className="banner-preview-icon"><Megaphone size={18} /></span>
          <h3 style={{ fontSize: 18 }}>{detail.title}</h3>
        </div>

        <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.6 }}>{detail.body}</p>

        <div className="field-row">
          <div className="field-group">
            <label>Audience</label>
            <span className="cell-muted">{detail.audience}</span>
          </div>
          <div className="field-group">
            <label>Active Window</label>
            <span className="cell-muted">{detail.start} – {detail.end}</span>
          </div>
        </div>
      </div>
    </main>
  );
}