import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import UnionMatchOfficialsPanel from "./UnionMatchOfficialsPanel";

vi.mock("../../UnionOperationalPanels/UnionOperationalPanels", () => ({
  UnionOfficialReadinessPanel: ({ workspaceSlug }: { workspaceSlug: string }) => <section><h2>Official readiness</h2><p>Readiness for {workspaceSlug}</p></section>,
}));
vi.mock("../../UnionAdminRefereesPanel/UnionAdminRefereesPanel", () => ({
  default: ({ workspaceSlug }: { workspaceSlug: string }) => <section><h2>Official directory</h2><p>Officials for {workspaceSlug}</p></section>,
}));
vi.mock("../../OfficialAppointmentsPanel/OfficialAppointmentsPanel", () => ({
  default: ({ workspaceSlug, mode }: { workspaceSlug: string; mode: string }) => <section><h2>Appointments</h2><p>{mode} appointments for {workspaceSlug}</p></section>,
}));

const props = {
  workspaceSlug: "uru",
  workspaceName: "Uganda Rugby Union",
  workspaceSport: "RUGBY",
  workspaceRole: "UNION_ADMIN" as const,
  permissions: ["union.referees.manage", "union.official.appointments.view"] as const,
};

describe("UnionMatchOfficialsPanel", () => {
  it("shows only connected administrative tabs with accessible selection", () => {
    render(<UnionMatchOfficialsPanel {...props} permissions={[...props.permissions]} />);
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.queryByRole("tab", { name: "Availability" })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview & Readiness" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
  });

  it("uses Union administrative appointment mode and active workspace", () => {
    render(<UnionMatchOfficialsPanel {...props} permissions={[...props.permissions]} />);
    fireEvent.click(screen.getByRole("tab", { name: "Appointments" }));
    expect(screen.getByText("union appointments for uru")).toBeInTheDocument();
  });

  it("resets to readiness when the workspace changes", () => {
    const view = render(<UnionMatchOfficialsPanel {...props} permissions={[...props.permissions]} />);
    fireEvent.click(screen.getByRole("tab", { name: "Official Directory" }));
    expect(screen.getByText("Officials for uru")).toBeInTheDocument();
    view.rerender(<UnionMatchOfficialsPanel {...props} workspaceSlug="fufa" workspaceName="FUFA" permissions={[...props.permissions]} />);
    expect(screen.getByText("Readiness for fufa")).toBeInTheDocument();
  });
});
