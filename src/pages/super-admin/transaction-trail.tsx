import { useMemo, useState } from 'react';
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
import '../../styles/pages/SuperAdminFinance/TransactionTrail.css';

const trailTrend = [
  { name: 'Jan', payment: 420, refunds: 48 },
  { name: 'Feb', payment: 380, refunds: 35 },
  { name: 'Mar', payment: 500, refunds: 60 },
  { name: 'Apr', payment: 520, refunds: 55 },
  { name: 'May', payment: 590, refunds: 42 },
  { name: 'Jun', payment: 610, refunds: 33 },
];

interface TimelineStep {
  label: string;
  detail: string;
  done: boolean;
}

interface TransactionDetails {
  user: string;
  email: string;
  phone: string;
  amount: string;
  method: string;
  status: 'Success' | 'Pending' | 'Failed';
  reference: string;
  ip: string;
  userAgent: string;
  processingTime: string;
}

interface Transaction {
  id: string;
  user: string;
  amount: string;
  date: string;
  timeline: TimelineStep[];
  details: TransactionDetails;
}

const transactions: Transaction[] = [
  {
    id: 'TXN-987654',
    user: 'John Doe',
    amount: '$120.00',
    date: 'Jun 4, 2025 10:24 AM',
    timeline: [
      { label: 'Created', detail: 'Transaction initiated by user', done: true },
      { label: 'Payment Requested', detail: 'Payment request sent to gateway', done: true },
      { label: 'Gateway Processing', detail: 'Mobile Money gateway processing', done: true },
      { label: 'Payment Confirmed', detail: 'Payment confirmed successfully', done: true },
      { label: 'Ticket Generated', detail: 'Ticket created and linked', done: true },
      { label: 'QR Sent', detail: 'QR code sent to user', done: true },
      { label: 'Entry Used', detail: 'Ticket validated at gate', done: true },
    ],
    details: {
      user: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+256 700 123456',
      amount: '$120.00',
      method: 'Mobile Money',
      status: 'Success',
      reference: 'MM-1749037648123',
      ip: '102.88.23.45',
      userAgent: 'Chrome / Windows',
      processingTime: '1.1s 243ms',
    },
  },
  {
    id: 'TXN-987653',
    user: 'Jane Smith',
    amount: '$59.00',
    date: 'Jun 4, 2025 10:18 AM',
    timeline: [
      { label: 'Created', detail: 'Transaction initiated by user', done: true },
      { label: 'Payment Requested', detail: 'Payment request sent to gateway', done: true },
      { label: 'Gateway Processing', detail: 'Card gateway processing', done: true },
      { label: 'Payment Confirmed', detail: 'Payment confirmed successfully', done: true },
      { label: 'Ticket Generated', detail: 'Ticket created and linked', done: false },
      { label: 'QR Sent', detail: 'QR code sent to user', done: false },
      { label: 'Entry Used', detail: 'Ticket validated at gate', done: false },
    ],
    details: {
      user: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+256 701 987654',
      amount: '$59.00',
      method: 'Visa',
      status: 'Success',
      reference: 'VS-1749036512980',
      ip: '102.88.19.12',
      userAgent: 'Safari / macOS',
      processingTime: '0.9s 118ms',
    },
  },
  {
    id: 'TXN-987652',
    user: 'Samuel Okello',
    amount: '$75.00',
    date: 'Jun 4, 2025 10:15 AM',
    timeline: [
      { label: 'Created', detail: 'Transaction initiated by user', done: true },
      { label: 'Payment Requested', detail: 'Payment request sent to gateway', done: true },
      { label: 'Gateway Processing', detail: 'Airtel Money gateway processing', done: true },
      { label: 'Payment Confirmed', detail: 'Awaiting confirmation from gateway', done: false },
      { label: 'Ticket Generated', detail: 'Ticket created and linked', done: false },
      { label: 'QR Sent', detail: 'QR code sent to user', done: false },
      { label: 'Entry Used', detail: 'Ticket validated at gate', done: false },
    ],
    details: {
      user: 'Samuel Okello',
      email: 'samuel.okello@email.com',
      phone: '+256 702 445566',
      amount: '$75.00',
      method: 'Airtel Money',
      status: 'Pending',
      reference: 'AM-1749036314502',
      ip: '105.161.4.78',
      userAgent: 'Chrome / Android',
      processingTime: '—',
    },
  },
  {
    id: 'TXN-987651',
    user: 'Mercy A.',
    amount: '$20.00',
    date: 'Jun 4, 2025 10:10 AM',
    timeline: [
      { label: 'Created', detail: 'Transaction initiated by user', done: true },
      { label: 'Payment Requested', detail: 'Payment request sent to gateway', done: true },
      { label: 'Gateway Processing', detail: 'Mobile Money gateway processing', done: true },
      { label: 'Payment Confirmed', detail: 'Payment declined by gateway', done: false },
      { label: 'Ticket Generated', detail: 'Not generated', done: false },
      { label: 'QR Sent', detail: 'Not sent', done: false },
      { label: 'Entry Used', detail: 'Not used', done: false },
    ],
    details: {
      user: 'Mercy A.',
      email: 'mercy.a@email.com',
      phone: '+256 703 778899',
      amount: '$20.00',
      method: 'Mobile Money',
      status: 'Failed',
      reference: 'MM-1749036018745',
      ip: '102.88.23.201',
      userAgent: 'Chrome / Windows',
      processingTime: '0.6s 402ms',
    },
  },
  {
    id: 'TXN-987650',
    user: 'Brian T.',
    amount: '$150.00',
    date: 'Jun 4, 2025 09:58 AM',
    timeline: [
      { label: 'Created', detail: 'Transaction initiated by user', done: true },
      { label: 'Payment Requested', detail: 'Payment request sent to gateway', done: true },
      { label: 'Gateway Processing', detail: 'Airtel Money gateway processing', done: true },
      { label: 'Payment Confirmed', detail: 'Payment confirmed successfully', done: true },
      { label: 'Ticket Generated', detail: 'Ticket created and linked', done: true },
      { label: 'QR Sent', detail: 'QR code sent to user', done: true },
      { label: 'Entry Used', detail: 'Ticket validated at gate', done: true },
    ],
    details: {
      user: 'Brian T.',
      email: 'brian.t@email.com',
      phone: '+256 704 112233',
      amount: '$150.00',
      method: 'Airtel Money',
      status: 'Success',
      reference: 'AM-1749035298311',
      ip: '105.161.8.34',
      userAgent: 'Chrome / Android',
      processingTime: '1.3s 87ms',
    },
  },
];

