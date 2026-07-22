import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiBell,
  FiShield,
  FiCreditCard,
  FiCamera,
  FiMail,
  FiPhone,
  FiMapPin,
  FiToggleLeft,
  FiToggleRight,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiClock,
  FiXCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { fetchProfile, updateProfile, uploadAvatar } from '../../services/authService.js';
import {
  getSponsorAccounts,
  getSponsorAgreements,
  getSponsorNotificationPreferences,
  getSponsorVerificationDocuments,
  updateSponsorNotificationPreferences,
  uploadSponsorVerificationDocument,
  type SponsorAccountResponse,
  type SponsorAgreement,
  type SponsorNotificationPreferences,
  type SponsorVerificationDocType,
  type SponsorVerificationDocument,
} from '../../services/sponsorshipService';
import './SponsorSettings.css';

type Tab = 'profile' | 'notifications' | 'security' | 'billing';

type ProfileData = {
  email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  avatar_url?: string;
};

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'security', label: 'Security', icon: FiShield },
  { id: 'billing', label: 'Billing & Payments', icon: FiCreditCard },
];

const verificationDocLabels: Record<SponsorVerificationDocType, string> = {
  incorporation: 'Certificate of Incorporation',
  tin: 'Tax Identification Number (TIN)',
  logo: 'Company Logo',
};

const notificationCopy: {
  key: keyof SponsorNotificationPreferences;
  label: string;
  desc: string;
  corporateOnly?: boolean;
}[] = [
  {
    key: 'campaign_performance',
    label: 'Campaign Performance',
    desc: 'Weekly reports on reach, engagements and ROI',
  },
  {
    key: 'approval_updates',
    label: 'Approval Updates',
    desc: 'Notifications when campaigns or documents are approved or rejected',
  },
  {
    key: 'payment_alerts',
    label: 'Payment Alerts',
    desc: 'Alerts for upcoming payments, receipts and billing updates',
  },
  {
    key: 'new_packages',
    label: 'New Packages Available',
    desc: 'Get notified when new sponsorship packages are listed',
  },
  {
    key: 'weekly_digest',
    label: 'Weekly Digest',
    desc: 'A summary of your sponsorship activity every week',
  },
  {
    key: 'team_activity',
    label: 'Team Activity',
    desc: 'Notifications when team members make changes',
    corporateOnly: true,
  },
  {
    key: 'marketing_emails',
    label: 'Marketing Emails',
    desc: 'Promotional content, offers and platform updates',
  },
];

