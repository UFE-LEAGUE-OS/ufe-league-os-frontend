
import { useMemo, useState } from "react";
import "../../../styles/pages/super-admin/sponsorship-management/sponsorshipManagement.css";

type Sport = "All Sports" | "Football" | "Basketball" | "Rugby";

interface CampaignMetrics {
    id: number;
    campaignName: string;
    sport: Exclude<Sport, "All Sports">;
    sponsor: string;
    views: number;
    clicks: number;
    engagement: number; // percentage 0-100
    status: "Active" | "Paused" | "Completed";
}

const SPORTS: Sport[] = ["All Sports", "Football", "Basketball", "Rugby"];

const CAMPAIGNS: CampaignMetrics[] = [
    { id: 1, campaignName: "MTN Season Campaign", sport: "Football", sponsor: "MTN Uganda", views: 250000, clicks: 45000, engagement: 87 ,    status: "Active"},
    { id: 2, campaignName: "Airtel Matchday Takeover", sport: "Basketball", sponsor: "Airtel Africa", views: 132000, clicks: 21500, engagement: 74 ,    status: "Active"},
    { id: 3, campaignName: "Coca-Cola Premium Banner", sport: "Rugby", sponsor: "Coca-Cola", views: 68000, clicks: 9200, engagement: 61,    status: "Active" },
    { id: 4, campaignName: "MTN Cranes Nation Push", sport: "Football", sponsor: "MTN Uganda", views: 184000, clicks: 30200, engagement: 79,    status: "Active" },
];

const formatCompact = (value: number) =>
    value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K` : String(value);

export default function CampaignPerformance() {

    const [sportFilter, setSportFilter] = useState<Sport>("All Sports");

    const filteredCampaigns = useMemo(() => {
        if (sportFilter === "All Sports") return CAMPAIGNS;
        return CAMPAIGNS.filter(c => c.sport === sportFilter);
    }, [sportFilter]);

    const totals = useMemo(() => {
        const views = filteredCampaigns.reduce((sum, c) => sum + c.views, 0);
        const clicks = filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0);
        const avgEngagement = filteredCampaigns.length
            ? Math.round(filteredCampaigns.reduce((sum, c) => sum + c.engagement, 0) / filteredCampaigns.length)
            : 0;
        const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";
        return { views, clicks, avgEngagement, ctr };
    }, [filteredCampaigns]);

    const maxViews = useMemo(
        () => Math.max(...filteredCampaigns.map(c => c.views), 1),
        [filteredCampaigns]
    );

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <span className="page-eyebrow">Sponsorship Management</span>
                    <h1>Campaign Performance</h1>
                    <p>Measure how sponsor campaigns are performing across the platform.</p>
                </div>
            </div>

            <div className="field-group sport-select-group">
                <label>Sport</label>
                <div className="segmented">
                    {SPORTS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className={`segmented__option ${sportFilter === option ? "is-active" : ""}`}
                            onClick={() => setSportFilter(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon--total">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">Views</span>
                        <span className="stat-value">{formatCompact(totals.views)}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon--active">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m9 9 6 3-6 3V9Z" />
                            <circle cx="12" cy="12" r="9" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">Clicks</span>
                        <span className="stat-value">{formatCompact(totals.clicks)}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon--draft">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3v18h18" />
                            <path d="M7 15l4-4 3 3 5-6" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">Click-Through Rate</span>
                        <span className="stat-value">{totals.ctr}%</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon--value">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2a10 10 0 1 0 10 10" />
                            <path d="M12 2v10l7 3" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">Avg. Engagement</span>
                        <span className="stat-value">{totals.avgEngagement}%</span>
                    </div>
                </div>
            </div>

            <div className="card chart-card">
                <div className="card-header">
                    <h2>Views by Campaign</h2>
                    <p>Comparing total impressions across active campaigns.</p>
                </div>

                <div className="bar-chart">
                    {filteredCampaigns.map((c) => (
                        <div className="bar-row" key={c.id}>
                            <span className="bar-row__label">{c.campaignName}</span>
                            <div className="bar-row__track">
                                <div
                                    className="bar-row__fill"
                                    style={{ width: `${(c.views / maxViews) * 100}%` }}
                                />
                            </div>
                            <span className="bar-row__value">{formatCompact(c.views)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="table-card">
                <div className="table-card__header">
                    <h2>Campaign Breakdown</h2>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Campaign</th>
                            <th>Sport</th>
                            <th>Views</th>
                            <th>Clicks</th>
                            <th>CTR</th>
                            <th>Engagement</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredCampaigns.map((c) => (
                            <tr key={c.id}>
                                <td>
                                    <div className="package-cell__text">
                                        <span className="package-name">
                                            {c.campaignName}
                                        </span>
                                        <span className="package-sponsor">
                                            {c.sponsor}
                                        </span>
                                    </div>
                                </td>

                                <td>
                                    <span className="sport-tag">
                                        {c.sport}
                                    </span>
                                </td>

                                <td>
                                    {formatCompact(c.views)}
                                </td>

                                <td>
                                    {formatCompact(c.clicks)}
                                </td>

                                <td>
                                    {((c.clicks / c.views) * 100).toFixed(1)}%
                                </td>

                                <td>
                                    <div className="engagement-cell">
                                        <div className="engagement-track">
                                            <div
                                                className="engagement-fill"
                                                style={{ width: `${c.engagement}%` }}
                                            />
                                        </div>

                                        <span>
                                            {c.engagement}%
                                        </span>
                                    </div>
                                </td>

                                <td>
                                    <span className={`badge badge--${c.status.toLowerCase()}`}>
                                        <span className="badge-dot" />
                                        {c.status}
                                    </span>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
