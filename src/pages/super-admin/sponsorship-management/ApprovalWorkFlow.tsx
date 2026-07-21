
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

}
