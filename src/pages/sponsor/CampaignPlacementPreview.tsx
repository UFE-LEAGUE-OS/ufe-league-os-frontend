import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShare2,
  FiCheck,
  FiCircle,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import '../../styles/pages/landing.css';
import './CampaignPlacementPreview.css';

const checklistItems = [
  { id: 1, label: 'Landing Page Hero', desc: 'Homepage hero banner', done: true },
  { id: 2, label: 'Fixtures Page Card', desc: 'Sponsored fixture highlight', done: true },
  { id: 3, label: 'Team Profile Banner', desc: 'Partner banner on team pages', done: true },
  { id: 4, label: 'Match Center Branding', desc: 'In-game branding & overlays', done: false },
  { id: 5, label: 'Membership Section', desc: 'Sponsor tile in membership', done: false },
  { id: 6, label: 'Ticketing Flow Branding', desc: 'Branding in ticket purchase flow', done: true },
];

const approvalHistory = [
  {
    initials: 'DT',
    name: 'Design Team',
    sub: 'Reviewed by Jane • 2 hours ago',
    status: 'APPROVED',
    statusClass: 'cpp-status-approved',
  },
  {
    initials: 'BC',
    name: 'Branding and Compliance',
    sub: 'Pending Review • 2 hours ago',
    status: 'PENDING',
    statusClass: 'cpp-status-pending',
  },
];

