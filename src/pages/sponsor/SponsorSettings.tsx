import { useState } from 'react';
import {
  FiUser,
  FiBell,
  FiShield,
  FiCreditCard,
  FiCamera,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiToggleLeft,
  FiToggleRight,
  FiLock,
  FiTrash2,
  FiAlertTriangle,
  FiCheck,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useAuthStore } from '../../store/authStore';
import './SponsorSettings.css';

type Tab = 'profile' | 'notifications' | 'security' | 'billing';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'security', label: 'Security', icon: FiShield },
  { id: 'billing', label: 'Billing & Payments', icon: FiCreditCard },
];

const sportOptions = [
  'Football', 'Rugby', 'Basketball', 'Athletics',
  'Swimming', 'Cricket', 'Volleyball', 'Netball',
];

const budgetOptions = [
  'Under UGX 1M', 'UGX 1M – 5M', 'UGX 5M – 20M', 'Above UGX 20M',
];

const sponsorshipTypeOptions = [
  'Club Sponsorship', 'League Sponsorship', 'Player Sponsorship',
  'Event Sponsorship', 'Grassroots Development', 'Digital Campaigns',
];

export default function SponsorSettings() {
  const user = useAuthStore((state) => state.user);
  const sponsorType = (user?.sponsor_type as string) ?? 'CORPORATE';
  const isIndividual = sponsorType === 'INDIVIDUAL';

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    fullName: isIndividual ? 'Jane Kintu' : 'Nile Breweries Limited',
    email: isIndividual ? 'jane.kintu@email.com' : 'partnerships@nilebreweries.co.ug',
    phone: '+256 700 123 456',
    website: isIndividual ? '' : 'https://www.nilebreweries.co.ug',
    city: 'Kampala',
    country: 'Uganda',
    bio: '',
    preferredBudget: 'UGX 1M – 5M',
    preferredSports: ['Football', 'Rugby'],
    preferredTypes: ['Club Sponsorship'],
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    campaignPerformance: true,
    approvalUpdates: true,
    paymentAlerts: true,
    newPackages: false,
    weeklyDigest: true,
    teamActivity: !isIndividual,
    marketingEmails: false,
  });

  // Security state
  const [security, setSecurity] = useState({
    twoFactor: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleSport = (sport: string) => {
    setProfile((prev) => ({
      ...prev,
      preferredSports: prev.preferredSports.includes(sport)
        ? prev.preferredSports.filter((s) => s !== sport)
        : [...prev.preferredSports, sport],
    }));
  };

  const toggleType = (type: string) => {
    setProfile((prev) => ({
      ...prev,
      preferredTypes: prev.preferredTypes.includes(type)
        ? prev.preferredTypes.filter((t) => t !== type)
        : [...prev.preferredTypes, type],
    }));
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="ss-page">
      <div className="ss-layout">
        <SponsorSidebar />

        <main className="ss-main landing-page">

          {/* Header */}
          <div className="ss-header">
            <h1 className="ss-title">Settings</h1>
            <p className="ss-subtitle">
              Manage your {isIndividual ? 'personal' : 'corporate'} sponsor account settings and preferences.
            </p>
          </div>

          <div className="ss-body">

            {/* Tabs */}
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

            {/* Tab content */}
            <div className="ss-content">

              {/* ── Profile Tab ── */}
              {activeTab === 'profile' && (
                <div className="ss-tab-content">

                  {/* Avatar */}
                  <div className="ss-section">
                    <h3 className="ss-section-title">
                      {isIndividual ? 'Profile Photo' : 'Company Logo'}
                    </h3>
                    <div className="ss-avatar-row">
                      <div className="ss-avatar">
                        {profile.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ss-avatar-actions">
                        <button className="ss-btn-secondary">
                          <FiCamera size={14} /> Upload {isIndividual ? 'Photo' : 'Logo'}
                        </button>
                        <p className="ss-avatar-hint">
                          {isIndividual
                            ? 'JPG, PNG or GIF. Max size 2MB.'
                            : 'PNG, JPG or SVG. Recommended 512×512px. Max 5MB.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="ss-section">
                    <h3 className="ss-section-title">
                      {isIndividual ? 'Personal Information' : 'Company Information'}
                    </h3>
                    <div className="ss-field-grid">
                      <div className="ss-field-group">
                        <label className="ss-label">
                          {isIndividual ? 'Full Name' : 'Company Name'}
                        </label>
                        <div className="ss-input-wrap">
                          <FiUser size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="text"
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
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
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
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
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      {!isIndividual && (
                        <div className="ss-field-group">
                          <label className="ss-label">Company Website</label>
                          <div className="ss-input-wrap">
                            <FiGlobe size={15} className="ss-input-icon" />
                            <input
                              className="ss-input"
                              type="url"
                              value={profile.website}
                              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                      <div className="ss-field-group">
                        <label className="ss-label">City</label>
                        <div className="ss-input-wrap">
                          <FiMapPin size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="text"
                            value={profile.city}
                            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="ss-field-group">
                        <label className="ss-label">Country</label>
                        <div className="ss-input-wrap">
                          <FiGlobe size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="text"
                            value={profile.country}
                            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sponsorship Preferences */}
                  <div className="ss-section">
                    <h3 className="ss-section-title">Sponsorship Preferences</h3>

                    <div className="ss-field-group ss-field-full">
                      <label className="ss-label">Default Budget Range</label>
                      <div className="ss-budget-grid">
                        {budgetOptions.map((b) => (
                          <div
                            key={b}
                            className={`ss-budget-option ${profile.preferredBudget === b ? 'ss-budget-selected' : ''}`}
                            onClick={() => setProfile({ ...profile, preferredBudget: b })}
                          >
                            <div className={`ss-radio ${profile.preferredBudget === b ? 'ss-radio-on' : ''}`} />
                            {b}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="ss-field-group ss-field-full">
                      <label className="ss-label">Preferred Sports</label>
                      <div className="ss-chips-grid">
                        {sportOptions.map((sport) => (
                          <div
                            key={sport}
                            className={`ss-chip ${profile.preferredSports.includes(sport) ? 'ss-chip-selected' : ''}`}
                            onClick={() => toggleSport(sport)}
                          >
                            {profile.preferredSports.includes(sport) && <FiCheck size={12} />}
                            {sport}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="ss-field-group ss-field-full">
                      <label className="ss-label">Preferred Sponsorship Types</label>
                      <div className="ss-chips-grid">
                        {sponsorshipTypeOptions.map((type) => (
                          <div
                            key={type}
                            className={`ss-chip ${profile.preferredTypes.includes(type) ? 'ss-chip-selected' : ''}`}
                            onClick={() => toggleType(type)}
                          >
                            {profile.preferredTypes.includes(type) && <FiCheck size={12} />}
                            {type}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="ss-save-row">
                    <button className="ss-save-btn" onClick={handleSave}>
                      {saved ? <><FiCheck size={15} /> Saved!</> : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Notifications Tab ── */}
              {activeTab === 'notifications' && (
                <div className="ss-tab-content">
                  <div className="ss-section">
                    <h3 className="ss-section-title">Email Notifications</h3>
                    <p className="ss-section-desc">
                      Choose which email notifications you'd like to receive.
                    </p>
                    <div className="ss-toggle-list">
                      <div className="ss-toggle-row">
                        <div>
                          <div className="ss-toggle-label">Campaign Performance</div>
                          <div className="ss-toggle-desc">Weekly reports on reach, engagements and ROI</div>
                        </div>
                        <button
                          className="ss-toggle"
                          onClick={() => toggleNotification('campaignPerformance')}
                        >
                          {notifications.campaignPerformance
                            ? <FiToggleRight size={28} className="ss-toggle-on" />
                            : <FiToggleLeft size={28} className="ss-toggle-off" />}
                        </button>
                      </div>
                      <div className="ss-toggle-row">
                        <div>
                          <div className="ss-toggle-label">Approval Updates</div>
                          <div className="ss-toggle-desc">Notifications when campaigns or documents are approved or rejected</div>
                        </div>
                        <button
                          className="ss-toggle"
                          onClick={() => toggleNotification('approvalUpdates')}
                        >
                          {notifications.approvalUpdates
                            ? <FiToggleRight size={28} className="ss-toggle-on" />
                            : <FiToggleLeft size={28} className="ss-toggle-off" />}
                        </button>
                      </div>
                      <div className="ss-toggle-row">
                        <div>
                          <div className="ss-toggle-label">Payment Alerts</div>
                          <div className="ss-toggle-desc">Alerts for upcoming payments, receipts and billing updates</div>
                        </div>
                        <button
                          className="ss-toggle"
                          onClick={() => toggleNotification('paymentAlerts')}
                        >
                          {notifications.paymentAlerts
                            ? <FiToggleRight size={28} className="ss-toggle-on" />
                            : <FiToggleLeft size={28} className="ss-toggle-off" />}
                        </button>
                      </div>
                      <div className="ss-toggle-row">
                        <div>
                          <div className="ss-toggle-label">New Packages Available</div>
                          <div className="ss-toggle-desc">Get notified when new sponsorship packages are listed</div>
                        </div>
                        <button
                          className="ss-toggle"
                          onClick={() => toggleNotification('newPackages')}
                        >
                          {notifications.newPackages
                            ? <FiToggleRight size={28} className="ss-toggle-on" />
                            : <FiToggleLeft size={28} className="ss-toggle-off" />}
                        </button>
                      </div>
                      <div className="ss-toggle-row">
                        <div>
                          <div className="ss-toggle-label">Weekly Digest</div>
                          <div className="ss-toggle-desc">A summary of your sponsorship activity every week</div>
                        </div>
                        <button
                          className="ss-toggle"
                          onClick={() => toggleNotification('weeklyDigest')}
                        >
                          {notifications.weeklyDigest
                            ? <FiToggleRight size={28} className="ss-toggle-on" />
                            : <FiToggleLeft size={28} className="ss-toggle-off" />}
                        </button>
                      </div>
                      {!isIndividual && (
                        <div className="ss-toggle-row">
                          <div>
                            <div className="ss-toggle-label">Team Activity</div>
                            <div className="ss-toggle-desc">Notifications when team members make changes</div>
                          </div>
                          <button
                            className="ss-toggle"
                            onClick={() => toggleNotification('teamActivity')}
                          >
                            {notifications.teamActivity
                              ? <FiToggleRight size={28} className="ss-toggle-on" />
                              : <FiToggleLeft size={28} className="ss-toggle-off" />}
                          </button>
                        </div>
                      )}
                      <div className="ss-toggle-row">
                        <div>
                          <div className="ss-toggle-label">Marketing Emails</div>
                          <div className="ss-toggle-desc">Promotional content, offers and platform updates</div>
                        </div>
                        <button
                          className="ss-toggle"
                          onClick={() => toggleNotification('marketingEmails')}
                        >
                          {notifications.marketingEmails
                            ? <FiToggleRight size={28} className="ss-toggle-on" />
                            : <FiToggleLeft size={28} className="ss-toggle-off" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="ss-save-row">
                    <button className="ss-save-btn" onClick={handleSave}>
                      {saved ? <><FiCheck size={15} /> Saved!</> : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Security Tab ── */}
              {activeTab === 'security' && (
                <div className="ss-tab-content">

                  {/* Change Password */}
                  <div className="ss-section">
                    <h3 className="ss-section-title">Change Password</h3>
                    <div className="ss-field-grid">
                      <div className="ss-field-group ss-field-full">
                        <label className="ss-label">Current Password</label>
                        <div className="ss-input-wrap">
                          <FiLock size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="password"
                            placeholder="Enter current password"
                            value={security.currentPassword}
                            onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="ss-field-group">
                        <label className="ss-label">New Password</label>
                        <div className="ss-input-wrap">
                          <FiLock size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="password"
                            placeholder="Enter new password"
                            value={security.newPassword}
                            onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="ss-field-group">
                        <label className="ss-label">Confirm New Password</label>
                        <div className="ss-input-wrap">
                          <FiLock size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="password"
                            placeholder="Confirm new password"
                            value={security.confirmPassword}
                            onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <button className="ss-save-btn ss-mt-16" onClick={handleSave}>
                      {saved ? <><FiCheck size={15} /> Updated!</> : 'Update Password'}
                    </button>
                  </div>

                  {/* Two Factor */}
                  <div className="ss-section">
                    <h3 className="ss-section-title">Two-Factor Authentication</h3>
                    <div className="ss-2fa-card">
                      <div className="ss-2fa-info">
                        <FiShield size={20} className="ss-2fa-icon" />
                        <div>
                          <div className="ss-2fa-label">
                            Two-Factor Authentication is currently{' '}
                            <span className={security.twoFactor ? 'ss-2fa-on' : 'ss-2fa-off'}>
                              {security.twoFactor ? 'enabled' : 'disabled'}
                            </span>
                          </div>
                          <div className="ss-2fa-desc">
                            Add an extra layer of security to your account by requiring a verification code in addition to your password.
                          </div>
                        </div>
                      </div>
                      <button
                        className={security.twoFactor ? 'ss-btn-secondary' : 'ss-save-btn'}
                        onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                      >
                        {security.twoFactor ? 'Disable 2FA' : 'Enable 2FA'}
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="ss-section ss-danger-section">
                    <h3 className="ss-section-title ss-danger-title">
                      <FiAlertTriangle size={16} /> Danger Zone
                    </h3>
                    <div className="ss-danger-card">
                      <div>
                        <div className="ss-danger-label">Deactivate Account</div>
                        <div className="ss-danger-desc">
                          Temporarily disable your sponsor account. You can reactivate it at any time.
                        </div>
                      </div>
                      <button className="ss-btn-warning">Deactivate</button>
                    </div>
                    <div className="ss-danger-card">
                      <div>
                        <div className="ss-danger-label">Delete Account</div>
                        <div className="ss-danger-desc">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </div>
                      </div>
                      <button className="ss-btn-danger">
                        <FiTrash2 size={14} /> Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Billing Tab (Corporate only) ── */}
              {activeTab === 'billing' && !isIndividual && (
                <div className="ss-tab-content">

                  {/* Payment Method */}
                  <div className="ss-section">
                    <h3 className="ss-section-title">Payment Method</h3>
                    <div className="ss-payment-card">
                      <div className="ss-payment-icon">💳</div>
                      <div className="ss-payment-info">
                        <div className="ss-payment-name">Mobile Money — MTN</div>
                        <div className="ss-payment-detail">+256 700 123 456 · Added Jan 2024</div>
                      </div>
                      <span className="ss-payment-default">Default</span>
                      <button className="ss-btn-secondary">Change</button>
                    </div>
                    <button className="ss-btn-secondary ss-mt-16">
                      + Add Payment Method
                    </button>
                  </div>

                  {/* Invoice Preferences */}
                  <div className="ss-section">
                    <h3 className="ss-section-title">Invoice Preferences</h3>
                    <div className="ss-field-grid">
                      <div className="ss-field-group">
                        <label className="ss-label">Billing Name</label>
                        <div className="ss-input-wrap">
                          <FiUser size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="text"
                            defaultValue="Nile Breweries Limited"
                          />
                        </div>
                      </div>
                      <div className="ss-field-group">
                        <label className="ss-label">Billing Email</label>
                        <div className="ss-input-wrap">
                          <FiMail size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="email"
                            defaultValue="billing@nilebreweries.co.ug"
                          />
                        </div>
                      </div>
                      <div className="ss-field-group ss-field-full">
                        <label className="ss-label">Billing Address</label>
                        <div className="ss-input-wrap">
                          <FiMapPin size={15} className="ss-input-icon" />
                          <input
                            className="ss-input"
                            type="text"
                            defaultValue="Plot 1, Kampala Road, Kampala, Uganda"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="ss-save-row">
                      <button className="ss-save-btn" onClick={handleSave}>
                        {saved ? <><FiCheck size={15} /> Saved!</> : 'Save Billing Info'}
                      </button>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div className="ss-section">
                    <h3 className="ss-section-title">Recent Invoices</h3>
                    <div className="ss-invoice-list">
                      {[
                        { id: 'INV-2024-001', date: '01 May 2024', amount: 'UGX 50,000,000', status: 'Paid' },
                        { id: 'INV-2024-002', date: '01 Apr 2024', amount: 'UGX 30,000,000', status: 'Paid' },
                        { id: 'INV-2024-003', date: '01 Mar 2024', amount: 'UGX 20,000,000', status: 'Pending' },
                      ].map((inv) => (
                        <div key={inv.id} className="ss-invoice-row">
                          <span className="ss-invoice-id">{inv.id}</span>
                          <span className="ss-invoice-date">{inv.date}</span>
                          <span className="ss-invoice-amount">{inv.amount}</span>
                          <span className={`ss-invoice-status ${inv.status === 'Paid' ? 'ss-invoice-paid' : 'ss-invoice-pending'}`}>
                            {inv.status}
                          </span>
                          <button className="ss-btn-secondary ss-invoice-dl">Download</button>
                        </div>
                      ))}
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