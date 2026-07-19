import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OfficialAppointmentsPanel from "./OfficialAppointmentsPanel";

const unionMock = vi.hoisted(() => ({
  getUnionAdminManagementCompetitions: vi.fn(),
  getUnionAdminMatchOfficials: vi.fn(),
}));
const appointmentMock = vi.hoisted(() => ({
  getUnionAdminAppointments: vi.fn(),
  getMyOfficialAppointments: vi.fn(),
}));
const publicMock = vi.hoisted(() => ({ getPublicFixtures: vi.fn() }));

vi.mock("../../services/unionAdminService", () => unionMock);
vi.mock("../../services/officialAppointmentService", () => appointmentMock);
vi.mock("../../services/publicDashboardService", () => publicMock);

describe("OfficialAppointmentsPanel workspace scope", () => {
  it("clears the old Union competition and loads fixtures only for the new Union competition", async () => {
    appointmentMock.getUnionAdminAppointments.mockResolvedValue([]);
    unionMock.getUnionAdminMatchOfficials.mockResolvedValue({ results: [], role_options: [] });
    unionMock.getUnionAdminManagementCompetitions.mockResolvedValueOnce([{ id: 1, name: "Union A Cup", season: "A" }]).mockResolvedValueOnce([{ id: 2, name: "Union B Cup", season: "B" }]);
    publicMock.getPublicFixtures.mockResolvedValue([]);
    const { rerender } = render(<OfficialAppointmentsPanel mode="union" workspaceSlug="union-a" workspaceName="Union A" />);

    expect(await screen.findByText(/Union A Cup/)).toBeInTheDocument();
    rerender(<OfficialAppointmentsPanel mode="union" workspaceSlug="union-b" workspaceName="Union B" />);
    expect(await screen.findByText(/Union B Cup/)).toBeInTheDocument();
    await waitFor(() => expect(publicMock.getPublicFixtures).toHaveBeenLastCalledWith({ competitionId: 2 }));
  });
});
