import { useEffect, useMemo, useState } from 'react';
import '../../../styles/pages/super-admin/sponsorship-management/sponsorshipManagement.css';
import {
  getPendingSponsorCampaignAssets,
  reviewSponsorCampaignAsset,
  type SponsorCampaignAssetApprovalStatus,
  type SponsorCampaignAssetWithCampaign,
} from '../../../services/sponsorCampaignService';

<<<<<<< HEAD
import { useState } from "react";

type ApprovalStatus = "Pending" | "Approved" | "Rejected";

interface CampaignApproval {
    id: number;
    campaign: string;
    sponsor: string;
    sport: "Football" | "Basketball" | "Rugby";
    submitted: string;
    status: ApprovalStatus;
}
export default function ApprovalWorkflow() {

    const [approvals, setApprovals] = useState<CampaignApproval[]>([
        {
            id: 1,
            campaign: "MTN Football Campaign",
            sponsor: "MTN Uganda",
            sport: "Football",
            submitted: "Jul 20, 2026",
            status: "Pending",
        }
    ]);

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [selectedViewCampaign, setSelectedViewCampaign] = useState<CampaignApproval | null>(null);


    const updateStatus = (
        id: number,
        status: ApprovalStatus
    ) => {

        setApprovals(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, status }
                    : item
            )
        );

    };
    const openRejectModal = (id: number) => {
        setSelectedCampaign(id);
        setShowRejectModal(true);
    };

    const viewCampaign = (campaign: CampaignApproval) => {
        setSelectedViewCampaign(campaign);
    };


    const confirmReject = () => {

        if (!selectedCampaign || !rejectReason.trim()) {
            alert("Please enter a rejection reason");
            return;
        }

        setApprovals(prev =>
            prev.map(item =>
                item.id === selectedCampaign
                    ? {
                        ...item,
                        status: "Rejected"
                    }
                    : item
            )
        );

        setShowRejectModal(false);
        setRejectReason("");
        setSelectedCampaign(null);
    };


    return (

        <div className="page-container">

            <div className="page-header">
                <div>
                    <span className="page-eyebrow">
                        Sponsorship Management
                    </span>

                    <h1>
                        Approval Workflow
                    </h1>

                    <p>
                        Review and approve sponsor campaigns before activation.
                    </p>
                </div>
            </div>

            <div className="stats-grid">

                <div className="stat-card">
                    <span className="stat-label">
                        Pending Reviews
                    </span>

                    <span className="stat-value">
                        {approvals.filter(item => item.status === "Pending").length}
                    </span>
                </div>


                <div className="stat-card">
                    <span className="stat-label">
                        Approved Campaigns
                    </span>

                    <span className="stat-value">
                        {approvals.filter(item => item.status === "Approved").length}
                    </span>
                </div>


                <div className="stat-card">
                    <span className="stat-label">
                        Rejected Campaigns
                    </span>

                    <span className="stat-value">
                        {approvals.filter(item => item.status === "Rejected").length}
                    </span>
                </div>

            </div>


            <div className="table-card">

                <div className="table-card__header">
                    <h2>
                        Campaign Approvals
                    </h2>
                </div>


                <table>

                    <thead>
                        <tr>
                            <th>
                                Campaign
                            </th>

                            <th>
                                Sponsor
                            </th>

                            <th>
                                Sport
                            </th>

                            <th>
                                Submitted
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Actions
                            </th>
                        </tr>
                    </thead>


                    <tbody>

                        {approvals.map((item) => (

                            <tr key={item.id}>

                                <td>
                                    <div className="package-cell__text">
                                        <span className="package-name">
                                            {item.campaign}
                                        </span>
                                    </div>
                                </td>


                                <td>
                                    {item.sponsor}
                                </td>


                                <td>
                                    <span className="sport-tag">
                                        {item.sport}
                                    </span>
                                </td>


                                <td>
                                    {item.submitted}
                                </td>


                                <td>

                                    <span className={`badge badge--${item.status.toLowerCase()}`}>
                                        <span className="badge-dot" />
                                        {item.status}
                                    </span>

                                </td>


                                <td>

                                    <div className="action-buttons">

                                        <button
                                            className="view"
                                            onClick={() => viewCampaign(item)}
                                        >
                                            View
                                        </button>


                                        {
                                            item.status === "Pending" && (

                                                <>
                                                    <button
                                                        className="approve"
                                                        onClick={() =>
                                                            updateStatus(
                                                                item.id,
                                                                "Approved"
                                                            )
                                                        }
                                                    >
                                                        Approve
                                                    </button>


                                                    <button
                                                        className="reject"
                                                        onClick={() => openRejectModal(item.id)}
                                                    >
                                                        Reject
                                                    </button>
                                                </>

                                            )
                                        }

                                    </div>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h4>Reject Campaign</h4>

                        <textarea
                            placeholder="Enter rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />

                        <div>
                            <button
                                className="secondary-btn"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason("");
                                    setSelectedCampaign(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="reject-confirm-btn"
                                onClick={confirmReject}
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedViewCampaign && (
                <div className="modal-overlay">

                    <div className="modal">

                        <h3>Campaign Details</h3>

                        <p>
                            <strong>Campaign:</strong>{" "}
                            {selectedViewCampaign.campaign}
                        </p>

                        <p>
                            <strong>Sponsor:</strong>{" "}
                            {selectedViewCampaign.sponsor}
                        </p>

                        <p>
                            <strong>Sport:</strong>{" "}
                            {selectedViewCampaign.sport}
                        </p>

                        <p>
                            <strong>Submitted:</strong>{" "}
                            {selectedViewCampaign.submitted}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {selectedViewCampaign.status}
                        </p>


                        <div className="modal-actions">

                            <button
                                className="secondary-btn"
                                onClick={() => setSelectedViewCampaign(null)}
                            >
                                Close
                            </button>

                            {selectedViewCampaign.status === "Pending" && (
                                <>
                                    <button
                                        className="approve"
                                        onClick={() => {
                                            updateStatus(
                                                selectedViewCampaign.id,
                                                "Approved"
                                            );
                                            setSelectedViewCampaign(null);
                                        }}
                                    >
                                        Approve
                                    </button>


                                    <button
                                        className="reject"
                                        onClick={() => {
                                            openRejectModal(
                                                selectedViewCampaign.id
                                            );
                                            setSelectedViewCampaign(null);
                                        }}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                        </div>

                    </div>

                </div>
            )}

        </div>

    )
=======
type StatusFilter = 'ALL' | SponsorCampaignAssetApprovalStatus;

export default function ApprovalWorkflow() {
  const [assets, setAssets] = useState<SponsorCampaignAssetWithCampaign[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

  const [busyAssetId, setBusyAssetId] = useState<number | null>(null);
  const [rejectingAsset, setRejectingAsset] =
    useState<SponsorCampaignAssetWithCampaign | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await getPendingSponsorCampaignAssets();
        if (active) {
          setAssets(response.data.results);
        }
      } catch {
        if (active) {
          setError('We could not load pending campaign assets.');
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

  const counts = useMemo(
    () => ({
      pending: assets.filter((a) => a.approval_status === 'pending').length,
      approved: assets.filter((a) => a.approval_status === 'approved')
        .length,
      rejected: assets.filter((a) => a.approval_status === 'rejected')
        .length,
    }),
    [assets],
  );

  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesStatus =
        statusFilter === 'ALL' || asset.approval_status === statusFilter;

      const matchesSearch =
        !normalizedSearch ||
        asset.file_name.toLowerCase().includes(normalizedSearch) ||
        asset.campaign_name.toLowerCase().includes(normalizedSearch) ||
        asset.sponsor_account_name.toLowerCase().includes(normalizedSearch);
>>>>>>> origin/development

      return matchesStatus && matchesSearch;
    });
  }, [assets, statusFilter, search]);

  async function handleApprove(asset: SponsorCampaignAssetWithCampaign) {
    setBusyAssetId(asset.id);
    setActionError('');

    try {
      await reviewSponsorCampaignAsset(asset.campaign_id, asset.id, {
        approval_status: 'approved',
      });

      setAssets((prev) =>
        prev.map((item) =>
          item.id === asset.id
            ? { ...item, approval_status: 'approved', rejection_reason: null }
            : item,
        ),
      );
    } catch {
      setActionError('We could not approve this asset. Please try again.');
    } finally {
      setBusyAssetId(null);
    }
  }

  function openRejectPrompt(asset: SponsorCampaignAssetWithCampaign) {
    setRejectingAsset(asset);
    setRejectionReason('');
    setActionError('');
  }

  async function handleReject() {
    if (!rejectingAsset) return;

    if (!rejectionReason.trim()) {
      setActionError('Enter a reason before rejecting this asset.');
      return;
    }

    setBusyAssetId(rejectingAsset.id);
    setActionError('');

    try {
      await reviewSponsorCampaignAsset(
        rejectingAsset.campaign_id,
        rejectingAsset.id,
        {
          approval_status: 'rejected',
          rejection_reason: rejectionReason.trim(),
        },
      );

      setAssets((prev) =>
        prev.map((item) =>
          item.id === rejectingAsset.id
            ? {
                ...item,
                approval_status: 'rejected',
                rejection_reason: rejectionReason.trim(),
              }
            : item,
        ),
      );
      setRejectingAsset(null);
    } catch {
      setActionError('We could not reject this asset. Please try again.');
    } finally {
      setBusyAssetId(null);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Campaign Asset Approvals</h1>
          <p>
            Review creative assets sponsors have uploaded to their campaigns
            before they go live.
          </p>
        </div>
      </div>

      {loading && <p>Loading pending assets…</p>}
      {!loading && error && <p className="audit-summary">{error}</p>}

      {!loading && !error && (
        <>
          <div className="audit-summary">
            <div className="summary-card pending">
              <h3>Pending</h3>
              <span>{counts.pending}</span>
            </div>
            <div className="summary-card success">
              <h3>Approved</h3>
              <span>{counts.approved}</span>
            </div>
            <div className="summary-card failed">
              <h3>Rejected</h3>
              <span>{counts.rejected}</span>
            </div>
          </div>

          <div className="audit-toolbar">
            <input
              type="text"
              placeholder="Search by file, campaign or sponsor..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              aria-label="Filter by status"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="ALL">All</option>
            </select>
          </div>

          {actionError && <p className="audit-summary">{actionError}</p>}

          <div className="audit-table-container">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Sponsor</th>
                  <th>Campaign</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.file_name}</td>
                    <td>{asset.sponsor_account_name}</td>
                    <td>{asset.campaign_name}</td>
                    <td>
                      {new Date(asset.uploaded_at).toLocaleDateString(
                        'en-GB',
                      )}
                    </td>
                    <td>
                      <span
                        className={`status ${asset.approval_status}`}
                      >
                        {asset.approval_status}
                      </span>
                    </td>
                    <td>
                      {asset.approval_status === 'pending' && (
                        <>
                          <button
                            className="approve"
                            disabled={busyAssetId === asset.id}
                            onClick={() => void handleApprove(asset)}
                          >
                            Approve
                          </button>{' '}
                          <button
                            className="reject"
                            disabled={busyAssetId === asset.id}
                            onClick={() => openRejectPrompt(asset)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {rejectingAsset && (
        <div
          className="audit-modal-overlay"
          onClick={() => setRejectingAsset(null)}
        >
          <div
            className="audit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Reject {rejectingAsset.file_name}</h3>
            <p>Provide a reason the sponsor will see.</p>
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={4}
              placeholder="e.g. Logo resolution is too low for this placement."
              style={{ width: '100%' }}
            />
            {actionError && <p>{actionError}</p>}
            <button onClick={() => setRejectingAsset(null)}>Cancel</button>{' '}
            <button
              className="reject"
              disabled={busyAssetId === rejectingAsset.id}
              onClick={() => void handleReject()}
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
