import { useState } from 'react';
import {
  Megaphone,
  X,
  Send,
  Calendar,
  Users,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  WorkspacePanel,
  adminWorkspaceStyles as styles,
} from '../../components/AdminWorkspaceLayout/AdminWorkspaceLayout';

type AnnouncementType = 'Alert' | 'Info';
type AnnouncementAudience = 'All Members' | 'Active Members' | 'Pending Members';

const emptyForm = {
  title: '',
  message: '',
  type: 'Info' as AnnouncementType,
  audience: 'All Members' as AnnouncementAudience,
  startDate: '',
  endDate: '',
};

export default function AnnouncementsCompose() {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!form.title.trim() || !form.message.trim()) {
      setSubmitError('Title and message are required.');
      return;
    }

    if (!form.startDate || !form.endDate) {
      setSubmitError('Start and end dates are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // await createClubAnnouncement({
      //   club: clubId,
      //   title: form.title.trim(),
      //   message: form.message.trim(),
      //   type: form.type,
      //   audience: form.audience,
      //   start_at: form.startDate,
      //   end_at: form.endDate,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitSuccess(true);
      setForm(emptyForm);

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch {
      setSubmitError('Failed to create announcement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setSubmitError('');
    setSubmitSuccess(false);
  };

  return (
    <WorkspacePanel
      eyebrow="Communications"
      title="Compose Announcement"
      description="Create and schedule announcements for your club members."
    >
      {submitSuccess && (
        <div className="announcement-success-banner">
          <Info size={18} />
          <span>Announcement created successfully!</span>
        </div>
      )}

      {submitError && (
        <div className="announcement-error-banner">
          <AlertTriangle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="announcement-compose-form">
        <div className="announcement-form-group">
          <label htmlFor="ann-title">
            <Megaphone size={16} />
            Title
          </label>
          <input
            id="ann-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter announcement title..."
            maxLength={200}
          />
          <small>{form.title.length}/200 characters</small>
        </div>

        <div className="announcement-form-group">
          <label htmlFor="ann-message">Message</label>
          <textarea
            id="ann-message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Enter announcement message..."
            rows={6}
            maxLength={1000}
          />
          <small>{form.message.length}/1000 characters</small>
        </div>

        <div className="announcement-form-row">
          <div className="announcement-form-group">
            <label htmlFor="ann-type">
              <Info size={16} />
              Type
            </label>
            <select
              id="ann-type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as AnnouncementType })}
            >
              <option value="Info">Info</option>
              <option value="Alert">Alert</option>
            </select>
          </div>

          <div className="announcement-form-group">
            <label htmlFor="ann-audience">
              <Users size={16} />
              Audience
            </label>
            <select
              id="ann-audience"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value as AnnouncementAudience })}
            >
              <option value="All Members">All Members</option>
              <option value="Active Members">Active Members</option>
              <option value="Pending Members">Pending Members</option>
            </select>
          </div>
        </div>

        <div className="announcement-form-row">
          <div className="announcement-form-group">
            <label htmlFor="ann-start">
              <Calendar size={16} />
              Start Date & Time
            </label>
            <input
              id="ann-start"
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>

          <div className="announcement-form-group">
            <label htmlFor="ann-end">
              <Calendar size={16} />
              End Date & Time
            </label>
            <input
              id="ann-end"
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="announcement-form-actions">
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isSubmitting}
          >
            <Send size={16} />
            {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </div>
      </form>
    </WorkspacePanel>
  );
}