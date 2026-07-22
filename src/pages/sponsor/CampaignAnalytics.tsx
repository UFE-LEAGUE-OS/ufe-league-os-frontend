import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiRefreshCw,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  getSponsorAccounts,
  getSponsorAgreements,
  type SponsorAgreement,
} from '../../services/sponsorshipService';
import './CampaignAnalytics.css';

function amount(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function money(value: number) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(value);
}

function downloadCsv(
  rows: string[][],
  headers: string[],
  filename: string,
) {
  const escapeCell = (value: string) => {
    if (
      value.includes(',') ||
      value.includes('"') ||
      value.includes('\n')
    ) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      row.map(escapeCell).join(','),
    ),
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

export default function CampaignAnalytics() {
  const [agreements, setAgreements] =
    useState<SponsorAgreement[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState('');
  const [fromDate, setFromDate] =
    useState('');
  const [toDate, setToDate] =
    useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const accountsResponse =
          await getSponsorAccounts();

        const account =
          accountsResponse.data
            .results[0];

        if (!account) {
          if (active) {
            setAgreements([]);
          }
          return;
        }

        const agreementsResponse =
          await getSponsorAgreements({
            sponsor_account:
              account.id,
          });

        if (active) {
          setAgreements(
            agreementsResponse.data
              .results,
          );
        }
      } catch {
        if (active) {
          setError(
            'We could not load sponsorship performance.',
          );
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

  const metrics = useMemo(() => {
    const agreementValue =
      agreements.reduce(
        (total, agreement) =>
          total +
          amount(
            agreement.total_value,
          ),
        0,
      );

    const paid = agreements.reduce(
      (total, agreement) =>
        total +
        agreement.payments
          .filter(
            (payment) =>
              payment.status ===
              'CONFIRMED',
          )
          .reduce(
            (paymentTotal, payment) =>
              paymentTotal +
              amount(
                payment.amount_paid,
              ),
            0,
          ),
      0,
    );

    const benefits = agreements.reduce(
      (total, agreement) =>
        total +
        agreement
          .sponsor_package_detail
          .benefits.length,
      0,
    );

    const ticketAllocation =
      agreements.reduce(
        (total, agreement) =>
          total +
          agreement
            .sponsor_package_detail
            .benefits
            .filter((benefit) =>
              [
                'FREE_TICKETS',
                'VIP_ACCESS',
                'RESERVED_SEATING',
              ].includes(
                benefit.benefit_type,
              ),
            )
            .reduce(
              (quantity, benefit) =>
                quantity +
                benefit.quantity,
              0,
            ),
        0,
      );

    return {
      active: agreements.filter(
        (agreement) =>
          agreement.status ===
          'ACTIVE',
      ).length,
      agreementValue,
      paid,
      outstanding: Math.max(
        agreementValue - paid,
        0,
      ),
      benefits,
      ticketAllocation,
    };
  }, [agreements]);

  const exportableAgreements = useMemo(() => {
    return agreements.filter((agreement) => {
      const createdAt = agreement.created_at.slice(0, 10);
      if (fromDate && createdAt < fromDate) {
        return false;
      }
      if (toDate && createdAt > toDate) {
        return false;
      }
      return true;
    });
  }, [agreements, fromDate, toDate]);

  const handleExportCsv = () => {
    const rows = exportableAgreements.map((agreement) => {
      const paidForAgreement = agreement.payments
        .filter((payment) => payment.status === 'CONFIRMED')
        .reduce(
          (total, payment) => total + amount(payment.amount_paid),
          0,
        );

      return [
        agreement.reference,
        agreement.sponsor_package_detail.name,
        agreement.status_display,
        agreement.currency,
        agreement.total_value,
        paidForAgreement.toString(),
        agreement.created_at.slice(0, 10),
      ];
    });

    downloadCsv(
      rows,
      [
        'Reference',
        'Package',
        'Status',
        'Currency',
        'Total Value',
        'Confirmed Paid',
        'Created',
      ],
      `sponsorship-performance-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  return (
    <div className="ca-page">
      <div className="ca-layout">
        <SponsorSidebar />

        <main className="ca-main">
          <header className="ca-header">
            <div>
              <span>
                Platform-measured reporting
              </span>
              <h1>
                Sponsorship Performance
              </h1>
              <p>
                Financial progress,
                agreement status and
                benefits that League OS
                can verify directly.
              </p>
            </div>
          </header>

          {!loading && !error && (
            <div className="ca-export-toolbar">
              <label>
                From
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) =>
                    setFromDate(event.target.value)
                  }
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) =>
                    setToDate(event.target.value)
                  }
                />
              </label>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={
                  exportableAgreements.length === 0
                }
              >
                Export CSV
              </button>
            </div>
          )}

          {loading && (
            <div className="ca-state">
              <FiRefreshCw
                className="ca-spin"
                size={28}
              />
              <h2>
                Loading performance
              </h2>
            </div>
          )}

          {!loading && error && (
            <div className="ca-state">
              <FiAlertCircle
                size={28}
              />
              <h2>
                Performance unavailable
              </h2>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <section className="ca-stats">
                <article>
                  <FiFileText size={20} />
                  <span>
                    Active agreements
                  </span>
                  <strong>
                    {metrics.active}
                  </strong>
                </article>

                <article>
                  <FiCreditCard
                    size={20}
                  />
                  <span>
                    Agreement value
                  </span>
                  <strong>
                    {money(
                      metrics.agreementValue,
                    )}
                  </strong>
                </article>

                <article>
                  <FiCheckCircle
                    size={20}
                  />
                  <span>
                    Confirmed payments
                  </span>
                  <strong>
                    {money(metrics.paid)}
                  </strong>
                </article>

                <article>
                  <FiClock size={20} />
                  <span>
                    Outstanding
                  </span>
                  <strong>
                    {money(
                      metrics.outstanding,
                    )}
                  </strong>
                </article>
              </section>

              <section className="ca-grid">
                <article className="ca-card">
                  <h2>
                    Benefit Delivery
                  </h2>

                  <div className="ca-row">
                    <span>
                      Benefits promised
                    </span>
                    <strong>
                      {metrics.benefits}
                    </strong>
                  </div>

                  <div className="ca-row">
                    <span>
                      Tickets and hospitality
                      allocated
                    </span>
                    <strong>
                      {
                        metrics.ticketAllocation
                      }
                    </strong>
                  </div>

                  <p>
                    Benefit-completion records
                    will appear after property
                    administrators confirm each
                    delivery item.
                  </p>
                </article>
              </section>

              <section className="ca-external">
                <FiAlertCircle
                  size={19}
                />

                <div>
                  <h2>
                    External social metrics
                  </h2>

                  <p>
                    Facebook, Instagram,
                    YouTube, TikTok and X
                    figures are not presented
                    as League OS-measured data.
                    They may be added later as
                    externally reported metrics
                    or through verified API
                    integrations.
                  </p>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
