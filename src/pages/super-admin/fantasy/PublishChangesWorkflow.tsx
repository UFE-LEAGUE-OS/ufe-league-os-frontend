import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Circle,
  XCircle,
  Ban,
  ArrowRight,
  FileEdit,
  ShieldCheck,
  Users,
  Clock,
  Inbox,
  Search,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---------------- TYPES ---------------- */

type Sport = "Football" | "Basketball" | "Rugby";
type Stage = "Draft" | "Review" | "Approved" | "Published" | "Rejected";
type Role = "Fantasy Admin" | "Compliance" | "Technical Director";
type ItemStatus = "Pending" | "Passed" | "Failed";
type StageFilter = Stage | "All";

type ChangeItem = {
  id: string;
  label: string;
  role: Role;
  gatesStage: Stage;
  status: ItemStatus;
};

type ChangeRequest = {
  id: string;
  sport: Sport;
  title: string;
  description: string;
  stage: Stage;
  submittedBy: string;
  checklist: ChangeItem[];
  updated: string;
};

type FormState = {
  sport: Sport;
  title: string;
  description: string;
  submittedBy: string;
};

/* ---------------- CONSTANTS ---------------- */

const SPORTS: Sport[] = ["Football", "Basketball", "Rugby"];

const STAGE_ORDER: Stage[] = ["Draft", "Review", "Approved", "Published"];

const STAGE_TONE: Record<Stage, string> = {
  Draft: "muted",
  Review: "amber",
  Approved: "amber",
  Published: "green",
  Rejected: "muted",
};

const SPORT_ACCENT: Record<Sport, string> = {
  Football: "green",
  Basketball: "amber",
  Rugby: "purple",
};

const ROLE_LABEL: Record<Role, string> = {
  "Fantasy Admin": "Fantasy Admin",
  Compliance: "Compliance Officer",
  "Technical Director": "Technical Director",
};

function buildChecklist(): ChangeItem[] {
  return [
    { id: "c1", label: "Rules documentation updated", role: "Fantasy Admin", gatesStage: "Draft", status: "Pending" },
    { id: "c2", label: "Impact assessment completed", role: "Fantasy Admin", gatesStage: "Draft", status: "Pending" },
    { id: "c3", label: "Stakeholder notification drafted", role: "Fantasy Admin", gatesStage: "Draft", status: "Pending" },

    { id: "c4", label: "Compliance review completed", role: "Compliance", gatesStage: "Review", status: "Pending" },
    { id: "c5", label: "Regulatory alignment verified", role: "Compliance", gatesStage: "Review", status: "Pending" },
    { id: "c6", label: "Risk assessment signed off", role: "Compliance", gatesStage: "Review", status: "Pending" },

    { id: "c7", label: "Technical feasibility confirmed", role: "Technical Director", gatesStage: "Approved", status: "Pending" },
    { id: "c8", label: "System impact analysis done", role: "Technical Director", gatesStage: "Approved", status: "Pending" },
    { id: "c9", label: "Final sign-off by Technical Director", role: "Technical Director", gatesStage: "Approved", status: "Pending" },
  ];
}

function withStatuses(overrides: Record<string, ItemStatus>): ChangeItem[] {
  return buildChecklist().map((item) =>
    overrides[item.id] ? { ...item, status: overrides[item.id] } : item
  );
}

/* ---------------- DATA ---------------- */

const INITIAL_REQUESTS: ChangeRequest[] = [
  {
    id: "cr1",
    sport: "Football",
    title: "Update scoring rules for 2026 season",
    description: "Increase goal points from 4 to 5, add assist bonus points",
    stage: "Approved",
    submittedBy: "Merab Apio",
    checklist: withStatuses({
      c1: "Passed", c2: "Passed", c3: "Passed",
      c4: "Passed", c5: "Passed", c6: "Passed",
      c7: "Passed", c8: "Passed", c9: "Pending",
    }),
    updated: "2 hours ago",
  },
  {
    id: "cr2",
    sport: "Football",
    title: "Adjust transfer limits mid-season",
    description: "Reduce transfers per gameweek from 3 to 2 for balance",
    stage: "Review",
    submittedBy: "James Okello",
    checklist: withStatuses({
      c1: "Passed", c2: "Passed", c3: "Passed",
      c4: "Passed", c5: "Pending", c6: "Failed",
    }),
    updated: "1 day ago",
  },
  {
    id: "cr3",
    sport: "Basketball",
    title: "New roster eligibility rules",
    description: "Add minimum 2 club-trained players requirement",
    stage: "Draft",
    submittedBy: "Grace Nabatanzi",
    checklist: withStatuses({ c1: "Passed", c2: "Pending", c3: "Pending" }),
    updated: "3 hours ago",
  },
  {
    id: "cr4",
    sport: "Football",
    title: "Price structure update for premium players",
    description: "Adjust price floor from 4.5 to 5.0 for elite category",
    stage: "Published",
    submittedBy: "Merab Apio",
    checklist: withStatuses({
      c1: "Passed", c2: "Passed", c3: "Passed",
      c4: "Passed", c5: "Passed", c6: "Passed",
      c7: "Passed", c8: "Passed", c9: "Passed",
    }),
    updated: "1 week ago",
  },
  {
    id: "cr5",
    sport: "Rugby",
    title: "Fantasy squad size increase",
    description: "Increase max squad from 20 to 23 players",
    stage: "Rejected",
    submittedBy: "James Okello",
    checklist: withStatuses({ c1: "Passed", c2: "Failed", c3: "Pending" }),
    updated: "4 days ago",
  },
];

