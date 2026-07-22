import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  getSponsorAccounts,
  getSponsorAgreements,
  type SponsorAgreement,
  type SponsorWorkflowEvent,
} from '../../services/sponsorshipService';
import './SponsorAuditLog.css';

interface AuditRow extends SponsorWorkflowEvent {
  agreementReference: string;
}

function downloadCsv(rows: string[][], headers: string[], filename: string) {
  const escapeCell = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];

  const blob = new Blob([csvLines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export default function SponsorAuditLog() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const accountsResponse = await getSponsorAccounts();
        const accounts = accountsResponse.data.results;

        if (accounts.length === 0) {
          if (active) {
            setRows([]);
          }
          return;
        }

        const agreementsByAccount = await Promise.all(
          accounts.map((account) =>
            getSponsorAgreements({ sponsor_account: account.id }),
          ),
        );

        const agreements: SponsorAgreement[] = agreementsByAccount.flatMap(
          (response) => response.data.results,
        );

        const events: AuditRow[] = agreements
          .flatMap((agreement) =>
            agreement.workflow_events.map((event) => ({
              ...event,
              agreementReference: agreement.reference,
            })),
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );

        if (active) {
          setRows(events);
        }
      } catch {
        if (active) {
          setError('We could not load the audit log.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const eventTypeOptions = useMemo(() => {
    const unique = Array.from(
      new Set(rows.map((row) => row.event_type_display)),
    );
    return ['All', ...unique];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = [
        row.event_type_display,
        row.from_status,
        row.to_status,
        row.note,
        row.actor_email ?? '',
        row.agreementReference,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesEventType =
        eventTypeFilter === 'All' ||
        row.event_type_display === eventTypeFilter;

      const rowDate = row.created_at.slice(0, 10);
      const matchesFrom = !fromDate || rowDate >= fromDate;
      const matchesTo = !toDate || rowDate <= toDate;

      return matchesSearch && matchesEventType && matchesFrom && matchesTo;
    });
  }, [rows, search, eventTypeFilter, fromDate, toDate]);

  const handleExportCsv = () => {
    const exportRows = filteredRows.map((row) => [
      formatTimestamp(row.created_at),
      row.event_type_display,
      row.from_status,
      row.to_status,
      row.agreementReference,
      row.actor_email ?? 'System',
      row.note,
    ]);

    downloadCsv(
      exportRows,
      ['Date & Time', 'Event', 'From', 'To', 'Agreement', 'Actor', 'Note'],
      `sponsor-audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const clearFilters = () => {
    setSearch('');
    setEventTypeFilter('All');
    setFromDate('');
    setToDate('');
  };

  const hasActiveFilters =
    search !== '' ||
    eventTypeFilter !== 'All' ||
    fromDate !== '' ||
    toDate !== '';

  return (
    <div className="sal-page">
      <div className="sal-layout">
        <SponsorSidebar />

        <main className="sal-main">
          <header className="sal-header">
            <div>
              <span>Account activity</span>
              <h1>Audit Log</h1>
              <p>
                An append-only record of status changes across your
                sponsorship agreements — approvals, payments and account
                changes.
              </p>
            </div>
          </header>

          {loading && (
            <div className="sal-state">
              <FiRefreshCw className="sal-spin" size={28} />
              <h2>Loading audit log</h2>
            </div>
          )}

          {!loading && error && (
            <div className="sal-state">
              <FiAlertCircle size={28} />
              <h2>Audit log unavailable</h2>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="sal-toolbar">
                <input
                  type="text"
                  placeholder="Search audit log..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <select
                  value={eventTypeFilter}
                  onChange={(event) =>
                    setEventTypeFilter(event.target.value)
                  }
                  aria-label="Filter by event type"
                >
                  {eventTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'All' ? 'All Events' : option}
                    </option>
                  ))}
                </select>

                <label>
                  From
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                  />
                </label>

                <label>
                  To
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                  />
                </label>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="sal-clear-btn"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={filteredRows.length === 0}
                >
                  Export CSV
                </button>
              </div>

              <div className="sal-table-container">
                <table className="sal-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Event</th>
                      <th>From → To</th>
                      <th>Agreement</th>
                      <th>Actor</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td>{formatTimestamp(row.created_at)}</td>
                        <td>{row.event_type_display}</td>
                        <td>
                          {row.from_status || '—'} → {row.to_status || '—'}
                        </td>
                        <td>{row.agreementReference}</td>
                        <td>{row.actor_email ?? 'System'}</td>
                        <td>{row.note || '—'}</td>
                      </tr>
                    ))}

                    {filteredRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="sal-empty">
                          No audit log entries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