function amount(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SponsorSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [account, setAccount] = useState<SponsorAccountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const isIndividual = account?.sponsor_type === 'INDIVIDUAL';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [docs, setDocs] = useState<SponsorVerificationDocument[]>([]);
  const [docsError, setDocsError] = useState('');
  const [reuploadingType, setReuploadingType] =
    useState<SponsorVerificationDocType | null>(null);
  const reuploadInputRefs = useRef<
    Record<string, HTMLInputElement | null>
  >({});

  const [notifications, setNotifications] =
    useState<SponsorNotificationPreferences | null>(null);
  const [notificationsError, setNotificationsError] = useState('');
  const [savingNotificationKey, setSavingNotificationKey] = useState<
    string | null
  >(null);

  const [agreements, setAgreements] = useState<SponsorAgreement[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [profileResponse, accountsResponse] = await Promise.all([
          fetchProfile(),
          getSponsorAccounts(),
        ]);

        if (!active) return;

        const profileData = profileResponse.data as ProfileData;
        setProfile(profileData);
        setFirstName(profileData.first_name ?? '');
        setLastName(profileData.last_name ?? '');
        setPhone(profileData.phone_number ?? '');
        setLocation(profileData.location ?? '');
        setAccount(accountsResponse.data.results[0] ?? null);
      } catch {
        if (active) {
          setLoadError('We could not load your settings right now.');
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

  useEffect(() => {
    if (!account || account.sponsor_type !== 'CORPORATE') {
      return;
    }

    let active = true;

    getSponsorVerificationDocuments(account.id)
      .then((response) => {
        if (active) setDocs(response.data);
      })
      .catch(() => {
        if (active) {
          setDocsError('We could not load your verification documents.');
        }
      });

    return () => {
      active = false;
    };
  }, [account]);

  useEffect(() => {
    if (!account) return;

    let active = true;

    getSponsorNotificationPreferences(account.id)
      .then((response) => {
        if (active) setNotifications(response.data);
      })
      .catch(() => {
        if (active) {
          setNotificationsError(
            'We could not load your notification preferences.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [account]);

  useEffect(() => {
    if (!account || account.sponsor_type !== 'CORPORATE') return;

    let active = true;

    getSponsorAgreements({ sponsor_account: account.id })
      .then((response) => {
        if (active) setAgreements(response.data.results);
      })
      .catch(() => {
        // Billing summary is supplementary — SponsorPayments.tsx is the
        // source of truth and has its own error handling.
      });

    return () => {
      active = false;
    };
  }, [account]);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarError('');

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Please upload a JPEG, PNG, WEBP, or GIF image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('File size must not exceed 2MB.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const response = await uploadAvatar(file);
      setProfile((prev) =>
        prev
          ? { ...prev, avatar_url: (response.data as ProfileData).avatar_url }
          : prev,
      );
    } catch {
      setAvatarError('We could not upload this file. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError('');

    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
        location: location.trim(),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      setProfileError('We could not save your profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleReuploadDoc = async (
    docType: SponsorVerificationDocType,
    file: File,
  ) => {
    if (!account) return;

    setReuploadingType(docType);
    setDocsError('');

    try {
      const response = await uploadSponsorVerificationDocument(
        account.id,
        docType,
        file,
      );

      setDocs((prev) => [
        ...prev.filter((doc) => doc.doc_type !== docType),
        response.data,
      ]);
    } catch {
      setDocsError('We could not upload this document. Please try again.');
    } finally {
      setReuploadingType(null);
    }
  };

  const toggleNotification = async (
    key: keyof SponsorNotificationPreferences,
  ) => {
    if (!account || !notifications) return;

    const nextValue = !notifications[key];
    const previous = notifications;

    setNotifications({ ...notifications, [key]: nextValue });
    setSavingNotificationKey(key);
    setNotificationsError('');

    try {
      const response = await updateSponsorNotificationPreferences(
        account.id,
        { [key]: nextValue },
      );
      setNotifications(response.data);
    } catch {
      setNotifications(previous);
      setNotificationsError(
        'We could not save this preference. Please try again.',
      );
    } finally {
      setSavingNotificationKey(null);
    }
  };

  const billingConfirmedPaid = agreements.reduce(
    (total, agreement) =>
      total +
      agreement.payments
        .filter((payment) => payment.status === 'CONFIRMED')
        .reduce(
          (paymentTotal, payment) =>
            paymentTotal + amount(payment.amount_paid),
          0,
        ),
    0,
  );

  const billingTotalValue = agreements.reduce(
    (total, agreement) => total + amount(agreement.total_value),
    0,
  );

  const billingOutstanding = Math.max(
    billingTotalValue - billingConfirmedPaid,
    0,
  );

  if (loading) {
    return (
      <div className="ss-page">
        <div className="ss-layout">
          <SponsorSidebar />
          <main className="ss-main landing-page">
            <div className="ss-state">
              <FiRefreshCw className="ss-spin" size={28} />
              <h2>Loading settings</h2>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="ss-page">
        <div className="ss-layout">
          <SponsorSidebar />
          <main className="ss-main landing-page">
            <div className="ss-state">
              <FiAlertCircle size={28} />
              <h2>Settings unavailable</h2>
              <p>{loadError}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-page">
      <div className="ss-layout">
        <SponsorSidebar />

        <main className="ss-main landing-page">
          <div className="ss-header">
            <h1 className="ss-title">Settings</h1>
            <p className="ss-subtitle">
              Manage your {isIndividual ? 'personal' : 'corporate'} sponsor
              account settings and preferences.
            </p>
          </div>

          <div className="ss-body">
            <div className="ss-tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                if (tab.id === 'billing' && isIndividual) return null;
                return (
                  <button
                    key={tab.id}
                    className={`ss-tab ${activeTab === tab.id ? 'ss-tab-active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="ss-content">
              {activeTab === 'profile' && (
                <div className="ss-tab-content">
                  <div className="ss-section">
                    <h3 className="ss-section-title">
                      {isIndividual ? 'Profile Photo' : 'Company Logo'}
                    </h3>
                    <div className="ss-avatar-row">
                      <div className="ss-avatar">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Avatar"
                            className="ss-avatar-img"
                          />
                        ) : (
                          (firstName || 'S').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="ss-avatar-actions">
                        <input
                          type="file"
                          ref={avatarInputRef}
                          className="ss-avatar-input"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={(event) => void handleAvatarChange(event)}
                        />
                        <button
                          className="ss-btn-secondary"
                          disabled={isUploadingAvatar}
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          <FiCamera size={14} />{' '}
                          {isUploadingAvatar
                            ? 'Uploading…'
                            : `Upload ${isIndividual ? 'Photo' : 'Logo'}`}
                        </button>
                        <p className="ss-avatar-hint">
                          JPEG, PNG, WEBP or GIF. Max size 2MB.
                        </p>
                        {avatarError && (
                          <p className="ss-error-text">{avatarError}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ss-section">
                    <h3 className="ss-section-title">
                      {isIndividual
                        ? 'Personal Information'
                        : 'Contact Information'}
                    </h3>
                    <div className="ss-field-grid">
                      <div className="ss-field-group">
                        <label className="ss-label">First Name</label>
                        <div className="ss-input-wrap">
                          <FiUser size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="text"
                            value={firstName}
                            onChange={(event) =>
                              setFirstName(event.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="ss-field-group">
                        <label className="ss-label">Last Name</label>
                        <div className="ss-input-wrap">
                          <FiUser size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="text"
                            value={lastName}
                            onChange={(event) =>
                              setLastName(event.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="ss-field-group">
                        <label className="ss-label">Email Address</label>
                        <div className="ss-input-wrap">
                          <FiMail size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="email"
                            value={profile?.email ?? ''}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="ss-field-group">
                        <label className="ss-label">Phone Number</label>
                        <div className="ss-input-wrap">
                          <FiPhone size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="tel"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                          />
                        </div>
                      </div>
                      <div className="ss-field-group">
                        <label className="ss-label">City</label>
                        <div className="ss-input-wrap">
                          <FiMapPin size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="text"
                            value={location}
                            onChange={(event) =>
                              setLocation(event.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {!isIndividual && account && (
                      <div className="ss-field-grid ss-mt-16">
                        <div className="ss-field-group">
                          <label className="ss-label">Company Name</label>
                          <div className="ss-static-value">
                            {account.name}
                          </div>
                        </div>
                        <div className="ss-field-group">
                          <label className="ss-label">BRN</label>
                          <div className="ss-static-value">
                            {account.brn || '—'}
                          </div>
                        </div>
                        <div className="ss-field-group">
                          <label className="ss-label">TIN</label>
                          <div className="ss-static-value">
                            {account.tin || '—'}
                          </div>
                        </div>
                      </div>
                    )}

                    {profileError && (
                      <p className="ss-error-text">{profileError}</p>
                    )}

                    <div className="ss-save-row">
                      <button
                        className="ss-save-btn"
                        disabled={profileSaving}
                        onClick={() => void handleSaveProfile()}
                      >
                        {profileSaving ? (
                          'Saving…'
                        ) : profileSaved ? (
                          <>
                            <FiCheck size={15} /> Saved!
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>

                  {!isIndividual && account && (
                    <div className="ss-section">
                      <h3 className="ss-section-title">
                        Verification Documents
                      </h3>
                      <p className="ss-section-desc">
                        Your company&apos;s incorporation, TIN and logo
                        documents, and their review status.
                      </p>

                      {docsError && (
                        <p className="ss-error-text">{docsError}</p>
                      )}

                      <div className="ss-doc-list">
                        {(
                          Object.keys(
                            verificationDocLabels,
                          ) as SponsorVerificationDocType[]
                        ).map((docType) => {
                          const doc = docs.find(
                            (item) => item.doc_type === docType,
                          );
                          const isReuploading =
                            reuploadingType === docType;

                          return (
                            <div className="ss-doc-item" key={docType}>
                              {doc?.status === 'approved' ? (
                                <FiCheckCircle
                                  size={16}
                                  className="ss-doc-icon-approved"
                                />
                              ) : doc?.status === 'rejected' ? (
                                <FiXCircle
                                  size={16}
                                  className="ss-doc-icon-rejected"
                                />
                              ) : (
                                <FiClock
                                  size={16}
                                  className="ss-doc-icon-pending"
                                />
                              )}

                              <div className="ss-doc-info">
                                <span className="ss-doc-name">
                                  {verificationDocLabels[docType]}
                                </span>
                                {doc?.status === 'rejected' &&
                                  doc.rejection_reason && (
                                    <span className="ss-doc-reason">
                                      {doc.rejection_reason}
                                    </span>
                                  )}
                              </div>

                              <span
                                className={`ss-doc-status ${
                                  doc?.status
                                    ? `ss-doc-status-${doc.status}`
                                    : 'ss-doc-status-pending'
                                }`}
                              >
                                {doc
                                  ? doc.status.charAt(0).toUpperCase() +
                                    doc.status.slice(1)
                                  : 'Not submitted'}
                              </span>

                              <input
                                type="file"
                                accept="application/pdf,image/jpeg,image/jpg,image/png"
                                className="ss-doc-input"
                                ref={(el) => {
                                  reuploadInputRefs.current[docType] = el;
                                }}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (file) {
                                    void handleReuploadDoc(docType, file);
                                  }
                                  event.target.value = '';
                                }}
                              />
                              <button
                                className="ss-btn-secondary"
                                disabled={isReuploading}
                                onClick={() =>
                                  reuploadInputRefs.current[
                                    docType
                                  ]?.click()
                                }
                              >
                                {isReuploading
                                  ? 'Uploading…'
                                  : doc
                                    ? 'Re-upload'
                                    : 'Upload'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="ss-tab-content">
                  <div className="ss-section">
                    <h3 className="ss-section-title">Email Notifications</h3>
                    <p className="ss-section-desc">
                      Choose which email notifications you&apos;d like to
                      receive.
                    </p>

                    {notificationsError && (
                      <p className="ss-error-text">{notificationsError}</p>
                    )}

                    {!notifications ? (
                      <p className="ss-section-desc">
                        Loading your notification preferences…
                      </p>
                    ) : (
                      <div className="ss-toggle-list">
                        {notificationCopy
                          .filter(
                            (item) => !item.corporateOnly || !isIndividual,
                          )
                          .map((item) => (
                            <div className="ss-toggle-row" key={item.key}>
                              <div>
                                <div className="ss-toggle-label">
                                  {item.label}
                                </div>
                                <div className="ss-toggle-desc">
                                  {item.desc}
                                </div>
                              </div>
                              <button
                                className="ss-toggle"
                                disabled={savingNotificationKey === item.key}
                                onClick={() =>
                                  void toggleNotification(item.key)
                                }
                              >
                                {notifications[item.key] ? (
                                  <FiToggleRight
                                    size={28}
                                    className="ss-toggle-on"
                                  />
                                ) : (
                                  <FiToggleLeft
                                    size={28}
                                    className="ss-toggle-off"
                                  />
                                )}
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="ss-tab-content">
                  <div className="ss-section">
                    <h3 className="ss-section-title">Password</h3>
                    <p className="ss-section-desc">
                      Changing your password from here is coming soon.
                    </p>
                  </div>

                  <div className="ss-section">
                    <h3 className="ss-section-title">
                      Two-Factor Authentication
                    </h3>
                    <p className="ss-section-desc">
                      Two-factor authentication is not yet available for
                      sponsor accounts.
                    </p>
                  </div>

                  <div className="ss-section">
                    <h3 className="ss-section-title">Account</h3>
                    <p className="ss-section-desc">
                      Deactivating or deleting your sponsor account from here
                      is coming soon. Contact support if you need help with
                      your account.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && !isIndividual && (
                <div className="ss-tab-content">
                  <div className="ss-section">
                    <h3 className="ss-section-title">Payments Summary</h3>
                    <div className="ss-field-grid">
                      <div className="ss-field-group">
                        <label className="ss-label">Confirmed Paid</label>
                        <div className="ss-static-value">
                          {money(billingConfirmedPaid)}
                        </div>
                      </div>
                      <div className="ss-field-group">
                        <label className="ss-label">Outstanding</label>
                        <div className="ss-static-value">
                          {money(billingOutstanding)}
                        </div>
                      </div>
                    </div>
                    <div className="ss-save-row">
                      <button
                        className="ss-btn-secondary"
                        onClick={() => navigate('/sponsor/payments')}
                      >
                        View Payment History
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
