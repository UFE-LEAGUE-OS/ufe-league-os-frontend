import { useMemo, useState } from 'react';
import { ChevronDown, Filter, Download } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import '../../styles/pages/SuperAdminFinance/SuperAdminFinance.css';
import '../../styles/pages/SuperAdminFinance/DataAccessLog.css';
import FilterDropdown from '../../components/FilterDropdown';

const accessTrend = [
  { name: 'Mon', logins: 24, exports: 2 },
  { name: 'Tue', logins: 32, exports: 3 },
  { name: 'Wed', logins: 28, exports: 1 },
  { name: 'Thu', logins: 18, exports: 4 },
  { name: 'Fri', logins: 42, exports: 3 },
  { name: 'Sat', logins: 30, exports: 2 },
  { name: 'Sun', logins: 20, exports: 0 },
];

const auditEntries = [
  { timestamp: 'Jun 4, 2025 10:24 AM', user: 'Merab Apio', role: 'Super Admin', module: 'Payments', action: 'Viewed Transaction #987654', ip: '102.89.23.45', location: 'Kampala, UG', result: 'Success' },
  { timestamp: 'Jun 4, 2025 10:18 AM', user: 'Irene N.', role: 'Finance Officer', module: 'Refunds', action: 'Approved Refund #REF-10020', ip: '196.201.14.23', location: 'Nairobi, KE', result: 'Success' },
  { timestamp: 'Jun 4, 2025 10:15 AM', user: 'Brian T.', role: 'Club Admin', module: 'Users', action: 'Exported Users Report', ip: '102.89.23.45', location: 'Kampala, UG', result: 'Success' },
  { timestamp: 'Jun 4, 2025 10:10 AM', user: 'Jane Smith', role: 'League Admin', module: 'Matches', action: 'Updated Match Details', ip: '105.78.12.90', location: 'Kampala, UG', result: 'Success' },
  { timestamp: 'Jun 3, 2025 09:58 AM', user: 'Samuel Okello', role: 'Finance Officer', module: 'Payments', action: 'Viewed Payouts', ip: '196.201.14.23', location: 'Nairobi, KE', result: 'Success' },
];

const roles = ['All Roles', 'Super Admin', 'Finance Officer', 'Club Admin', 'League Admin'];
const modules = ['All Modules', 'Payments', 'Refunds', 'Users', 'Matches'];
const actionTypes = ['All Actions', 'Viewed', 'Approved', 'Exported', 'Updated'];
const results = ['All Results', 'Success', 'Failed'];

export default function DataAccessLogPage() {
  const [role, setRole] = useState('All Roles');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [resultFilter, setResultFilter] = useState('All Results');

  const filteredEntries = useMemo(() => {
    return auditEntries.filter((entry) => {
      const matchesRole = role === 'All Roles' || entry.role === role;
      const matchesModule = moduleFilter === 'All Modules' || entry.module === moduleFilter;
      const matchesAction =
        actionFilter === 'All Actions' || entry.action.toLowerCase().startsWith(actionFilter.toLowerCase().slice(0, -1));
      const matchesResult = resultFilter === 'All Results' || entry.result === resultFilter;

      return matchesRole && matchesModule && matchesAction && matchesResult;
    });
  }, [role, moduleFilter, actionFilter, resultFilter]);

  return (
    <main className="super-admin-page finance-child">
      <section className="page-heading">
        <div className="title-group">
          <h1>Data Access Audit Log</h1>
          <p>Finance & Security · Data Access Log</p>
        </div>
        <div className="page-actions">
          <button className="button-secondary">Export</button>
          <button className="button-primary">Review logs</button>
        </div>
      </section>

      <section className="top-stats-grid">
        <article className="metric-card accent-green">
          <div className="metric-label">Daily Logins</div>
          <div className="metric-value">124</div>
        </article>
        <article className="metric-card accent-amber">
          <div className="metric-label">Admin Access</div>
          <div className="metric-value">32</div>
        </article>
        <article className="metric-card accent-orange">
          <div className="metric-label">Sensitive Records</div>
          <div className="metric-value">78</div>
        </article>
        <article className="metric-card accent-purple">
          <div className="metric-label">Failed Access Attempts</div>
          <div className="metric-value">05</div>
        </article>
        <article className="metric-card accent-red">
          <div className="metric-label">Exported Reports</div>
          <div className="metric-value">16</div>
        </article>
      </section>

      <section className="chart-grid">
        <article className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-label">Access trend</div>
              <h2>Logins and exports</h2>
            </div>
            <div className="label">Last 7 days</div>
          </div>
          <div className="chart-svg">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={accessTrend} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip wrapperStyle={{ backgroundColor: '#09101F', borderRadius: 12, border: '1px solid rgba(148,163,184,0.16)' }} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12, marginBottom: 8 }} />
                <Area type="monotone" dataKey="logins" name="Logins" stroke="#8B5CF6" fill="rgba(124,77,255,0.18)" strokeWidth={3} />
                <Area type="monotone" dataKey="exports" name="Exports" stroke="#22C55E" fill="rgba(34,197,94,0.16)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="page-panel">
          <h2>Audit Summary</h2>
          <p>Track sensitive data access and identify anomalous export activity across the platform.</p>
          <div className="mini-progress">
            <div className="progress-row">
              <span className="progress-title">User record view</span>
              <div className="progress-bar">
                <span className="progress-fill progress-fill-purple" style={{ width: '72%' }} />
              </div>
              <span className="progress-value">72%</span>
            </div>
            <div className="progress-row">
              <span className="progress-title">Export risk</span>
              <div className="progress-bar">
                <span className="progress-fill progress-fill-red" style={{ width: '46%' }} />
              </div>
              <span className="progress-value">46%</span>
            </div>
            <div className="progress-row">
              <span className="progress-title">Admin access</span>
              <div className="progress-bar">
                <span className="progress-fill progress-fill-green" style={{ width: '58%' }} />
              </div>
              <span className="progress-value">58%</span>
            </div>
          </div>
        </article>
      </section>

      <section className="table-section audit-log-section">
        <div className="audit-toolbar">
          <div className="date-range-badge">
            <span className="date-range-label">Date Range</span>
            <span className="date-range-value">May 5 – Jun 4, 2025</span>
            <ChevronDown size={14} />
          </div>

          <div className="audit-select-wrap">
            <FilterDropdown value={role} options={roles} onChange={setRole} />
          </div>

          <div className="audit-select-wrap">
            <FilterDropdown value={moduleFilter} options={modules} onChange={setModuleFilter} />
          </div>

          <div className="audit-select-wrap">
            <FilterDropdown value={actionFilter} options={actionTypes} onChange={setActionFilter} />
          </div>

          <div className="audit-select-wrap">
            <FilterDropdown value={resultFilter} options={results} onChange={setResultFilter} />
          </div>

          <button className="audit-filters-btn">
            <Filter size={15} />
            Filters
          </button>

          <button className="audit-export-btn">
            <Download size={15} />
            Export
          </button>
        </div>

        <div className="table-scroll">
          <table className="audit-log-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Module</th>
                <th>Action</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--muted)' }}>
                    No entries match the current filters.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, index) => (
                  <tr key={`${entry.timestamp}-${index}`}>
                    <td>{entry.timestamp}</td>
                    <td>{entry.user}</td>
                    <td>{entry.role}</td>
                    <td>{entry.module}</td>
                    <td>{entry.action}</td>
                    <td>{entry.ip}</td>
                    <td>{entry.location}</td>
                    <td>
                      <span className={entry.result === 'Success' ? 'audit-result-success' : 'audit-result-failed'}>
                        {entry.result}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}