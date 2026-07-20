import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  deleteSponsorCampaignAsset,
  uploadSponsorCampaignAsset,
} from '../../services/sponsorCampaignService';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import CampaignAssets from './CampaignAssets';

vi.mock(
  '../../components/SponsorSidebar',
  () => ({
    default: () => <aside>Sponsor Sidebar</aside>,
  }),
);

vi.mock(
  '../../services/sponsorCampaignService',
  async () => {
    const actual = await vi.importActual<
      typeof import('../../services/sponsorCampaignService')
    >('../../services/sponsorCampaignService');

    return {
      ...actual,
      uploadSponsorCampaignAsset: vi.fn(),
      deleteSponsorCampaignAsset: vi.fn(),
    };
  },
);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/sponsor/campaigns/new/assets']}>
      <CampaignAssets />
    </MemoryRouter>,
  );
}

describe('CampaignAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSponsorCampaignStore.setState({
      campaignId: 1,
      assets: [],
    });
  });

  it('rejects a file with an unsupported type without uploading it', async () => {
    renderPage();

    const input = document.querySelector('.ca-file-input') as HTMLInputElement;
    const badFile = new File(['hello'], 'notes.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [badFile] } });

    await waitFor(() => {
      expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
    });

    expect(uploadSponsorCampaignAsset).not.toHaveBeenCalled();
  });

  it('rejects an oversized image without uploading it', async () => {
    renderPage();

    const input = document.querySelector('.ca-file-input') as HTMLInputElement;
    const bigFile = new File(
      [new Uint8Array(6 * 1024 * 1024)],
      'big-banner.png',
      { type: 'image/png' },
    );

    fireEvent.change(input, { target: { files: [bigFile] } });

    await waitFor(() => {
      expect(screen.getByText(/too large/i)).toBeInTheDocument();
    });

    expect(uploadSponsorCampaignAsset).not.toHaveBeenCalled();
  });

  it('uploads a valid file and lists it', async () => {
    vi.mocked(uploadSponsorCampaignAsset).mockResolvedValue({
      data: {
        id: 10,
        file_name: 'banner.png',
        file_url: 'https://cdn.example.com/banner.png',
        file_type: 'image/png',
        size_bytes: 1024,
        placement: '',
        uploaded_at: '2026-07-20T00:00:00Z',
      },
    } as never);

    renderPage();

    const input = document.querySelector('.ca-file-input') as HTMLInputElement;
    const goodFile = new File(['hello'], 'banner.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [goodFile] } });

    await waitFor(() => {
      expect(uploadSponsorCampaignAsset).toHaveBeenCalledWith(1, goodFile);
    });

    expect(await screen.findByText('banner.png')).toBeInTheDocument();
  });

  it('removes an uploaded asset', async () => {
    vi.mocked(deleteSponsorCampaignAsset).mockResolvedValue({ data: {} } as never);
    useSponsorCampaignStore.setState({
      campaignId: 1,
      assets: [
        {
          id: 10,
          file_name: 'banner.png',
          file_url: 'https://cdn.example.com/banner.png',
          file_type: 'image/png',
          size_bytes: 1024,
          placement: '',
          uploaded_at: '2026-07-20T00:00:00Z',
        },
      ],
    });

    renderPage();

    fireEvent.click(screen.getByLabelText('Remove banner.png'));

    await waitFor(() => {
      expect(deleteSponsorCampaignAsset).toHaveBeenCalledWith(1, 10);
    });

    expect(screen.queryByText('banner.png')).not.toBeInTheDocument();
  });
});