const statusClass: Record<TransactionDetails['status'], string> = {
  Success: 'status-success',
  Pending: 'status-pending',
  Failed: 'status-failed',
};

const statusOptions = ['All', 'Success', 'Pending', 'Failed'];

export default function TransactionTrailPage() {
  const [selectedId, setSelectedId] = useState(transactions[0].id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAllTable, setShowAllTable] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatus, setTableStatus] = useState('All');
  const [tableMethod, setTableMethod] = useState('All');

  const selected = transactions.find((t) => t.id === selectedId) ?? transactions[0];

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((txn) => {
      const matchesStatus = statusFilter === 'All' || txn.details.status === statusFilter;
      const matchesSearch =
        query === '' ||
        txn.id.toLowerCase().includes(query) ||
        txn.user.toLowerCase().includes(query) ||
        txn.details.method.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter]);

  const methodOptions = useMemo(() => {
    const unique = Array.from(new Set(transactions.map((t) => t.details.method)));
    return ['All', ...unique];
  }, []);

  const filteredTableRows = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();

    return transactions.filter((txn) => {
      const matchesStatus = tableStatus === 'All' || txn.details.status === tableStatus;
      const matchesMethod = tableMethod === 'All' || txn.details.method === tableMethod;
      const matchesSearch =
        query === '' ||
        txn.id.toLowerCase().includes(query) ||
        txn.user.toLowerCase().includes(query) ||
        txn.details.reference.toLowerCase().includes(query) ||
        txn.details.ip.toLowerCase().includes(query);

      return matchesStatus && matchesMethod && matchesSearch;
    });
  }, [tableSearch, tableStatus, tableMethod]);

  return (
    <main className="super-admin-page finance-child">
      <section className="page-heading">
        <div className="title-group">
          <h1>Transaction Trail Viewer</h1>
          <p>Finance & Security · Transaction Trail</p>
        </div>
        <div className="page-actions">
          <button className="button-secondary">Export</button>
          <button className="button-primary">Search trail</button>
        </div>
      </section>

      <section className="page-grid">
        <article className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-label">Trail overview</div>
              <h2>Transaction trail volume</h2>
            </div>
            <div className="label">Last 6 months</div>
          </div>
          <div className="chart-svg">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trailTrend} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip wrapperStyle={{ backgroundColor: '#09101F', borderRadius: 12, border: '1px solid rgba(148,163,184,0.16)' }} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12, marginBottom: 8 }} />
                <Area type="monotone" dataKey="payment" name="Payments" stroke="#8B5CF6" fill="rgba(124,77,255,0.18)" strokeWidth={3} />
                <Area type="monotone" dataKey="refunds" name="Refunds" stroke="#22C55E" fill="rgba(34,197,94,0.16)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

         <article className="page-panel trail-insights-panel">
        <h2>Trail Insights</h2>
        <div className="insight-row">
        <span className="insight-label">Total Transactions</span>
        <span className="insight-value">3,012</span>
        </div>
        <div className="insight-row">
        <span className="insight-label">Success Rate</span>
        <span className="insight-value insight-success">94.2%</span>
        </div>
        <div className="insight-row">
        <span className="insight-label">Avg. Processing Time</span>
        <span className="insight-value">1.2s</span>
        </div>
        <div className="insight-row">
        <span className="insight-label">Top Gateway</span>
        <span className="insight-value">MTN MOMO</span>
        </div>
        <div className="insight-row">
        <span className="insight-label">Flagged for Review</span>
        <span className="insight-value insight-warning">18</span>
        </div>
    </article>

      </section>

     <section className="trail-explorer">
  <article className="trail-panel trail-list-panel">
    <div className="trail-panel-header">
      <h2>Transactions</h2>
      <button
        type="button"
        className="trail-view-all-btn"
        onClick={() => setShowAllTable((prev) => !prev)}
      >
        {showAllTable ? 'Hide table' : 'View all'}
      </button>
    </div>

    <div className="trail-filters">
      <input
        type="text"
        className="trail-search-input"
        placeholder="Search ID, user, method…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="trail-status-tabs">
        {statusOptions.map((status) => (
          <button
            key={status}
            type="button"
            className={`trail-status-tab ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>
    </div>

    <div className="trail-list">
      {filteredTransactions.length === 0 ? (
        <div className="trail-list-empty">No transactions match your filters.</div>
      ) : (
        filteredTransactions.map((txn) => (
          <button
            key={txn.id}
            type="button"
            className={`trail-list-item ${txn.id === selectedId ? 'active' : ''}`}
            onClick={() => setSelectedId(txn.id)}
          >
            <div className="trail-list-row">
              <span className="trail-list-id">{txn.id}</span>
              <span className="trail-list-amount">{txn.amount}</span>
            </div>
            <div className="trail-list-row">
              <span className="trail-list-user">{txn.user}</span>
              <span className="trail-list-date">{txn.date}</span>
            </div>
          </button>
        ))
      )}
    </div>
  </article>

  <article className="trail-panel trail-timeline-panel">
    <h2>Transaction Timeline</h2>
    <div className="trail-timeline-id">{selected.id}</div>
    <div className="trail-timeline-steps">
      {selected.timeline.map((step, index) => (
        <div className="trail-step" key={`${selected.id}-${index}`}>
          <div className={`trail-step-marker ${step.done ? 'done' : 'pending'}`}>
            {step.done ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M4 12.5l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </div>
          {index < selected.timeline.length - 1 && (
            <div className={`trail-step-line ${step.done ? 'done' : ''}`} />
          )}
          <div className="trail-step-content">
            <p>{step.label}</p>
            <span>{step.detail}</span>
          </div>
        </div>
      ))}
    </div>
  </article>

  <article className="trail-panel trail-details-panel">
    <h2>Details</h2>
    <div className="trail-details-list">
      <div className="trail-detail-row">
        <span className="trail-detail-label">User</span>
        <span className="trail-detail-value">{selected.details.user}</span>
      </div>
      <div className="trail-detail-row">
        <span className="trail-detail-label">Email</span>
        <span className="trail-detail-value">{selected.details.email}</span>
      </div>
      <div className="trail-detail-row">
        <span className="trail-detail-label">Phone</span>
        <span className="trail-detail-value">{selected.details.phone}</span>
      </div>
      <div className="trail-detail-row">
        <span className="trail-detail-label">Amount</span>
        <span className="trail-detail-value">{selected.details.amount}</span>
      </div>
      <div className="trail-detail-row">
        <span className="trail-detail-label">Method</span>
        <span className="trail-detail-value">{selected.details.method}</span>
      </div>
      <div className="trail-detail-row">
        <span className="trail-detail-label">Status</span>
        <span className={`trail-detail-value status-pill ${statusClass[selected.details.status]}`}>
          {selected.details.status}
        </span>
      </div>
      <div className="trail-detail-row">
        <span className="trail-detail-label">Reference</span>
        <span className="trail-detail-value">{selected.details.reference}</span>
      </div>
      <div className="trail-detail-row">
        <span className="trail-detail-label">IP Address</span>
        <span className="trail-detail-value">{selected.details.ip}</span>
      </div>
      <div className="trail-detail-row">
        <span className="trail-detail-label">User Agent</span>
        <span className="trail-detail-value">{selected.details.userAgent}</span>
      </div>
      <div className="trail-detail-row">
        <span className="trail-detail-label">Processing Time</span>
        <span className="trail-detail-value">{selected.details.processingTime}</span>
      </div>
    </div>
    <button className="button-secondary trail-raw-logs-btn">View Raw Logs</button>
  </article>
</section>

{showAllTable && (
  <section className="table-section">
    <div className="table-toolbar">
      <div className="filter-group">
        <div className="filter-item">
          Search
          <input
            type="text"
            placeholder="ID, user, reference, IP…"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
          />
        </div>
        <div className="filter-item">
          Status
          <select value={tableStatus} onChange={(e) => setTableStatus(e.target.value)}>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          Method
          <select value={tableMethod} onChange={(e) => setTableMethod(e.target.value)}>
            {methodOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-actions">
        <button
          className="button-secondary"
          onClick={() => {
            setTableSearch('');
            setTableStatus('All');
            setTableMethod('All');
          }}
        >
          Clear filters
        </button>
      </div>
    </div>

    <div className="table-section-title">All transactions</div>

    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date &amp; Time</th>
            <th>Reference</th>
            <th>IP Address</th>
            <th>User Agent</th>
            <th>Processing Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredTableRows.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--muted)' }}>
                No transactions match the current filters.
              </td>
            </tr>
          ) : (
            filteredTableRows.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.id}</td>
                <td>{txn.details.user}</td>
                <td>{txn.details.amount}</td>
                <td>{txn.details.method}</td>
                <td>
                  <span className={`status-pill ${statusClass[txn.details.status]}`}>
                    {txn.details.status}
                  </span>
                </td>
                <td>{txn.date}</td>
                <td>{txn.details.reference}</td>
                <td>{txn.details.ip}</td>
                <td>{txn.details.userAgent}</td>
                <td>{txn.details.processingTime}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>
)}
    </main>
  );
}