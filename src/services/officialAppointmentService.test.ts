import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLeagueAdminAppointment,
  getLeagueAdminAppointments,
  getLeagueAdminScopes,
  getMyOfficialAppointments,
  respondToOfficialAppointment,
} from "./officialAppointmentService";

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("./apiClient", () => ({
  default: apiMock,
}));

describe("official appointment service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads league scopes and competition-scoped appointments", async () => {
    apiMock.get.mockResolvedValue({ data: { count: 0, results: [] } });

    await getLeagueAdminScopes();
    await getLeagueAdminAppointments({ competition: 42 });

    expect(apiMock.get).toHaveBeenNthCalledWith(
      1,
      "/dashboards/league-admin/scopes/",
    );
    expect(apiMock.get).toHaveBeenNthCalledWith(
      2,
      "/dashboards/league-admin/fixture-official-appointments/?competition=42",
    );
  });

  it("creates a scoped appointment and lets only the official respond", async () => {
    const payload = {
      match: 10,
      official: 4,
      role_type: "CENTRE_REFEREE",
      status: "ASSIGNED" as const,
    };
    apiMock.post.mockResolvedValue({ data: { id: 5 } });
    apiMock.patch.mockResolvedValue({ data: { id: 5, status: "ACCEPTED" } });
    apiMock.get.mockResolvedValue({ data: { count: 0, results: [] } });

    await createLeagueAdminAppointment(payload);
    await getMyOfficialAppointments();
    await respondToOfficialAppointment(5, { status: "ACCEPTED" });

    expect(apiMock.post).toHaveBeenCalledWith(
      "/dashboards/league-admin/fixture-official-appointments/",
      payload,
    );
    expect(apiMock.get).toHaveBeenCalledWith(
      "/dashboards/match-official/appointments/",
    );
    expect(apiMock.patch).toHaveBeenCalledWith(
      "/dashboards/match-official/appointments/5/response/",
      { status: "ACCEPTED" },
    );
  });
});
