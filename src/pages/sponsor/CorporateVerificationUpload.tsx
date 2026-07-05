import { useState, useRef } from 'react';
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
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import SponsorSidebar from '../../components/SponsorSidebar';
import '../../styles/pages/landing.css';
import './CorporateVerificationUpload.css';

const steps = [
  { number: 1, label: 'Company Info' },
  { number: 2, label: 'Contact Person' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Complete' },
];

const currentStep = 4;

const uploadDocs = [
  {
    id: 'incorporation',
    title: 'Certificate of Incorporation',
    desc: "Upload your company's Certificate of Incorporation issued by the relevant authority.",
    formats: 'Accepted formats: PDF, JPG, PNG (Max. 10MB)',
    recommended: null,
  },
  {
    id: 'tin',
    title: 'Tax Identification Number (TIN)',
    desc: 'Upload a valid Tax Identification Number (TIN) document for your company.',
    formats: 'Accepted formats: PDF, JPG, PNG (Max. 10MB)',
    recommended: null,
  },
  {
    id: 'logo',
    title: 'Company Logo',
    desc: 'Upload your company logo in high resolution.',
    formats: 'Accepted formats: PNG, JPG, SVG (Max. 5MB)',
    recommended: 'Recommended: 512×512px or higher',
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

export default function CorporateVerificationUpload() {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<Record<string, File | null>>({
    incorporation: null,
    tin: null,
    logo: null,
  });

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUploads((prev) => ({ ...prev, [id]: file }));
  };

  const handleDrop = (id: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    setUploads((prev) => ({ ...prev, [id]: file }));
  };

  return (
    <div className="cvu-page">
      <Navbar />

      <div className="cvu-layout">
        <SponsorSidebar />

        <main className="cvu-main landing-page">

          {/* Back link */}
          <button className="cvu-back-link" onClick={() => navigate('/sponsor/corporatesetup/contact')}>
            <FiArrowLeft size={15} />
            Back to Sponsorship Hub
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
                  </div>

                  <div
                    className="cvu-drop-zone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(doc.id, e)}
                    onClick={() => inputRefs.current[doc.id]?.click()}
                  >
                    <input
                      type="file"
                      className="cvu-file-input"
                      ref={(el) => { inputRefs.current[doc.id] = el; }}
                      onChange={(e) => handleFileChange(doc.id, e)}
                    />
                    {uploads[doc.id] ? (
                      <div className="cvu-uploaded">
                        <FiCheckCircle size={22} className="cvu-uploaded-icon" />
                        <span className="cvu-uploaded-name">{uploads[doc.id]!.name}</span>
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
              onClick={() => navigate('/sponsor/corporatesetup/review')}
            >
              Next: Review
              <FiArrowRight size={15} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}