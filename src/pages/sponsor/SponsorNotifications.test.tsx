import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../../services/notificationService';
import SponsorNotifications from './SponsorNotifications';

vi.mock('../../components/SponsorSidebar', () => ({
  default: () => <aside>Sponsor Sidebar</aside>,
}));

vi.mock('../../services/notificationService', () => ({
  getNotificationInbox: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

const getInboxMock = vi.mocked(getNotificationInbox);
const markReadMock = vi.mocked(markNotificationRead);
const markAllReadMock = vi.mocked(markAllNotificationsRead);

const approvedNotification = {
  id: 1,
  event_type: 'CAMPAIGN_APPROVED',
  event_label: 'Campaign Approved',
  category: 'SPONSORSHIP',
  category_label: 'Sponsorship',
  priority: 'NORMAL',
  priority_label: 'Normal',
  title: 'Your campaign was approved',
  message: 'Matchday Activation has been approved and is now live.',
  action_url: '/sponsor/campaigns/901',
  metadata: {},
  is_read: false,
  read_at: null,
  created_at: '2026-07-14T10:00:00Z',
} as AppNotification;

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/sponsor/notifications']}>
      <Routes>
        <Route
          path="/sponsor/notifications"
          element={<SponsorNotifications />}
        />
        <Route
          path="/sponsor/campaigns/901"
          element={<div>Campaign Detail Page</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SponsorNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and shows sponsorship notifications', async () => {
    getInboxMock.mockResolvedValue({
      count: 1,
      limit: 50,
      offset: 0,
      unread_count: 1,
      results: [approvedNotification],
    });

    renderPage();

    expect(
      await screen.findByText('Your campaign was approved'),
    ).toBeInTheDocument();

    expect(getInboxMock).toHaveBeenCalledWith({
      category: 'SPONSORSHIP',
      unreadOnly: false,
    });
  });

  it('shows an empty state when there are no notifications', async () => {
    getInboxMock.mockResolvedValue({
      count: 0,
      limit: 50,
      offset: 0,
      unread_count: 0,
      results: [],
    });

    renderPage();

    expect(
      await screen.findByText('No notifications'),
    ).toBeInTheDocument();
  });

  it('marks a notification read and navigates to its action_url on click', async () => {
    getInboxMock.mockResolvedValue({
      count: 1,
      limit: 50,
      offset: 0,
      unread_count: 1,
      results: [approvedNotification],
    });

    markReadMock.mockResolvedValue({
      ...approvedNotification,
      is_read: true,
      read_at: '2026-07-15T10:00:00Z',
    });

    renderPage();

    fireEvent.click(
      await screen.findByText('Your campaign was approved'),
    );

    await waitFor(() => {
      expect(markReadMock).toHaveBeenCalledWith(1);
    });

    expect(
      await screen.findByText('Campaign Detail Page'),
    ).toBeInTheDocument();
  });

  it('marks all notifications read', async () => {
    getInboxMock.mockResolvedValue({
      count: 1,
      limit: 50,
      offset: 0,
      unread_count: 1,
      results: [approvedNotification],
    });

    markAllReadMock.mockResolvedValue({
      updated_count: 1,
      unread_count: 0,
    });

    renderPage();

    fireEvent.click(
      await screen.findByRole('button', { name: /mark all read/i }),
    );

    await waitFor(() => {
      expect(markAllReadMock).toHaveBeenCalledTimes(1);
    });
  });
});