const EMPTY_FORM: FormState = {
  sport: "Football",
  title: "",
  description: "",
  submittedBy: "",
};

/* ---------------- HELPERS ---------------- */

function currentStageItems(req: ChangeRequest) {
  return req.checklist.filter((i) => i.gatesStage === req.stage);
}

function stageProgress(req: ChangeRequest) {
  const items = currentStageItems(req);
  if (items.length === 0) return { passed: 0, total: 0 };
  return { passed: items.filter((i) => i.status === "Passed").length, total: items.length };
}

function canAdvance(req: ChangeRequest) {
  const items = currentStageItems(req);
  return items.length > 0 && items.every((i) => i.status === "Passed");
}

function nextStage(stage: Stage): Stage | null {
  const idx = STAGE_ORDER.indexOf(stage);
  if (idx === -1 || idx === STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
}

function StatusIcon({ status }: { status: ItemStatus }) {
  if (status === "Passed") return <CheckCircle2 size={15} className="tone-green" />;
  if (status === "Failed") return <XCircle size={15} className="tone-muted" />;
  return <Circle size={15} className="tone-amber" />;
}

/* ---------------- COMPONENT ---------------- */

export default function PublishChangesWorkflow() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ChangeRequest[]>(INITIAL_REQUESTS);

  const [activeSport, setActiveSport] = useState<"All" | Sport>("All");
  const [stageFilter, setStageFilter] = useState<StageFilter>("All");
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ---------------- FILTERED ---------------- */

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (activeSport !== "All" && r.sport !== activeSport) return false;
      if (stageFilter !== "All" && r.stage !== stageFilter) return false;
      if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [requests, activeSport, stageFilter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: requests.length, Football: 0, Basketball: 0, Rugby: 0 };
    requests.forEach((r) => { c[r.sport]++; });
    return c;
  }, [requests]);

  /* ---------------- ACTIONS ---------------- */

  function openCreate() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(EMPTY_FORM);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newRequest: ChangeRequest = {
      id: `cr${Date.now()}`,
      sport: form.sport,
      title: form.title,
      description: form.description,
      stage: "Draft",
      submittedBy: form.submittedBy,
      checklist: buildChecklist(),
      updated: "Just now",
    };
    setRequests((prev) => [newRequest, ...prev]);
    closeModal();
  }

  function toggleItem(req: ChangeRequest, item: ChangeItem) {
    const order: ItemStatus[] = ["Pending", "Passed", "Failed"];
    const nextStatus = order[(order.indexOf(item.status) + 1) % order.length];
    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? {
              ...r,
              checklist: r.checklist.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)),
              updated: "Just now",
            }
          : r
      )
    );
  }

  function advance(req: ChangeRequest) {
    const next = nextStage(req.stage);
    if (!next || !canAdvance(req)) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, stage: next, updated: "Just now" } : r))
    );
  }

  function reject(req: ChangeRequest) {
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, stage: "Rejected", updated: "Just now" } : r))
    );
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="fantasy-sub-page">
      <div className="fantasy-sub-header">
        <button
          className="back-btn"
          onClick={() => navigate("/super-admin/fantasy-config")}
        >
          <ArrowLeft size={16} />
          Back to Fantasy Config
        </button>
        <div>
          <h2>Publish Changes Workflow</h2>
          <p className="governance-subtitle">
            Review, approve, and publish fantasy configuration changes through a
            structured approval pipeline
          </p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="variants-toolbar" style={{ marginBottom: "1.5rem" }}>
        <div className="sport-tabs">
          <button
            className={`sport-tab ${activeSport === "All" ? "active" : ""}`}
            onClick={() => setActiveSport("All")}
          >
            All <span className="tab-count">{counts.All}</span>
          </button>
          {SPORTS.map((sport) => (
            <button
              key={sport}
              className={`sport-tab ${activeSport === sport ? "active" : ""}`}
              onClick={() => setActiveSport(sport)}
            >
              {sport} <span className="tab-count">{counts[sport]}</span>
            </button>
          ))}
        </div>

        <div className="toolbar-right">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as StageFilter)}
            className="fantasy-select"
          >
            <option value="All">All stages</option>
            {STAGE_ORDER.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="Rejected">Rejected</option>
          </select>

          <div className="toolbar-search">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search changes..."
              className="fantasy-input"
            />
          </div>

          <button className="icon-action-btn" onClick={openCreate}>
            <Plus size={16} /> New Change
          </button>
        </div>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Inbox size={32} />
          <h3>No change requests match your filters</h3>
          <p>Try a different sport, stage, or search term — or create a new change request.</p>
        </div>
      ) : (
        <section className="variant-grid">
          {filtered.map((req) => {
            const progress = stageProgress(req);
            const pct = progress.total ? Math.round((progress.passed / progress.total) * 100) : 100;
            const expanded = expandedId === req.id;
            const isTerminal = req.stage === "Published" || req.stage === "Rejected";

            return (
              <div key={req.id} className={`variant-card accent-${SPORT_ACCENT[req.sport]}`}>
                <div className="variant-card-top">
                  <span className={`sport-pill accent-${SPORT_ACCENT[req.sport]}`}>
                    {req.sport}
                  </span>
                  <span className={`status-badge tone-${STAGE_TONE[req.stage]}`}>
                    {req.stage}
                  </span>
                </div>

                <h3 className="variant-name">{req.title}</h3>
                <div className="variant-code">{req.description}</div>

                {/* Stage pipeline */}
                <div className="variant-meta-item" style={{ gap: 6, flexWrap: "wrap" }}>
                  {STAGE_ORDER.map((stage, idx) => {
                    const reached =
                      req.stage !== "Rejected" &&
                      STAGE_ORDER.indexOf(req.stage) >= idx;
                    return (
                      <span key={stage} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span
                          className={`status-badge tone-${reached ? "green" : "muted"}`}
                          style={{ fontSize: 11 }}
                        >
                          {stage}
                        </span>
                        {idx < STAGE_ORDER.length - 1 && <ArrowRight size={11} />}
                      </span>
                    );
                  })}
                </div>

                <div className="variant-meta">
                  <div className="variant-meta-item">
                    <Users size={14} />
                    Submitted by {req.submittedBy}
                  </div>
                  {!isTerminal && (
                    <div className="variant-meta-item">
                      <ShieldCheck size={14} />
                      {progress.passed}/{progress.total} checks cleared for {req.stage} ({pct}%)
                    </div>
                  )}
                </div>

                {/* Checklist */}
                {!isTerminal && (
                  <div className="variant-meta" style={{ marginTop: 4 }}>
                    <button
                      className="icon-action-btn subtle"
                      style={{ marginBottom: 6 }}
                      onClick={() => toggleExpand(req.id)}
                    >
                      {expanded ? "Hide checklist" : "Review checklist"}
                    </button>

                    {expanded && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {currentStageItems(req).map((item) => (
                          <button
                            key={item.id}
                            className="variant-meta-item"
                            style={{
                              cursor: "pointer",
                              background: "none",
                              border: "none",
                              padding: 0,
                              textAlign: "left",
                              width: "100%",
                            }}
                            onClick={() => toggleItem(req, item)}
                            title="Click to cycle: Pending → Passed → Failed"
                          >
                            <StatusIcon status={item.status} />
                            {item.label}
                            <span style={{ marginLeft: "auto", opacity: 0.6, fontSize: 11 }}>
                              {ROLE_LABEL[item.role]}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="variant-card-footer">
                  <span className="variant-leagues">
                    <FileEdit size={12} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                    {req.stage}
                  </span>
                  <span className="variant-updated">
                    <Clock size={12} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                    Updated {req.updated}
                  </span>
                </div>

                {!isTerminal && (
                  <div className="variant-actions">
                    <button
                      className="icon-action-btn subtle"
                      onClick={() => reject(req)}
                    >
                      <Ban size={14} /> Reject
                    </button>
                    <button
                      className="icon-action-btn"
                      disabled={!canAdvance(req)}
                      onClick={() => advance(req)}
                      style={!canAdvance(req) ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                    >
                      {req.stage === "Approved" ? "Publish" : "Advance"} <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Change Request</h3>
              <button className="modal-close" onClick={closeModal}>
                <XCircle size={16} />
              </button>
            </div>

            <form className="variant-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  Sport
                  <select
                    value={form.sport}
                    onChange={(e) => setForm({ ...form, sport: e.target.value as Sport })}
                    className="fantasy-select"
                  >
                    {SPORTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Submitted by
                  <input
                    required
                    value={form.submittedBy}
                    onChange={(e) => setForm({ ...form, submittedBy: e.target.value })}
                    placeholder="e.g. Merab Apio"
                    className="fantasy-input"
                  />
                </label>
              </div>

              <label>
                Change title
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Update scoring rules for 2026 season"
                  className="fantasy-input"
                />
              </label>

              <label>
                Description
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the change and its impact..."
                  className="fantasy-input"
                  rows={3}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="icon-action-btn subtle" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="icon-action-btn">
                  <Send size={14} /> Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}