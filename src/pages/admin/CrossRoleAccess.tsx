import { useState } from 'react';
import { Save, Info } from 'lucide-react';

const FEATURES = [
  { id: 'fantasy',     label: 'Fantasy Leagues',        desc: 'Create teams, join leagues, track scores' },
  { id: 'tickets',     label: 'Ticket Purchasing',       desc: 'Buy and manage match tickets' },
  { id: 'memberships', label: 'Club Memberships',        desc: 'Join and manage club memberships' },
  { id: 'analytics',   label: 'Analytics Dashboard',    desc: 'View platform-wide statistics' },
  { id: 'impersonate', label: 'User Impersonation',      desc: 'View platform as another user (read-only)' },
  { id: 'audit',       label: 'Audit Logs',              desc: 'Access full audit trail' },
  { id: 'finance',     label: 'Finance Management',      desc: 'View and export financial reports' },
  { id: 'campaigns',   label: 'Campaign Management',     desc: 'Create and review sponsor campaigns' },
  { id: 'polls',       label: 'Polls & Surveys',         desc: 'Create and manage fan polls' },
  { id: 'media',       label: 'Media Upload',            desc: 'Upload photos, videos, press releases' },
];

const ROLES = ['Super Admin', 'Admin', 'Club Owner', 'Referee', 'Sponsor', 'Fan', 'Media Officer'];

type AccessMatrix = Record<string, Record<string, boolean>>;

const DEFAULT_MATRIX: AccessMatrix = {
  fantasy:     { 'Super Admin': true,  Admin: true,  'Club Owner': false, Referee: false, Sponsor: false, Fan: true,  'Media Officer': false },
  tickets:     { 'Super Admin': true,  Admin: true,  'Club Owner': true,  Referee: false, Sponsor: false, Fan: true,  'Media Officer': false },
  memberships: { 'Super Admin': true,  Admin: true,  'Club Owner': true,  Referee: false, Sponsor: false, Fan: true,  'Media Officer': false },
  analytics:   { 'Super Admin': true,  Admin: true,  'Club Owner': true,  Referee: false, Sponsor: true,  Fan: false, 'Media Officer': false },
  impersonate: { 'Super Admin': true,  Admin: false, 'Club Owner': false, Referee: false, Sponsor: false, Fan: false, 'Media Officer': false },
  audit:       { 'Super Admin': true,  Admin: true,  'Club Owner': false, Referee: false, Sponsor: false, Fan: false, 'Media Officer': false },
  finance:     { 'Super Admin': true,  Admin: true,  'Club Owner': true,  Referee: false, Sponsor: true,  Fan: false, 'Media Officer': false },
  campaigns:   { 'Super Admin': true,  Admin: true,  'Club Owner': false, Referee: false, Sponsor: true,  Fan: false, 'Media Officer': false },
  polls:       { 'Super Admin': true,  Admin: true,  'Club Owner': false, Referee: false, Sponsor: false, Fan: false, 'Media Officer': false },
  media:       { 'Super Admin': true,  Admin: true,  'Club Owner': true,  Referee: false, Sponsor: false, Fan: false, 'Media Officer': true  },
};

export default function CrossRoleAccess() {
  const [matrix, setMatrix] = useState<AccessMatrix>(DEFAULT_MATRIX);
  const [saved, setSaved] = useState(false);

  const toggle = (featureId: string, role: string) => {
    setMatrix(prev => ({
      ...prev,
      [featureId]: { ...prev[featureId], [role]: !prev[featureId][role] }
    }));
    setSaved(false);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h2>Cross-Role Feature Access</h2>
          <p>Configure which platform features each role can access. Changes apply immediately.</p>
        </div>
        <button className="adm-btn" onClick={handleSave}>
          <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="adm-info-banner">
        <Info size={15} />
        <span>Toggling access here overrides default role permissions. Use with care — changes are audit-logged.</span>
      </div>

      <div className="adm-matrix-wrap">
        <table className="adm-matrix-table">
          <thead>
            <tr>
              <th className="adm-matrix-feature-col">Feature</th>
              {ROLES.map(r => <th key={r} className="adm-matrix-role-col">{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map(f => (
              <tr key={f.id}>
                <td>
                  <div className="adm-matrix-feature">
                    <span className="adm-user-name">{f.label}</span>
                    <span className="adm-muted" style={{ fontSize: 11 }}>{f.desc}</span>
                  </div>
                </td>
                {ROLES.map(role => (
                  <td key={role} className="adm-matrix-cell">
                    <label className="adm-toggle">
                      <input
                        type="checkbox"
                        checked={matrix[f.id]?.[role] ?? false}
                        onChange={() => toggle(f.id, role)}
                        disabled={role === 'Super Admin'}
                      />
                      <span className="adm-toggle-slider" />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
