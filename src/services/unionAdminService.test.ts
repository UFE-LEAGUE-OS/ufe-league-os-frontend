import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createUnionAdminMatchOfficial,
  deleteUnionAdminMatchOfficial,
  getUnionAdminMatchOfficials,
  updateUnionAdminMatchOfficial,
} from "./unionAdminService.js";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("./apiClient.js", () => ({
  default: apiMock,
}));

describe("unionAdminService referee management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads sport-specific match officials with an optional search query", async () => {
    apiMock.get.mockResolvedValue({
      data: { count: 0, sport: "RUGBY", role_options: [], results: [] },
    });

    await getUnionAdminMatchOfficials("uru", "centre referee");

    expect(apiMock.get).toHaveBeenCalledWith(
      "/dashboards/union-admin/referees/?workspace=uru&q=centre+referee",
    );
  });

  it("creates, updates and removes union match officials through the management endpoints", async () => {
    const payload = {
      workspace: "uru",
      full_name: "Amina Official",
      role_type: "CENTRE_REFEREE",
      primary_sport: "RUGBY",
    };

    apiMock.post.mockResolvedValue({ data: { id: 7 } });
    apiMock.patch.mockResolvedValue({ data: { id: 7 } });
    apiMock.delete.mockResolvedValue({ data: {} });

    await createUnionAdminMatchOfficial(payload);
    await updateUnionAdminMatchOfficial(7, payload);
    await deleteUnionAdminMatchOfficial(7, "uru");

    expect(apiMock.post).toHaveBeenCalledWith(
      "/dashboards/union-admin/referees/",
      payload,
    );
    expect(apiMock.patch).toHaveBeenCalledWith(
      "/dashboards/union-admin/referees/7/",
      payload,
    );
    expect(apiMock.delete).toHaveBeenCalledWith(
      "/dashboards/union-admin/referees/7/",
      { data: { workspace: "uru" } },
    );
  });
});
