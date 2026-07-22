import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiUpload,
  FiShield,
  FiSearch,
  FiFile,
  FiGrid,
  FiHelpCircle,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  useSponsorFormStore,
  type CorporateVerificationDocType,
} from '../../store/sponsorFormStore';
import '../../styles/pages/landing.css';
import './CorporateVerificationUpload.css';

const steps = [
  { number: 1, label: 'Company Info' },
  { number: 2, label: 'Contact Person' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Complete' },
];

const currentStep = 3;

const uploadDocs = [
  {
    id: 'incorporation',
    title: 'Certificate of Incorporation',
    desc: "Upload your company's Certificate of Incorporation issued by the relevant authority.",
    formats: 'Accepted formats: PDF, JPG, PNG (Max. 10MB)',
    recommended: null,
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    maxSizeMB: 10,
    minDimensions: null,
  },
  {
    id: 'tin',
    title: 'Tax Identification Number (TIN)',
    desc: 'Upload a valid Tax Identification Number (TIN) document for your company.',
    formats: 'Accepted formats: PDF, JPG, PNG (Max. 10MB)',
    recommended: null,
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    maxSizeMB: 10,
    minDimensions: null,
  },
  {
    id: 'logo',
    title: 'Company Logo',
    desc: 'Upload your company logo in high resolution.',
    formats: 'Accepted formats: PNG, JPG, SVG (Max. 5MB)',
    recommended: 'Recommended: 512×512px or higher',
    acceptedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
    maxSizeMB: 5,
    minDimensions: { width: 512, height: 512 },
  },
];

const tips = [
  {
    icon: FiSearch,
    title: 'Ensure Documents are Clear',
    desc: 'Upload clear, legible documents. Blurry or cropped files may cause delays.',
  },
  {
    icon: FiFile,
    title: 'Official & Up-to-Date',
    desc: 'Ensure all documents are official and not expired.',
  },
  {
    icon: FiGrid,
    title: 'Match Company Details',
    desc: 'The information on your documents should match your company details.',
  },
  {
    icon: FiFile,
    title: 'File Size & Format',
    desc: 'Use accepted file types and ensure files do not exceed the size limit.',
  },
];

function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  });
}

