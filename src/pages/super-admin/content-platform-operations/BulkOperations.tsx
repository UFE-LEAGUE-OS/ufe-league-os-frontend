import { useState, useRef, type DragEvent } from 'react';
import { Download, UploadCloud } from 'lucide-react';
import FilterDropdown from '../../../components/FilterDropdown';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';

const tabs = ['Users', 'Content', 'Notifications', 'Transactions'] as const;
type Tab = typeof tabs[number];

type JobStatus = 'Completed' | 'Failed' | 'Processing';

type Job = {
  id: string;
  name: string;
  type: Tab;
  status: JobStatus;
  records: number;
  created: string;
};

const OPERATIONS_BY_TAB: Record<Tab, string[]> = {
  Users: ['Disable Users', 'Enable Users', 'Update User Roles', 'Delete Users', 'Export User List'],
  Content: ['Publish Articles', 'Unpublish Articles', 'Archive Content', 'Delete Content'],
  Notifications: ['Send Email', 'Send Push Notification', 'Send SMS'],
  Transactions: ['Refund Payments', 'Mark as Reconciled', 'Export Transactions', 'Flag for Review'],
};

const INITIAL_JOBS: Job[] = [
  { id: 'j1', name: 'Disable Inactive Users', type: 'Users', status: 'Completed', records: 1250, created: 'May 13, 2024' },
  { id: 'j2', name: 'Update User Roles', type: 'Users', status: 'Completed', records: 900, created: 'May 12, 2024' },
  { id: 'j3', name: 'Publish Articles', type: 'Content', status: 'Completed', records: 45, created: 'May 11, 2024' },
  { id: 'j4', name: 'Send Email (May Update)', type: 'Notifications', status: 'Completed', records: 24560, created: 'May 10, 2024' },
  { id: 'j5', name: 'Refund Failed Payments', type: 'Transactions', status: 'Failed', records: 32, created: 'May 9, 2024' },
];

function statusBadge(status: JobStatus) {
  if (status === 'Completed') return <span className="badge badge-green">Completed</span>;
  if (status === 'Processing') return <span className="badge badge-blue">Processing</span>;
  return <span className="badge badge-red">Failed</span>;
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BulkOperations() {
  const [tab, setTab] = useState<Tab>('Users');
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);

  const [operation, setOperation] = useState('Select operation');
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewChanges, setPreviewChanges] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [viewAll, setViewAll] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function switchTab(next: Tab) {
    setTab(next);
    setOperation('Select operation');
    setFileName(null);
    setPreviewChanges(false);
  }

  function handleFile(file: File | null) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Please upload a CSV file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File exceeds 10MB limit');
      return;
    }
    setFileName(file.name);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  function handleDownloadTemplate() {
    showToast(`${tab} CSV template downloaded`);
  }

  function handleApply() {
    if (operation === 'Select operation') {
      showToast('Choose an operation first');
      return;
    }
    if (!fileName) {
      showToast('Upload a CSV file first');
      return;
    }

    const newJob: Job = {
      id: `job-${Date.now()}`,
      name: operation,
      type: tab,
      status: previewChanges ? 'Processing' : 'Completed',
      records: Math.floor(Math.random() * 900) + 50,
      created: formatToday(),
    };

    setJobs((prev) => [newJob, ...prev]);
    showToast(previewChanges ? 'Preview generated' : 'Operation applied');
    setFileName(null);
    setOperation('Select operation');
    setPreviewChanges(false);
  }

  const visibleJobs = viewAll ? jobs : jobs.slice(0, 5);

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <h1>Bulk Operations</h1>
          <p className="panel-subtext" style={{ margin: '4px 0 0' }}>
            Perform actions on multiple records quickly and safely.
          </p>
        </div>
        <div className="page-actions">
          {toast && (
            <span
              style={{
                fontSize: 12.5,
                color: '#A78BFA',
                background: 'rgba(139, 92, 246, 0.12)',
                padding: '6px 12px',
                borderRadius: 999,
              }}
            >
              {toast}
            </span>
          )}
        </div>
      </section>

      <div className="content-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            className={`content-tab ${tab === t ? 'active' : ''}`}
            onClick={() => switchTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="content-editor-panel">
        <div className="panel-card-header">
          <h3>Upload File</h3>
          <button className="button-secondary" onClick={handleDownloadTemplate}>
            Download CSV Template
          </button>
        </div>

        <div
          className="drop-zone"
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            cursor: 'pointer',
            borderColor: dragActive ? 'rgba(139, 92, 246, 0.5)' : undefined,
            background: dragActive ? 'rgba(139, 92, 246, 0.05)' : undefined,
          }}
        >
          <UploadCloud size={22} style={{ color: 'var(--muted)' }} />
          {fileName ? (
            <strong>{fileName}</strong>
          ) : (
            <span>
              Drag and drop your CSV file here, or click to{' '}
              <span className="link-inline" style={{ display: 'inline' }}>browse</span>
            </span>
          )}
          <span>CSV up to 10MB</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="field-group">
          <label>Operation</label>
          <FilterDropdown
            value={operation}
            options={['Select operation', ...OPERATIONS_BY_TAB[tab]]}
            onChange={setOperation}
          />
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={previewChanges}
            onChange={(e) => setPreviewChanges(e.target.checked)}
          />
          Preview changes before applying
        </label>

        <div className="content-footer-actions">
          <button className="button-primary" onClick={handleApply}>
            {previewChanges ? 'Preview Changes' : 'Apply Operation'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          Recent Jobs
        </h3>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Records</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.name}</td>
                  <td className="cell-muted">{job.type}</td>
                  <td>{statusBadge(job.status)}</td>
                  <td className="cell-muted">{job.records.toLocaleString()}</td>
                  <td className="cell-muted">{job.created}</td>
                  <td>
                    <button
                      className="icon-btn"
                      aria-label="Download job report"
                      onClick={() => showToast(`Downloading report for "${job.name}"`)}
                    >
                      <Download size={13} />
                    </button>
                  </td>
                </tr>
              ))}

              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="cell-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                    No jobs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="table-pagination">
            <span>All times shown in (UTC+00:00) UTC</span>
            {jobs.length > 5 && (
              <button
                className="button-secondary"
                style={{ width: 'auto' }}
                onClick={() => setViewAll((prev) => !prev)}
              >
                {viewAll ? 'Show Less' : 'View All Jobs'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}