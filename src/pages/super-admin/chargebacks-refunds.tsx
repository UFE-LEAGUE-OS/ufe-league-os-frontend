import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import '../../styles/pages/SuperAdminFinance/SuperAdminFinance.css';
import '../../styles/pages/SuperAdminFinance/ChargebacksRefunds.css';

const chargebackTrend = [
  { name: 'Jan', chargebacks: 12, refunds: 26 },
  { name: 'Feb', chargebacks: 14, refunds: 22 },
  { name: 'Mar', chargebacks: 16, refunds: 18 },
  { name: 'Apr', chargebacks: 13, refunds: 20 },
  { name: 'May', chargebacks: 17, refunds: 24 },
  { name: 'Jun', chargebacks: 15, refunds: 23 },
];

const chargebackReasons = [
  { name: 'Fraudulent', value: 35 },
  { name: 'Customer Dispute', value: 28 },
  { name: 'Product/Service Not Received', value: 18 },
  { name: 'Duplicate Charge', value: 11 },
  { name: 'Other', value: 8 },
];

const reasonColors = ['#8B5CF6', '#22D3EE', '#F5C518', '#F97316', '#EC4899'];

interface ChargebackCase {
  id: string;
  type: 'Chargeback' | 'Refund';
  txn: string;
  user: string;
  amount: string;
  reason: string;
  status: 'Open' | 'Approved' | 'Under Review';
  date: string;
}

const chargebackCases: ChargebackCase[] = [
  { id: 'CBK-10021', type: 'Chargeback', txn: 'TXN-987620', user: 'John Doe', amount: '$120.00', reason: 'Fraudulent', status: 'Open', date: 'Jun 4, 2025' },
  { id: 'REF-10020', type: 'Refund', txn: 'TXN-987610', user: 'Jane Smith', amount: '$59.00', reason: 'Customer Request', status: 'Approved', date: 'Jun 4, 2025' },
  { id: 'CBK-10019', type: 'Chargeback', txn: 'TXN-987600', user: 'Samuel Okello', amount: '$75.00', reason: 'Product Not Received', status: 'Under Review', date: 'Jun 3, 2025' },
  { id: 'REF-10018', type: 'Refund', txn: 'TXN-987590', user: 'Mercy A.', amount: '$220.00', reason: 'Duplicate Charge', status: 'Approved', date: 'Jun 2, 2025' },
  { id: 'CBK-10017', type: 'Chargeback', txn: 'TXN-987580', user: 'Brian T.', amount: '$95.00', reason: 'Fraudulent', status: 'Under Review', date: 'Jun 1, 2025' },
  { id: 'CBK-10016', type: 'Chargeback', txn: 'TXN-987570', user: 'Anne Smith', amount: '$40.00', reason: 'Customer Dispute', status: 'Open', date: 'May 30, 2025' },
];

const caseStatusClass: Record<ChargebackCase['status'], string> = {
  Open: 'case-status-open',
  Approved: 'case-status-approved',
  'Under Review': 'case-status-review',
};

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function ChargebacksRefundsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();

    return chargebackCases.filter((item) => {
      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesSearch =
        query === '' ||
        item.id.toLowerCase().includes(query) ||
        item.txn.toLowerCase().includes(query) ||
        item.user.toLowerCase().includes(query) ||
        item.reason.toLowerCase().includes(query);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [search, typeFilter, statusFilter]);

  return (
    <main className="super-admin-page finance-child">
      <section className="page-heading">
        <div className="title-group">
          <h1>Chargebacks & Refunds</h1>
          <p>Finance & Security · Chargebacks & Refunds</p>
        </div>
        <div className="page-actions">
          <button className="button-secondary">Export</button>
          <button className="button-primary">Review cases</button>
        </div>
      </section>

      <section className="top-stats-grid">
        <article className="metric-card accent-green">
          <div className="metric-label">Total Refunds</div>
          <div className="metric-value">$2,450</div>
        </article>
        <article className="metric-card accent-amber">
          <div className="metric-label">Open Chargebacks</div>
          <div className="metric-value">16</div>
        </article>
        <article className="metric-card accent-orange">
          <div className="metric-label">Resolved</div>
          <div className="metric-value">28</div>
        </article>
        <article className="metric-card accent-purple">
          <div className="metric-label">Avg. Resolution Time</div>
          <div className="metric-value">3.6 days</div>
        </article>
        <article className="metric-card accent-red">
          <div className="metric-label">Chargeback Loss</div>
          <div className="metric-value">$1,230</div>
        </article>
      </section>

      <section className="chart-grid">
        <article className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-label">Dispute trend</div>
              <h2>Chargebacks vs refunds</h2>
            </div>
            <div className="label">Last 6 months</div>
          </div>
          <div className="chart-svg">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chargebackTrend} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip wrapperStyle={{ backgroundColor: '#09101F', borderRadius: 12, border: '1px solid rgba(148,163,184,0.16)' }} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12, marginBottom: 8 }} />
                <Area type="monotone" dataKey="chargebacks" name="Chargebacks" stroke="#EF476F" fill="rgba(239,71,111,0.18)" strokeWidth={3} />
                <Area type="monotone" dataKey="refunds" name="Refunds" stroke="#8B5CF6" fill="rgba(124,77,255,0.18)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-label">Dispute breakdown</div>
              <h2>Chargeback Reasons</h2>
            </div>
          </div>

          <div className="donut-with-legend">
            <div className="chart-svg donut-svg">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chargebackReasons}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={94}
                    paddingAngle={4}
                  >
                    {chargebackReasons.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={reasonColors[index % reasonColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ backgroundColor: '#09101F', borderRadius: 12, border: '1px solid rgba(148,163,184,0.16)' }}
                    formatter={(value) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="legend-list">
              {chargebackReasons.map((reason, index) => (
                <div className="legend-item" key={reason.name}>
                  <span className="legend-swatch" style={{ background: reasonColors[index % reasonColors.length] }} />
                  <span className="legend-label">{reason.name}</span>
                  <span className="legend-pct">{reason.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="table-section chargeback-cases-section">
        <div className="chargeback-cases-header">
          <h2>Recent Chargebacks & Refunds</h2>
        </div>

        <div className="table-toolbar" style={{ padding: '0 20px 16px' }}>
          <div className="filter-group">
            <div className="filter-item">
              Search
              <input
                type="text"
                placeholder="ID, transaction, user, reason…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-item">
              Type
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Chargeback">Chargeback</option>
                <option value="Refund">Refund</option>
              </select>
            </div>
            <div className="filter-item">
              Status
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>
          <div className="table-actions">
            <button
              className="button-secondary"
              onClick={() => {
                setSearch('');
                setTypeFilter('All');
                setStatusFilter('All');
              }}
            >
              Clear filters
            </button>
            <button className="button-secondary">View more</button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="chargeback-cases-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--muted)' }}>
                    No cases match the current filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.type}</td>
                    <td>{item.txn}</td>
                    <td>{item.user}</td>
                    <td>{item.amount}</td>
                    <td>{item.reason}</td>
                    <td>
                      <span className={`case-status-pill ${caseStatusClass[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.date}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" aria-label={`View ${item.id}`}>
                          <EyeIcon />
                        </button>
                      </div>
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