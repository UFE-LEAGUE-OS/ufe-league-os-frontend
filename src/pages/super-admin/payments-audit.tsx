import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import '../../styles/pages/SuperAdminFinance/SuperAdminFinance.css';
import '../../styles/pages/SuperAdminFinance/PaymentsAudit.css';
import FilterDropdown from '../../components/FilterDropdown';

const paymentsTrend = [
  { name: 'Jan', total: 2240, revenue: 13200 },
  { name: 'Feb', total: 1830, revenue: 11800 },
  { name: 'Mar', total: 2140, revenue: 14400 },
  { name: 'Apr', total: 2400, revenue: 16800 },
  { name: 'May', total: 2530, revenue: 17800 },
  { name: 'Jun', total: 2890, revenue: 19800 },
];

const paymentMethods = [
  { name: 'MTN Mobile Money', value: 32 },
  { name: 'Airtel Mobile Money', value: 21 },
  { name: 'Bank transfer', value: 18 },
  { name: 'Visa/Mastercard', value: 16 },
  { name: 'Others', value: 13 },
];

const colors = ['#8B5CF6', '#22C55E', '#F97316', '#38BDF8', '#A855F7'];

interface Payment {
  id: string;
  user: string;
  amount: string;
  method: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  country: string;
}

const recentPayments: Payment[] = [
  { id: 'TXN-987654', user: 'John Doe', amount: '$120.00', method: 'Mobile Money', status: 'success', date: 'Jun 4, 2025 10:24 AM', country: 'UG' },
  { id: 'TXN-987653', user: 'Jane Smith', amount: '$59.00', method: 'Visa', status: 'success', date: 'Jun 4, 2025 10:18 AM', country: 'UG' },
  { id: 'TXN-987652', user: 'Samuel Okello', amount: '$75.00', method: 'Airtel Money', status: 'pending', date: 'Jun 4, 2025 10:15 AM', country: 'KE' },
  { id: 'TXN-987651', user: 'Mercy A.', amount: '$20.00', method: 'Mobile Money', status: 'failed', date: 'Jun 4, 2025 10:10 AM', country: 'UG' },
];

const statusLabel: Record<Payment['status'], string> = {
  success: 'Success',
  pending: 'Pending',
  failed: 'Failed',
};

const statusOptions = ['All', 'Success', 'Pending', 'Failed'];

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function RefundIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8.5 12h7M9.5 9l-3 3 3 3" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  );
}

export default function PaymentsAuditPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');

  const methodOptions = useMemo(() => {
    const unique = Array.from(new Set(recentPayments.map((p) => p.method)));
    return ['All', ...unique];
  }, []);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recentPayments.filter((payment) => {
      const matchesStatus =
        statusFilter === 'All' || statusLabel[payment.status] === statusFilter;
      const matchesMethod = methodFilter === 'All' || payment.method === methodFilter;
      const matchesSearch =
        query === '' ||
        payment.id.toLowerCase().includes(query) ||
        payment.user.toLowerCase().includes(query) ||
        payment.country.toLowerCase().includes(query);

      return matchesStatus && matchesMethod && matchesSearch;
    });
  }, [search, statusFilter, methodFilter]);

  return (
    <main className="super-admin-page finance-child">
      <section className="page-heading">
        <div className="title-group">
          <h1>Payments Audit Overview</h1>
          <p>Finance & Security · Payments Audit</p>
        </div>
        <div className="page-actions">
          <button className="button-secondary">Export</button>
          <button className="button-primary">Create report</button>
        </div>
      </section>

      <section className="top-stats-grid grid-6">
        <article className="metric-card accent-green">
            <div className="metric-label">Total Payments</div>
            <div className="metric-value">1,248</div>
            <div className="metric-delta positive">+0.4% vs last 30 days</div>
        </article>
        <article className="metric-card accent-amber">
            <div className="metric-label">Successful Payments</div>
            <div className="metric-value">1,102</div>
            <div className="metric-delta positive">+6.7%</div>
        </article>
        <article className="metric-card accent-orange">
            <div className="metric-label">Total Revenue</div>
            <div className="metric-value">$32,500</div>
            <div className="metric-delta positive">+7.3%</div>
        </article>
        <article className="metric-card accent-red">
            <div className="metric-label">Refunds</div>
            <div className="metric-value">$2,450</div>
            <div className="metric-delta negative">-2.1%</div>
        </article>
        <article className="metric-card accent-purple">
            <div className="metric-label">Chargebacks</div>
            <div className="metric-value">$1,230</div>
            <div className="metric-delta positive">+1.4%</div>
        </article>
        <article className="metric-card accent-red">
            <div className="metric-label">Failed Payments</div>
            <div className="metric-value">46</div>
            <div className="metric-delta negative">-12.5%</div>
        </article>
      </section>

      <section className="chart-grid">
        <article className="chart-card">
          <div className="chart-header">
            <div className="chart-label">Revenue Trend</div>
            <select className="range-select" defaultValue="30">
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
            </select>
          </div>
          <div className="chart-svg">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={paymentsTrend} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v / 1000}K`}
                />
                <Tooltip
                  wrapperStyle={{ backgroundColor: '#09101F', borderRadius: 12, border: '1px solid rgba(148,163,184,0.16)' }}
                  formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                  dot={{ r: 3, fill: '#8B5CF6' }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-label">Payment methods</div>
              <h2>Method share</h2>
            </div>
            <div className="label">Current period</div>
          </div>

          <div className="donut-with-legend">
            <div className="chart-svg donut-svg">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={68}
                    outerRadius={94}
                    paddingAngle={4}
                  >
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
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
              {paymentMethods.map((method, index) => (
                <div className="legend-item" key={method.name}>
                  <span className="legend-swatch" style={{ background: colors[index % colors.length] }} />
                  <span className="legend-label">{method.name}</span>
                  <span className="legend-pct">{method.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="payments-table-card">
        <div className="payments-table-header">
          <h2>Recent Payments</h2>
        </div>

        <div className="table-toolbar">
          <div className="filter-group">
            <div className="filter-item">
              Search
              <input
                type="text"
                placeholder="Transaction ID, user, country…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-item">
              Status
              <FilterDropdown
                value={statusFilter}
                options={statusOptions}
                onChange={setStatusFilter}
              />
            </div>
            <div className="filter-item">
              Method
              <FilterDropdown
                value={methodFilter}
                options={methodOptions}
                onChange={setMethodFilter}
              />
            </div>
          </div>
          <div className="table-actions">
            <button
              className="button-secondary"
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setMethodFilter('All');
              }}
            >
              Clear filters
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date &amp; Time</th>
                <th>Country</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--muted)' }}>
                    No payments match the current filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td><a className="txn-link" href={`#${payment.id}`}>{payment.id}</a></td>
                    <td>{payment.user}</td>
                    <td>{payment.amount}</td>
                    <td>{payment.method}</td>
                    <td>
                      <span className={`status-pill status-${payment.status}`}>
                        {statusLabel[payment.status]}
                      </span>
                    </td>
                    <td>{payment.date}</td>
                    <td>{payment.country}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" aria-label={`View ${payment.id}`}><EyeIcon /></button>
                        <button className="icon-btn" aria-label={`Refund ${payment.id}`}><RefundIcon /></button>
                        <button className="icon-btn" aria-label={`Receipt for ${payment.id}`}><ReceiptIcon /></button>
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