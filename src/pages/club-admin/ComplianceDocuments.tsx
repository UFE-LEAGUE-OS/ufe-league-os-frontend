import { useState, useRef, type FormEvent } from "react";
import {
  FileText,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Trash2,
} from "lucide-react";
import { WorkspacePanel } from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";

type DocumentStatus = "pending" | "approved" | "rejected";

type ComplianceDocument = {
  id: string;
  name: string;
  category: string;
  fileSize: string;
  uploadedAt: string;
  status: DocumentStatus;
  reviewedBy?: string;
  notes?: string;
};

const CATEGORIES = [
  "Club Registration",
  "Player Registration",
  "Insurance",
  "Financial Reports",
  "Season Licensing",
  "Safety & Security",
  "Governance",
  "Other",
];

const MOCK_DOCUMENTS: ComplianceDocument[] = [
  {
    id: "1",
    name: "2026 Club Registration Form.pdf",
    category: "Club Registration",
    fileSize: "2.4 MB",
    uploadedAt: "2026-06-15T10:30:00Z",
    status: "approved",
    reviewedBy: "Sarah K. (League Office)",
    notes: "All documentation is in order.",
  },
  {
    id: "2",
    name: "Player Insurance Policy 2026.pdf",
    category: "Insurance",
    fileSize: "1.8 MB",
    uploadedAt: "2026-06-20T14:15:00Z",
    status: "pending",
  },
  {
    id: "3",
    name: "End of Season Financial Report.pdf",
    category: "Financial Reports",
    fileSize: "3.1 MB",
    uploadedAt: "2026-05-28T09:00:00Z",
    status: "rejected",
    reviewedBy: "James M. (Finance)",
    notes: "Please include the audited statement from the club accountant.",
  },
];