export default function CampaignPlacementPreview() {
  const navigate = useNavigate();
  const [note, setNote] = useState('');

  const doneCount = checklistItems.filter((i) => i.done).length;

  return (
    <div className="cpp-page">

      <div className="cpp-layout">
        <SponsorSidebar />

        <main className="cpp-main landing-page">

          {/* Header */}
          <div className="cpp-header">
            <div className="cpp-header-left">
              <h1 className="cpp-title">Campaign Placement Preview</h1>
              <p className="cpp-subtitle">
                Review how your campaign will appear across the League OS ecosystem before activation.
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="cpp-body">

            {/* Preview grid + comments */}
            <div className="cpp-content">

              {/* 2x2 preview grid */}
              <div className="cpp-preview-grid">

                {/* 1. Landing Page Hero */}
                <div className="cpp-preview-card">
                  <div className="cpp-preview-card-header">
                    <span className="cpp-preview-num">1</span>
                    <span className="cpp-preview-label">Landing Page Hero</span>
                    <span className="cpp-live-badge">LIVE PREVIEW</span>
                  </div>
                  <div className="cpp-preview-content cpp-hero-preview">
                    <div className="cpp-nile-hero">
                      <div className="cpp-nile-hero-bg">
                        <div className="cpp-nile-hero-text">
                          <div className="cpp-nile-hero-name">NILE</div>
                          <div className="cpp-nile-hero-special">— SPECIAL —</div>
                          <div className="cpp-nile-hero-bars">
                            <span className="cpp-bar cpp-bar-orange" />
                            <span className="cpp-bar cpp-bar-red" />
                          </div>
                        </div>
                        <div className="cpp-nile-bottle">🍺</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Fixtures Page */}
                <div className="cpp-preview-card">
                  <div className="cpp-preview-card-header">
                    <span className="cpp-preview-num">2</span>
                    <span className="cpp-preview-label">Fixtures Page - Sponsored Fixture Card</span>
                    <span className="cpp-live-badge">LIVE PREVIEW</span>
                  </div>
                  <div className="cpp-preview-content">
                    <div className="cpp-sponsored-tag">SPONSORED</div>
                    <div className="cpp-fixture-row">
                      <div className="cpp-fixture-info">
                        <div className="cpp-fixture-teams">
                          <span className="cpp-team-badge">🏉</span>
                          <span className="cpp-team-name">KCB KOBS</span>
                          <span className="cpp-vs">VS</span>
                          <span className="cpp-team-badge">⭐</span>
                          <span className="cpp-team-name">Platinum Heathens</span>
                          <span className="cpp-sponsor-mini">🍺</span>
                        </div>
                        <div className="cpp-fixture-meta">Sat, 26 May • 4:30 PM</div>
                        <div className="cpp-fixture-venue">Kampala Rugby Club</div>
                      </div>
                      <button className="cpp-buy-btn">Buy Tickets <FiArrowRight size={12} /></button>
                    </div>
                    <div className="cpp-fixture-divider" />
                    <div className="cpp-fixture-row">
                      <div className="cpp-fixture-info">
                        <div className="cpp-fixture-teams">
                          <span className="cpp-team-badge">🏴‍☠️</span>
                          <span className="cpp-team-name">Black Pirates</span>
                          <span className="cpp-vs">VS</span>
                          <span className="cpp-team-badge">🌿</span>
                          <span className="cpp-team-name">Makerere Impis</span>
                        </div>
                        <div className="cpp-fixture-meta">Sun, 27 May • 4:30 PM</div>
                        <div className="cpp-fixture-venue">King's Park Arena</div>
                      </div>
                      <button className="cpp-buy-btn">Buy Tickets <FiArrowRight size={12} /></button>
                    </div>
                  </div>
                </div>

                {/* 3. Team Profile */}
                <div className="cpp-preview-card">
                  <div className="cpp-preview-card-header">
                    <span className="cpp-preview-num">3</span>
                    <span className="cpp-preview-label">Team Profile - Partner Banner</span>
                    <span className="cpp-live-badge">LIVE PREVIEW</span>
                  </div>
                  <div className="cpp-preview-content">
                    <div className="cpp-team-profile-header">
                      <div className="cpp-team-profile-logo">🦅</div>
                      <div className="cpp-team-profile-name">KCB KOBS</div>
                      <FiShare2 size={14} className="cpp-share-icon" />
                    </div>
                    <div className="cpp-partner-banner">
                      <span className="cpp-partner-banner-text">NILE SPECIAL — UGANDAN REWARD</span>
                    </div>
                    <div className="cpp-team-tabs">
                      <span className="cpp-team-tab cpp-team-tab-active">Overview</span>
                      <span className="cpp-team-tab">Squad</span>
                      <span className="cpp-team-tab">Fixtures</span>
                    </div>
                    <div className="cpp-team-desc">
                      KCB Football Club is a professional football club...
                    </div>
                  </div>
                </div>

                {/* 4. Ticketing Flow */}
                <div className="cpp-preview-card">
                  <div className="cpp-preview-card-header">
                    <span className="cpp-preview-num">4</span>
                    <span className="cpp-preview-label">Ticketing Flow - Branding Placement</span>
                    <span className="cpp-live-badge">LIVE PREVIEW</span>
                  </div>
                  <div className="cpp-preview-content">
                    <div className="cpp-ticket-stepper">
                      <span className="cpp-ticket-step cpp-ticket-step-active">① Tickets</span>
                      <span className="cpp-ticket-step">② Details</span>
                      <span className="cpp-ticket-step">③ Payment</span>
                      <span className="cpp-ticket-step">④ Confirmation</span>
                    </div>
                    <div className="cpp-ticket-match">
                      <span className="cpp-team-badge">🦅</span>
                      <span className="cpp-ticket-match-text">KCB KOBS VS Platinum Heathens</span>
                    </div>
                    <div className="cpp-ticket-meta">Sat, 26 May • 4:30 PM • Kampala Rugby Club</div>
                    <div className="cpp-ticket-row">
                      <span className="cpp-ticket-tier">VIP Stand</span>
                      <div className="cpp-ticket-qty">
                        <span className="cpp-qty-label">UGX 30,000</span>
                        <div className="cpp-qty-ctrl">
                          <button className="cpp-qty-btn">-</button>
                          <span className="cpp-qty-num">2</span>
                          <button className="cpp-qty-btn">+</button>
                        </div>
                        <span className="cpp-qty-total">UGX 60,000</span>
                      </div>
                    </div>
                    <div className="cpp-ticket-banner">
                      <span className="cpp-ticket-banner-text">NILE SPECIAL — UGANDAN REWARD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments & Approvals */}
              <div className="cpp-comments-card">
                <h3 className="cpp-comments-title">Comments & Approvals</h3>
                <div className="cpp-comments-body">

                  {/* Comment input */}
                  <div className="cpp-comment-section">
                    <div className="cpp-comment-existing">
                      <div className="cpp-comment-avatar">JK</div>
                      <div className="cpp-comment-content">
                        <div className="cpp-comment-author-row">
                          <span className="cpp-comment-author">John Doe</span>
                          <span className="cpp-comment-role">Super Admin • 2 hours ago</span>
                        </div>
                        <div className="cpp-comment-text">
                          Please review the hero banner text contrast on mobile. Looks good overall.
                        </div>
                      </div>
                    </div>
                    <div className="cpp-comment-input-row">
                      <input
                        className="cpp-comment-input"
                        type="text"
                        placeholder="Add Internal Notes..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                      <button className="cpp-add-note-btn">Add Note</button>
                    </div>
                  </div>

                  {/* Approval history */}
                  <div className="cpp-approval-section">
                    <h4 className="cpp-approval-title">Approval History</h4>
                    {approvalHistory.map((item) => (
                      <div key={item.initials} className="cpp-approval-row">
                        <div className="cpp-approval-avatar">{item.initials}</div>
                        <div className="cpp-approval-info">
                          <div className="cpp-approval-name">{item.name}</div>
                          <div className="cpp-approval-sub">{item.sub}</div>
                        </div>
                        <span className={`cpp-approval-status ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="cpp-sidebar">

              {/* Campaign Summary */}
              <div className="cpp-summary-card">
                <div className="cpp-summary-header">
                  <span className="cpp-summary-title">Campaign Summary</span>
                  <span className="cpp-draft-badge">DRAFT</span>
                </div>
                <div className="cpp-summary-campaign">
                  <div className="cpp-summary-logo">🍺</div>
                  <div>
                    <div className="cpp-summary-campaign-name">Nile Special Matchday</div>
                    <div className="cpp-summary-campaign-type">Awareness Campaign</div>
                  </div>
                </div>
                <div className="cpp-summary-details">
                  <div className="cpp-summary-row">
                    <span className="cpp-summary-label">Run Dates</span>
                    <span className="cpp-summary-val">01 Jun 2026 – 30 Jun 2027</span>
                  </div>
                  <div className="cpp-summary-row">
                    <span className="cpp-summary-label">Target Entities</span>
                    <span className="cpp-summary-val">All NSRPL Clubs, All Fans</span>
                  </div>
                  <div className="cpp-summary-row">
                    <span className="cpp-summary-label">Campaign Type</span>
                    <span className="cpp-summary-val">Awareness</span>
                  </div>
                  <div className="cpp-summary-row">
                    <span className="cpp-summary-label">Approval Status</span>
                    <span className="cpp-pending-badge">PENDING</span>
                  </div>
                </div>
              </div>

              {/* Placement Checklist */}
              <div className="cpp-checklist-card">
                <div className="cpp-checklist-header">
                  <span className="cpp-checklist-title">Placement Checklist</span>
                  <span className="cpp-checklist-count">{doneCount} / {checklistItems.length}</span>
                </div>
                <div className="cpp-checklist-items">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="cpp-checklist-item">
                      {item.done ? (
                        <FiCheckCircle size={16} className="cpp-check-done" />
                      ) : (
                        <FiCircle size={16} className="cpp-check-todo" />
                      )}
                      <div>
                        <div className={`cpp-check-label ${item.done ? 'cpp-check-label-done' : ''}`}>
                          {item.label}
                        </div>
                        <div className="cpp-check-desc">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="cpp-action-btns">
                <button
                  className="cpp-request-btn"
                  onClick={() => navigate('/sponsor/campaigns/new/launch')}
                >
                  Request Approval
                </button>
                <button
                  className="cpp-publish-btn"
                  onClick={() => navigate('/sponsor/campaigns/new/launch')}
                >
                  <FiCheck size={15} /> Publish Campaign
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}