export default function CorporateVerificationUpload() {
  const navigate = useNavigate();
  const uploads = useSponsorFormStore((state) => state.corporateDocuments);
  const updateCorporateDocuments = useSponsorFormStore(
    (state) => state.updateCorporateDocuments,
  );
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function validateAndSetFile(docId: string, file: File | null) {
    if (!file) return;

    const doc = uploadDocs.find((d) => d.id === docId);
    if (!doc) return;

    if (!doc.acceptedTypes.includes(file.type)) {
      setFileErrors((prev) => ({
        ...prev,
        [docId]: `Unsupported file type. ${doc.formats}`,
      }));
      return;
    }

    const maxSizeBytes = doc.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileErrors((prev) => ({
        ...prev,
        [docId]: `File is too large. Maximum size is ${doc.maxSizeMB}MB.`,
      }));
      return;
    }

    if (doc.minDimensions) {
      const dimensions = await getImageDimensions(file);
      if (
        dimensions &&
        (dimensions.width < doc.minDimensions.width || dimensions.height < doc.minDimensions.height)
      ) {
        setFileErrors((prev) => ({
          ...prev,
          [docId]: `Image resolution is too low. Minimum size is ${doc.minDimensions!.width}×${doc.minDimensions!.height}px.`,
        }));
        return;
      }
    }

    setFileErrors((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    updateCorporateDocuments({
      [docId as CorporateVerificationDocType]: file,
    });
    setErrorMessage('');
  }

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    void validateAndSetFile(id, file);
  };

  const handleDrop = (id: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    void validateAndSetFile(id, file);
  };

  const handleNext = () => {
    const missing = uploadDocs.filter(
      (doc) => !uploads[doc.id as CorporateVerificationDocType],
    );

    if (missing.length > 0) {
      setErrorMessage(
        `Please upload the following before continuing: ${missing.map((d) => d.title).join(', ')}.`
      );
      return;
    }

    if (Object.keys(fileErrors).length > 0) {
      setErrorMessage('Please fix the file upload errors before continuing.');
      return;
    }

    setErrorMessage('');
    navigate('/sponsor/corporatesetup/review');
  };

  return (
    <div className="cvu-page">

      <main className="cvu-main landing-page">

        {/* Back link */}
        <button
          className="cvu-back-link"
          onClick={() => navigate('/sponsor/corporatesetup/contact')}
        >
          <FiArrowLeft size={15} />
          Back to Contact Person
        </button>

        {/* Header */}
        <div className="cvu-header">
          <h1 className="cvu-title">Corporate Verification Upload</h1>
          <p className="cvu-subtitle">
            Tell us about your organization so we can tailor the best partnership experience.
          </p>
        </div>

        {/* Stepper */}
        <div className="cvu-stepper">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            return (
              <div key={step.number} className="cvu-step-wrap">
                <div className="cvu-step">
                  <div className={`cvu-step-circle ${isActive ? 'cvu-step-circle-active' : ''} ${isCompleted ? 'cvu-step-circle-completed' : ''}`}>
                    {isCompleted ? <FiCheckCircle size={18} /> : step.number}
                  </div>
                  <div className={`cvu-step-label ${isActive ? 'cvu-step-label-active' : ''}`}>
                    {step.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`cvu-step-line ${isCompleted ? 'cvu-step-line-completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="cvu-body">

          {/* Upload cards */}
          <div className="cvu-uploads">
            {uploadDocs.map((doc) => (
              <div key={doc.id} className="cvu-upload-card">
                <div className="cvu-upload-info">
                  <h3 className="cvu-upload-title">
                    {doc.title}
                    <FiHelpCircle size={14} className="cvu-help-icon" />
                  </h3>
                  <p className="cvu-upload-desc">{doc.desc}</p>
                  <p className="cvu-upload-formats">{doc.formats}</p>
                  {doc.recommended && (
                    <p className="cvu-upload-formats">{doc.recommended}</p>
                  )}
                  {fileErrors[doc.id] && (
                    <p className="cvu-file-error">
                      <FiAlertCircle size={13} /> {fileErrors[doc.id]}
                    </p>
                  )}
                </div>

                <div
                  className={`cvu-drop-zone ${fileErrors[doc.id] ? 'cvu-drop-zone-error' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(doc.id, e)}
                  onClick={() => inputRefs.current[doc.id]?.click()}
                >
                  <input
                    type="file"
                    className="cvu-file-input"
                    accept={doc.acceptedTypes.join(',')}
                    ref={(el) => { inputRefs.current[doc.id] = el; }}
                    onChange={(e) => handleFileChange(doc.id, e)}
                  />
                  {uploads[doc.id as CorporateVerificationDocType] ? (
                    <div className="cvu-uploaded">
                      <FiCheckCircle size={22} className="cvu-uploaded-icon" />
                      <span className="cvu-uploaded-name">
                        {uploads[doc.id as CorporateVerificationDocType]!.name}
                      </span>
                    </div>
                  ) : (
                    <>
                      <FiUpload size={24} className="cvu-upload-icon" />
                      <button
                        className="cvu-upload-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          inputRefs.current[doc.id]?.click();
                        }}
                      >
                        Upload File
                      </button>
                      <span className="cvu-drag-text">or drag and drop</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right tips panel */}
          <div className="cvu-tips-panel">
            <div className="cvu-tips-card">
              <div className="cvu-tips-header">
                <FiShield size={18} className="cvu-shield-icon" />
                <h3 className="cvu-tips-title">Verification Tips</h3>
              </div>
              <div className="cvu-tips-list">
                {tips.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <div key={tip.title} className="cvu-tip-item">
                      <div className="cvu-tip-icon-wrap">
                        <Icon size={16} className="cvu-tip-icon" />
                      </div>
                      <div>
                        <div className="cvu-tip-title">{tip.title}</div>
                        <div className="cvu-tip-desc">{tip.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="cvu-assistance-card">
              <div className="cvu-assistance-title">Need assistance?</div>
              <div className="cvu-assistance-desc">Our verification team is ready to help.</div>
              <button
                className="cvu-support-btn"
                onClick={() => navigate('/support')}
              >
                Contact Support
                <FiArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="cvu-error-banner">{errorMessage}</div>
        )}

        {/* Bottom nav */}
        <div className="cvu-bottom-nav">
          <button
            className="cvu-back-btn"
            onClick={() => navigate('/sponsor/corporatesetup/contact')}
          >
            <FiArrowLeft size={15} />
            Back: Contact Person
          </button>
          <button
            className="cvu-next-btn"
            onClick={handleNext}
          >
            Next: Review
            <FiArrowRight size={15} />
          </button>
        </div>
      </main>
    </div>
  );
}