function formatDate(isoString: string) {
  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const config: Record<DocumentStatus, { icon: typeof CheckCircle; label: string; className: string }> = {
    approved: {
      icon: CheckCircle,
      label: "Approved",
      className: "cd-status-approved",
    },
    pending: {
      icon: Clock,
      label: "Pending Review",
      className: "cd-status-pending",
    },
    rejected: {
      icon: AlertCircle,
      label: "Rejected",
      className: "cd-status-rejected",
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={`cd-status-badge ${className}`}>
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
}

export default function ComplianceDocuments() {
  const [documents, setDocuments] = useState<ComplianceDocument[]>(MOCK_DOCUMENTS);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState(CATEGORIES[0]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setUploadFile(file);
    if (file) {
      // Auto-fill name from file name
      setUploadName(file.name.replace(/\.[^/.]+$/, ""));
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setUploadError("");

    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    if (!uploadName.trim()) {
      setUploadError("Please provide a document name.");
      return;
    }

    setIsUploading(true);

    // Simulate upload
    setTimeout(() => {
      const newDoc: ComplianceDocument = {
        id: String(Date.now()),
        name: `${uploadName.trim()}.${uploadFile.name.split(".").pop() ?? "pdf"}`,
        category: uploadCategory,
        fileSize: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString(),
        status: "pending",
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploading(false);
      setShowUploadForm(false);
      setUploadName("");
      setUploadCategory(CATEGORIES[0]);
      setUploadFile(null);
    }, 1500);
  }

  function handleDeleteDocument(id: string) {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }

  const stats = {
    total: documents.length,
    approved: documents.filter((d) => d.status === "approved").length,
    pending: documents.filter((d) => d.status === "pending").length,
    rejected: documents.filter((d) => d.status === "rejected").length,
  };

  return (
    <div className="compliance-documents-page">
      <div className="cd-stats-row">
        <div className="cd-stat-card">
          <FileText size={20} aria-hidden="true" />
          <strong>{stats.total}</strong>
          <span>Total Documents</span>
        </div>
        <div className="cd-stat-card cd-stat-approved">
          <CheckCircle size={20} aria-hidden="true" />
          <strong>{stats.approved}</strong>
          <span>Approved</span>
        </div>
        <div className="cd-stat-card cd-stat-pending">
          <Clock size={20} aria-hidden="true" />
          <strong>{stats.pending}</strong>
          <span>Pending</span>
        </div>
        <div className="cd-stat-card cd-stat-rejected">
          <AlertCircle size={20} aria-hidden="true" />
          <strong>{stats.rejected}</strong>
          <span>Rejected</span>
        </div>
      </div>

      <WorkspacePanel
        title="Compliance Documents"
        description="Upload and manage compliance documents required by the league or union."
        actions={
          <button
            type="button"
            className="cd-upload-button"
            onClick={() => setShowUploadForm(true)}
          >
            <Upload size={16} aria-hidden="true" />
            Upload Document
          </button>
        }
      >
        {showUploadForm && (
          <div className="cd-upload-overlay">
            <div className="cd-upload-modal">
              <div className="cd-upload-modal-header">
                <h3>Upload Compliance Document</h3>
                <button
                  type="button"
                  className="cd-close-button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setUploadError("");
                  }}
                  aria-label="Close upload form"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="cd-upload-form">
                <div className="cd-form-group">
                  <label htmlFor="cd-file">Document File *</label>
                  <div
                    className="cd-file-drop-zone"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        fileInputRef.current?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {uploadFile ? (
                      <div className="cd-file-selected">
                        <FileText size={24} aria-hidden="true" />
                        <div>
                          <strong>{uploadFile.name}</strong>
                          <span>{(uploadFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                        </div>
                      </div>
                    ) : (
                      <div className="cd-file-placeholder">
                        <Upload size={28} aria-hidden="true" />
                        <strong>Click to select a file</strong>
                        <span>PDF, DOC, DOCX, XLS, XLSX — Max 20 MB</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    id="cd-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>

                <div className="cd-form-group">
                  <label htmlFor="cd-name">Document Name *</label>
                  <input
                    id="cd-name"
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="e.g. 2026 Club Registration Form"
                    required
                  />
                </div>

                <div className="cd-form-group">
                  <label htmlFor="cd-category">Category *</label>
                  <select
                    id="cd-category"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {uploadError && (
                  <div className="cd-form-error">
                    <AlertCircle size={16} aria-hidden="true" />
                    {uploadError}
                  </div>
                )}

                <div className="cd-form-actions">
                  <button
                    type="button"
                    className="cd-cancel-button"
                    onClick={() => {
                      setShowUploadForm(false);
                      setUploadError("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cd-submit-button"
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading…" : "Upload Document"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="cd-empty">
            <FileText size={40} aria-hidden="true" />
            <strong>No compliance documents yet</strong>
            <span>
              Upload your first compliance document to get started.
            </span>
          </div>
        ) : (
          <div className="cd-table-shell">
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="cd-doc-name">
                        <FileText size={16} aria-hidden="true" />
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td>{doc.category}</td>
                    <td>{doc.fileSize}</td>
                    <td>{formatDate(doc.uploadedAt)}</td>
                    <td>
                      <StatusBadge status={doc.status} />
                      {doc.reviewedBy && (
                        <div className="cd-reviewer">
                          <small>by {doc.reviewedBy}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="cd-action-buttons">
                        <button
                          type="button"
                          className="cd-icon-button"
                          aria-label="View document"
                          title="View document"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="cd-icon-button cd-icon-button-danger"
                          aria-label="Delete document"
                          title="Delete document"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {documents.some((d) => d.status === "rejected") && (
          <div className="cd-rejection-notes">
            <h4>Review Notes</h4>
            {documents
              .filter((d) => d.status === "rejected" && d.notes)
              .map((doc) => (
                <div key={doc.id} className="cd-rejection-note">
                  <AlertCircle size={14} aria-hidden="true" />
                  <strong>{doc.name}:</strong>
                  <span>{doc.notes}</span>
                </div>
              ))}
          </div>
        )}
      </WorkspacePanel>
    </div>
  );
}