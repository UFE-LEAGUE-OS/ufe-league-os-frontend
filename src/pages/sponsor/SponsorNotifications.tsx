import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiBell,
  FiCheckCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  getNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../../services/notificationService';
import './SponsorNotifications.css';

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export default function SponsorNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await getNotificationInbox({
          category: 'SPONSORSHIP',
          unreadOnly,
        });

        if (active) {
          setNotifications(response.results);
          setUnreadCount(response.unread_count);
        }
      } catch {
        if (active) {
          setError('We could not load your notifications.');
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
  }, [unreadOnly]);

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return notifications;
    }

    return notifications.filter((notification) =>
      `${notification.title} ${notification.message}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [notifications, search]);

  const handleOpen = async (notification: AppNotification) => {
    if (!notification.is_read) {
      try {
        const updated = await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        // Non-critical — the sponsor can still open the notification even
        // if marking it read fails; it will just still show as unread.
      }
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const response = await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(response.unread_count);
    } catch {
      setError('We could not mark all notifications as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="snf-page">
      <div className="snf-layout">
        <SponsorSidebar />

        <main className="snf-main">
          <header className="snf-header">
            <div>
              <span>Sponsorship updates</span>
              <h1>Notifications</h1>
              <p>
                Approvals, rejections and other updates on your sponsorship
                agreements and campaigns.
              </p>
            </div>

            <button
              type="button"
              className="snf-mark-all-btn"
              onClick={() => void handleMarkAllRead()}
              disabled={unreadCount === 0 || markingAll}
            >
              <FiCheckCircle size={14} />
              {markingAll ? 'Marking…' : 'Mark all read'}
            </button>
          </header>

          {loading && (
            <div className="snf-state">
              <FiRefreshCw className="snf-spin" size={28} />
              <h2>Loading notifications</h2>
            </div>
          )}

          {!loading && error && (
            <div className="snf-state">
              <FiAlertCircle size={28} />
              <h2>Notifications unavailable</h2>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="snf-toolbar">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <button
                  type="button"
                  className={`snf-unread-toggle ${unreadOnly ? 'snf-unread-toggle-active' : ''}`}
                  onClick={() => setUnreadOnly((value) => !value)}
                >
                  Unread only
                </button>
              </div>

              {filteredNotifications.length === 0 ? (
                <div className="snf-state">
                  <FiBell size={28} />
                  <h2>No notifications</h2>
                  <p>
                    {unreadOnly
                      ? 'You have no unread sponsorship notifications.'
                      : "You'll see updates here when your campaigns or agreements are reviewed."}
                  </p>
                </div>
              ) : (
                <div className="snf-list">
                  {filteredNotifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      className={`snf-item ${notification.is_read ? '' : 'snf-item-unread'}`}
                      onClick={() => void handleOpen(notification)}
                    >
                      <div className="snf-item-icon">
                        <FiBell size={16} />
                      </div>

                      <div className="snf-item-body">
                        <div className="snf-item-title-row">
                          <span className="snf-item-title">
                            {notification.title}
                          </span>
                          {!notification.is_read && (
                            <span className="snf-item-unread-dot" />
                          )}
                        </div>
                        <p className="snf-item-message">
                          {notification.message}
                        </p>
                        <span className="snf-item-time">
                          {formatTimestamp(notification.created_at)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
