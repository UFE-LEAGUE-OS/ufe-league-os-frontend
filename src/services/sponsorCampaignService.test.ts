import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  createSponsorCampaignDraft,
  deleteSponsorCampaignAsset,
  getSponsorCampaign,
  saveSponsorCampaignDraft,
  submitSponsorCampaign,
  uploadSponsorCampaignAsset,
} from './sponsorCampaignService';

const apiClientMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./apiClient.js', () => ({
  default: apiClientMock,
}));

describe('sponsorCampaignService', () => {
  beforeEach(() => {
    apiClientMock.get.mockReset();
    apiClientMock.post.mockReset();
    apiClientMock.put.mockReset();
    apiClientMock.delete.mockReset();
  });

  it('creates a campaign draft', async () => {
    const payload = {
      sponsor_account: 1,
      name: 'Nile Special Brand Awareness',
      goals: ['brand-awareness'],
    };

    apiClientMock.post.mockResolvedValue({ data: { id: 5 } });

    await createSponsorCampaignDraft(payload);

    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/sponsorships/campaigns/',
      payload,
    );
  });

  it('saves an existing campaign draft', async () => {
    const payload = {
      sponsor_account: 1,
      name: 'Nile Special Brand Awareness',
    };

    apiClientMock.put.mockResolvedValue({ data: { id: 5 } });

    await saveSponsorCampaignDraft(5, payload);

    expect(apiClientMock.put).toHaveBeenCalledWith(
      '/sponsorships/campaigns/5/',
      payload,
    );
  });

  it('loads a single campaign', async () => {
    apiClientMock.get.mockResolvedValue({ data: { id: 5 } });

    await getSponsorCampaign(5);

    expect(apiClientMock.get).toHaveBeenCalledWith(
      '/sponsorships/campaigns/5/',
    );
  });

  it('submits a campaign for approval', async () => {
    apiClientMock.post.mockResolvedValue({ data: { id: 5, status: 'SUBMITTED' } });

    await submitSponsorCampaign(5);

    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/sponsorships/campaigns/5/submit/',
    );
  });

  it('uploads a campaign asset as multipart form data', async () => {
    const file = new File(['content'], 'banner.png', { type: 'image/png' });

    apiClientMock.post.mockResolvedValue({ data: { id: 9 } });

    await uploadSponsorCampaignAsset(5, file, 'Landing Page Hero');

    expect(apiClientMock.post).toHaveBeenCalledWith(
      '/sponsorships/campaigns/5/assets/',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    const sentFormData = apiClientMock.post.mock.calls[0][1] as FormData;
    expect(sentFormData.get('file')).toBe(file);
    expect(sentFormData.get('placement')).toBe('Landing Page Hero');
  });

  it('deletes a campaign asset', async () => {
    apiClientMock.delete.mockResolvedValue({ data: {} });

    await deleteSponsorCampaignAsset(5, 9);

    expect(apiClientMock.delete).toHaveBeenCalledWith(
      '/sponsorships/campaigns/5/assets/9/',
    );
  });
});
