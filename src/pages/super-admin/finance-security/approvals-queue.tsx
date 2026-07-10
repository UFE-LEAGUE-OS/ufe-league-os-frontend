import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import '../../../styles/pages/super-admin/finance-security/SuperAdminFinance.css';
import '../../../styles/pages/super-admin/finance-security/ApprovalsQueue.css';

const approvalsByType = [
  { type: 'Refunds', value: 45 },
  { type: 'Memberships', value: 30 },
  { type: 'Withdrawals', value: 18 },
  { type: 'Sponsors', value: 12 },
];

interface ApprovalItem {
  id: string;
  type: 'Refund' | 'Membership' | 'Withdrawal' | 'Sponsor';
  requestedBy: string;
  amount: string;
  risk: 'Low' | 'Medium' | 'High';
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const allApprovals: ApprovalItem[] = [
  { id: 'APR-10045', type: 'Refund', requestedBy: 'John Doe', amount: '$120.00', risk: 'Low', date: 'Jun 4, 2025', status: 'Pending' },
  { id: 'APR-10044', type: 'Membership', requestedBy: 'Jane Smith', amount: '$59.00', risk: 'Medium', date: 'Jun 4, 2025', status: 'Pending' },
  { id: 'APR-10043', type: 'Withdrawal', requestedBy: 'SC Villa FC', amount: '$2,500.00', risk: 'High', date: 'Jun 4, 2025', status: 'Pending' },
  { id: 'APR-10042', type: 'Refund', requestedBy: 'Brian T.', amount: '$75.00', risk: 'Low', date: 'Jun 3, 2025', status: 'Pending' },
  { id: 'APR-10041', type: 'Sponsor', requestedBy: 'Pepsi Uganda', amount: '$1,200.00', risk: 'Medium', date: 'Jun 3, 2025', status: 'Pending' },
  { id: 'APR-10040', type: 'Membership', requestedBy: 'Mercy A.', amount: '$30.00', risk: 'Low', date: 'Jun 3, 2025', status: 'Pending' },
];

const riskClass: Record<ApprovalItem['risk'], string> = {
  Low: 'risk-low',
  Medium: 'risk-medium',
  High: 'risk-high',
};

interface TabDef {
  key: string;
  label: string;
  match: (t: ApprovalItem) => boolean;
}

const tabs: TabDef[] = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'refunds', label: 'Refunds', match: (t) => t.type === 'Refund' },
  { key: 'memberships', label: 'Memberships', match: (t) => t.type === 'Membership' },
  { key: 'withdrawals', label: 'Withdrawals', match: (t) => t.type === 'Withdrawal' },
  { key: 'sponsors', label: 'Sponsors', match: (t) => t.type === 'Sponsor' },
  { key: 'highrisk', label: 'High Risk', match: (t) => t.risk === 'High' },
];

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5h16M7 12h10M10 19h4" strokeLinecap="round" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12M7 8l5-5 5 5M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M4 12.5l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RejectIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function ApprovalsQueuePage() {
  const [activeTab, setActiveTab] = useState('all');
  const activeTabDef = tabs.find((t) => t.key === activeTab) ?? tabs[0];
  const filteredApprovals = allApprovals.filter(activeTabDef.match);

  return (
    <main className="super-admin-page finance-child">
      <section className="page-heading">
        <div className="title-group">
          <h1>Approvals Monitor Queue</h1>
          <p>Finance & Security · Approvals Queue</p>
        </div>
        <div className="page-actions">
          <button className="button-secondary">Filter</button>
          <button className="button-primary">Review selected</button>
        </div>
      </section>

      <section className="top-stats-grid">
        <article className="metric-card accent-green">
          <div className="metric-label">Pending Refunds</div>
          <div className="metric-value">12</div>
          <div className="metric-delta positive">+2</div>
        </article>
        <article className="metric-card accent-amber">
          <div className="metric-label">Pending Memberships</div>
          <div className="metric-value">18</div>
          <div className="metric-delta positive">+5</div>
        </article>
        <article className="metric-card accent-orange">
          <div className="metric-label">Club Withdrawals</div>
          <div className="metric-value">7</div>
          <div className="metric-delta positive">+1</div>
        </article>
        <article className="metric-card accent-purple">
          <div className="metric-label">Sponsor Activations</div>
          <div className="metric-value">5</div>
          <div className="metric-delta positive">+1</div>
        </article>
        <article className="metric-card accent-red">
          <div className="metric-label">High Risk Reviews</div>
          <div className="metric-value">3</div>
          <div className="metric-delta negative">-0</div>
        </article>
      </section>

      <section className="chart-grid">
        <article className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-label">Approval composition</div>
              <h2>Queue by type</h2>
            </div>
            <div className="label">This month</div>
          </div>
          <div className="chart-svg">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={approvalsByType} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="type" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip wrapperStyle={{ backgroundColor: '#09101F', borderRadius: 12, border: '1px solid rgba(148,163,184,0.16)' }} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12, marginBottom: 8 }} />
                <Bar dataKey="value" name="Queue Size" fill="#8B5CF6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="page-panel approval-insights-panel">
          <h2>Approval Insights</h2>
          <div className="insight-row">
            <span className="insight-label">Avg. Approval Time</span>
            <span className="insight-value">4.2 hrs</span>
          </div>
          <div className="insight-row">
            <span className="insight-label">Auto-Approved Today</span>
            <span className="insight-value">27</span>
          </div>
          <div className="insight-row">
            <span className="insight-label">Escalation Rate</span>
            <span className="insight-value insight-warning">6.4%</span>
          </div>
          <div className="insight-row">
            <span className="insight-label">Oldest Pending Item</span>
            <span className="insight-value">2 days</span>
          </div>
          <div className="insight-row">
            <span className="insight-label">Top Approver</span>
            <span className="insight-value">Finance Team</span>
          </div>
        </article>
      </section>

      <section className="table-section approvals-queue-section">
        <div className="approvals-tabs-bar">
          <div className="approvals-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`approvals-tab ${tab.key === activeTab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} ({allApprovals.filter(tab.match).length})
              </button>
            ))}
          </div>
          <div className="table-actions">
            <button className="button-secondary">
              <FilterIcon /> Filters
            </button>
            <button className="button-primary">
              <ExportIcon /> Export
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="approvals-queue-table">
            <thead>
              <tr>
                <th>Approval ID</th>
                <th>Type</th>
                <th>Requested By</th>
                <th>Amount</th>
                <th>Risk Score</th>
                <th>Date</th>
                <th>Status</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovals.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.type}</td>
                  <td>{item.requestedBy}</td>
                  <td>{item.amount}</td>
                  <td>
                    <span className={`risk-pill ${riskClass[item.risk]}`}>
                      <span className="risk-dot" />
                      {item.risk}
                    </span>
                  </td>
                  <td>{item.date}</td>
                  <td>
                    <span className="status-outline-pill">{item.status}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn icon-btn-approve" aria-label={`Approve ${item.id}`}>
                        <CheckIcon />
                      </button>
                      <button className="icon-btn icon-btn-reject" aria-label={`Reject ${item.id}`}>
                        <RejectIcon />
                      </button>
                      <button className="icon-btn" aria-label={`View ${item.id}`}>
                        <EyeIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
