import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFile,
  FiImage,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiVideo,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { getSponsorAccounts } from '../../services/sponsorshipService';
import {
  deleteSponsorCampaignAsset,
  getSponsorCampaigns,
  updateSponsorCampaignAssetTags,
  uploadSponsorCampaignAsset,
  type SponsorCampaign,
  type SponsorCampaignAsset,
} from '../../services/sponsorCampaignService';
import './SponsorAssetLibrary.css';

type AssetType = 'image' | 'video' | 'document';

interface LibraryAsset extends SponsorCampaignAsset {
  campaignId: number;
  campaignName: string;
}

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;

function assetType(fileType: string): AssetType {
  if (ACCEPTED_VIDEO_TYPES.includes(fileType)) return 'video';
  if (ACCEPTED_IMAGE_TYPES.includes(fileType)) return 'image';
  return 'document';
}

function assetIcon(type: AssetType) {
  if (type === 'video') return FiVideo;
  if (type === 'image') return FiImage;
  return FiFile;
}

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

export default function SponsorAssetLibrary() {
  const [campaigns, setCampaigns] = useState<SponsorCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [uploadCampaignId, setUploadCampaignId] = useState<number | null>(
    null,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<LibraryAsset | null>(
    null,
  );
  const [tagDraft, setTagDraft] = useState('');
  const [savingTags, setSavingTags] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const accountsResponse = await getSponsorAccounts();
        const account = accountsResponse.data.results[0];

        if (!account) {
          if (active) setCampaigns([]);
          return;
        }

        const campaignsResponse = await getSponsorCampaigns({
          sponsor_account: account.id,
        });

        if (active) {
          const results = campaignsResponse.data.results;
          setCampaigns(results);
          setUploadCampaignId(results[0]?.id ?? null);
        }
      } catch {
        if (active) {
          setError('We could not load your asset library.');
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

  const assets = useMemo<LibraryAsset[]>(
    () =>
      campaigns.flatMap((campaign) =>
        campaign.assets.map((asset) => ({
          ...asset,
          campaignId: campaign.id,
          campaignName: campaign.name || 'Untitled Campaign',
        })),
      ),
    [campaigns],
  );

  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesType =
        typeFilter === 'all' || assetType(asset.file_type) === typeFilter;

      const matchesSearch =
        !normalizedSearch ||
        asset.file_name.toLowerCase().includes(normalizedSearch) ||
        asset.campaignName.toLowerCase().includes(normalizedSearch) ||
        asset.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch),
        );

      return matchesType && matchesSearch;
    });
  }, [assets, typeFilter, search]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!uploadCampaignId) {
      setUploadError('Start a campaign before uploading assets.');
      return;
    }

    for (const file of Array.from(files)) {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(`${file.name}: ${validationError}`);
        continue;
      }

      setIsUploading(true);
      try {
        const response = await uploadSponsorCampaignAsset(
          uploadCampaignId,
          file,
        );

        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === uploadCampaignId
              ? { ...campaign, assets: [...campaign.assets, response.data] }
              : campaign,
          ),
        );
        setUploadError('');
      } catch {
        setUploadError(`We could not upload ${file.name}. Please try again.`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = async (asset: LibraryAsset) => {
    setRemovingId(asset.id);
    try {
      await deleteSponsorCampaignAsset(asset.campaignId, asset.id);
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === asset.campaignId
            ? {
                ...campaign,
                assets: campaign.assets.filter((a) => a.id !== asset.id),
              }
            : campaign,
        ),
      );
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null);
      }
    } catch {
      setUploadError('We could not remove that asset. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const openAsset = (asset: LibraryAsset) => {
    setSelectedAsset(asset);
    setTagDraft(asset.tags.join(', '));
  };

  const handleSaveTags = async () => {
    if (!selectedAsset) return;

    const tags = tagDraft
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    setSavingTags(true);
    try {
      const response = await updateSponsorCampaignAssetTags(
        selectedAsset.campaignId,
        selectedAsset.id,
        tags,
      );

      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === selectedAsset.campaignId
            ? {
                ...campaign,
                assets: campaign.assets.map((asset) =>
                  asset.id === selectedAsset.id ? response.data : asset,
                ),
              }
            : campaign,
        ),
      );
      setSelectedAsset((prev) =>
        prev ? { ...prev, tags: response.data.tags } : prev,
      );
    } catch {
      setUploadError('We could not save these tags. Please try again.');
    } finally {
      setSavingTags(false);
    }
  };

  return (
    <div className="sal2-page">
      <div className="sal2-layout">
        <SponsorSidebar />

        <main className="sal2-main">
          <header className="sal2-header">
            <div>
              <span>Creative library</span>
              <h1>Assets</h1>
              <p>
                All creative assets uploaded across your campaigns, in one
                place.
              </p>
            </div>
          </header>

          {loading && (
            <div className="sal2-state">
              <FiRefreshCw className="sal2-spin" size={28} />
              <h2>Loading assets</h2>
            </div>
          )}

          {!loading && error && (
            <div className="sal2-state">
              <FiAlertCircle size={28} />
              <h2>Assets unavailable</h2>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && campaigns.length === 0 && (
            <div className="sal2-state">
              <FiImage size={28} />
              <h2>No campaigns yet</h2>
              <p>Start a campaign to begin uploading creative assets.</p>
            </div>
          )}

          {!loading && !error && campaigns.length > 0 && (
            <>
              <div className="sal2-upload-bar">
                <select
                  value={uploadCampaignId ?? ''}
                  onChange={(event) =>
                    setUploadCampaignId(Number(event.target.value))
                  }
                  aria-label="Campaign to upload into"
                >
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name || 'Untitled Campaign'}
                    </option>
                  ))}
                </select>

                <input
                  type="file"
                  ref={inputRef}
                  className="sal2-file-input"
                  accept={ACCEPTED_TYPES.join(',')}
                  multiple
                  onChange={(event) => {
                    void handleUpload(event.target.files);
                    event.target.value = '';
                  }}
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => inputRef.current?.click()}
                >
                  <FiUpload size={14} />
                  {isUploading ? 'Uploading…' : 'Upload Asset'}
                </button>
              </div>

              {uploadError && (
                <p className="sal2-error">
                  <FiAlertCircle size={13} /> {uploadError}
                </p>
              )}

              <div className="sal2-toolbar">
                <div className="sal2-search-wrap">
                  <FiSearch size={14} />
                  <input
                    type="text"
                    placeholder="Search by file name, campaign or tag..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="sal2-type-filters">
                  {(['all', 'image', 'video', 'document'] as const).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        className={
                          typeFilter === type ? 'sal2-filter-active' : ''
                        }
                        onClick={() => setTypeFilter(type)}
                      >
                        {type === 'all' ? 'All' : `${type}s`}
                      </button>
                    ),
                  )}
                </div>

                <span className="sal2-count">
                  {filteredAssets.length} file
                  {filteredAssets.length !== 1 ? 's' : ''}
                </span>
              </div>

              {filteredAssets.length === 0 ? (
                <div className="sal2-state">
                  <FiImage size={28} />
                  <h2>No assets found</h2>
                  <p>
                    {assets.length > 0
                      ? 'No assets match the current search and filter.'
                      : 'Upload your first creative asset to get started.'}
                  </p>
                </div>
              ) : (
                <div className="sal2-grid">
                  {filteredAssets.map((asset) => {
                    const type = assetType(asset.file_type);
                    const Icon = assetIcon(type);

                    return (
                      <div
                        className="sal2-card"
                        key={asset.id}
                        onClick={() => openAsset(asset)}
                      >
                        <div className="sal2-card-thumb">
                          {type === 'image' ? (
                            <img src={asset.file_url} alt={asset.file_name} />
                          ) : (
                            <Icon size={30} />
                          )}
                          <span
                            className={`sal2-status sal2-status-${asset.approval_status}`}
                          >
                            {asset.approval_status === 'approved' && (
                              <FiCheckCircle size={10} />
                            )}
                            {asset.approval_status === 'rejected' && (
                              <FiXCircle size={10} />
                            )}
                            {asset.approval_status === 'pending' && (
                              <FiClock size={10} />
                            )}
                            {asset.approval_status}
                          </span>
                        </div>
                        <div className="sal2-card-info">
                          <span className="sal2-card-name">
                            {asset.file_name}
                          </span>
                          <span className="sal2-card-campaign">
                            {asset.campaignName}
                          </span>
                          {asset.tags.length > 0 && (
                            <div className="sal2-card-tags">
                              {asset.tags.slice(0, 3).map((tag) => (
                                <span key={tag}>{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="sal2-delete-btn"
                          disabled={removingId === asset.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDelete(asset);
                          }}
                          aria-label={`Delete ${asset.file_name}`}
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {selectedAsset && (
        <div
          className="sal2-modal-overlay"
          onClick={() => setSelectedAsset(null)}
        >
          <div className="sal2-modal" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="sal2-modal-close"
              onClick={() => setSelectedAsset(null)}
              aria-label="Close"
            >
              <FiX size={18} />
            </button>

            {assetType(selectedAsset.file_type) === 'image' ? (
              <img
                src={selectedAsset.file_url}
                alt={selectedAsset.file_name}
                className="sal2-modal-img"
              />
            ) : (
              <div className="sal2-modal-file">
                {(() => {
                  const Icon = assetIcon(assetType(selectedAsset.file_type));
                  return <Icon size={40} />;
                })()}
              </div>
            )}

            <h3>{selectedAsset.file_name}</h3>
            <p className="sal2-modal-campaign">
              {selectedAsset.campaignName}
            </p>

            <span
              className={`sal2-status sal2-status-${selectedAsset.approval_status}`}
            >
              {selectedAsset.approval_status}
            </span>

            {selectedAsset.approval_status === 'rejected' &&
              selectedAsset.rejection_reason && (
                <p className="sal2-rejection-reason">
                  {selectedAsset.rejection_reason}
                </p>
              )}

            <label className="sal2-tag-label">
              Tags (comma-separated)
              <input
                type="text"
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                placeholder="e.g. hero, matchday, logo"
              />
            </label>

            <button
              type="button"
              className="sal2-save-tags-btn"
              disabled={savingTags}
              onClick={() => void handleSaveTags()}
            >
              {savingTags ? 'Saving…' : 'Save Tags'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
