import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiUpload,
  FiTrash2,
  FiFile,
  FiImage,
  FiVideo,
  FiAlertCircle,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import {
  uploadSponsorCampaignAsset,
  deleteSponsorCampaignAsset,
} from '../../services/sponsorCampaignService';
import '../../styles/pages/landing.css';
import './CampaignAssets.css';

const steps = [
  { number: 1, label: 'Campaign Info' },
  { number: 2, label: 'Targeting' },
  { number: 3, label: 'Assets' },
  { number: 4, label: 'Placement' },
  { number: 5, label: 'Budget' },
  { number: 6, label: 'Review' },
  { number: 7, label: 'Launch' },
];

const currentStep = 3;

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Unsupported file type. Accepted formats: PNG, JPG, GIF, MP4.';
  }

  const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
  const maxSizeMB = isVideo ? MAX_VIDEO_SIZE_MB : MAX_IMAGE_SIZE_MB;

  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File is too large. Maximum size is ${maxSizeMB}MB.`;
  }

  return null;
}

function assetIcon(fileType: string) {
  if (ACCEPTED_VIDEO_TYPES.includes(fileType)) return FiVideo;
  if (ACCEPTED_IMAGE_TYPES.includes(fileType)) return FiImage;
  return FiFile;
}

export default function CampaignAssets() {
  const navigate = useNavigate();
  const campaignId = useSponsorCampaignStore((s) => s.campaignId);
  const assets = useSponsorCampaignStore((s) => s.assets);
  const addAsset = useSponsorCampaignStore((s) => s.addAsset);
  const removeAsset = useSponsorCampaignStore((s) => s.removeAsset);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (campaignId == null) {
      setErrorMessage('Please complete Campaign Info first so we can save your progress.');
      return;
    }

    for (const file of Array.from(files)) {
      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(`${file.name}: ${validationError}`);
        continue;
      }

      setIsUploading(true);
      try {
        const response = await uploadSponsorCampaignAsset(campaignId, file);
        addAsset(response.data);
        setErrorMessage('');
      } catch {
        setErrorMessage(`We could not upload ${file.name}. Please try again.`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    void handleFiles(e.dataTransfer.files);
  };

  const handleRemove = async (assetId: number) => {
    if (campaignId == null) return;
    setRemovingId(assetId);
    try {
      await deleteSponsorCampaignAsset(campaignId, assetId);
      removeAsset(assetId);
    } catch {
      setErrorMessage('We could not remove that asset. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="ca-page">
      <div className="ca-layout">
        <SponsorSidebar />

        <main className="ca-main landing-page">

          {/* Header */}
          <div className="ca-header">
            <button className="ca-back-btn" onClick={() => navigate('/sponsor/campaigns/new/targeting')}>
              <FiArrowLeft size={18} />
            </button>
            <h1 className="ca-title">Create Sponsor Campaign</h1>
          </div>

          {/* Stepper */}
          <div className="ca-stepper">
            {steps.map((step, index) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              return (
                <div key={step.number} className="ca-step-wrap">
                  <div className="ca-step">
                    <div className={`ca-step-circle ${isActive ? 'ca-step-active' : ''} ${isCompleted ? 'ca-step-completed' : ''}`}>
                      {isCompleted ? '✓' : step.number}
                    </div>
                    <div className={`ca-step-label ${isActive ? 'ca-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`ca-step-line ${isCompleted ? 'ca-step-line-done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>

          <p className="ca-intro">Upload the creative assets that will represent your campaign.</p>

          {/* Form */}
          <div className="ca-form-card">
            <h2 className="ca-form-title">Creative Assets</h2>
            <p className="ca-section-hint">
              Accepted formats: PNG, JPG, GIF (Max {MAX_IMAGE_SIZE_MB}MB), MP4 (Max {MAX_VIDEO_SIZE_MB}MB).
            </p>

            <div
              className="ca-drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                type="file"
                className="ca-file-input"
                accept={ACCEPTED_TYPES.join(',')}
                multiple
                ref={inputRef}
                onChange={(e) => {
                  void handleFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <FiUpload size={24} className="ca-upload-icon" />
              <button
                className="ca-upload-btn"
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                {isUploading ? 'Uploading…' : 'Upload File'}
              </button>
              <span className="ca-drag-text">or drag and drop</span>
            </div>

            {errorMessage && (
              <p className="ca-file-error">
                <FiAlertCircle size={13} /> {errorMessage}
              </p>
            )}

            {assets.length > 0 && (
              <div className="ca-asset-list">
                {assets.map((asset) => {
                  const Icon = assetIcon(asset.file_type);
                  return (
                    <div key={asset.id} className="ca-asset-item">
                      <Icon size={18} className="ca-asset-icon" />
                      <span className="ca-asset-name">{asset.file_name}</span>
                      <button
                        className="ca-asset-remove"
                        disabled={removingId === asset.id}
                        onClick={() => handleRemove(asset.id)}
                        aria-label={`Remove ${asset.file_name}`}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="ca-bottom-nav">
            <button className="ca-back-nav-btn" onClick={() => navigate('/sponsor/campaigns/new/targeting')}>
              <FiArrowLeft size={15} /> Back: Targeting
            </button>
            <button className="ca-next-btn" onClick={() => navigate('/sponsor/campaigns/new/placement')}>
              Next: Placement <FiArrowRight size={15} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
