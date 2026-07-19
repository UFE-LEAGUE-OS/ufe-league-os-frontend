import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UnionAdminRefereesPanel from "./UnionAdminRefereesPanel";

const serviceMock = vi.hoisted(() => ({
  getUnionAdminMatchOfficials: vi.fn(),
  createUnionAdminMatchOfficial: vi.fn(),
  updateUnionAdminMatchOfficial: vi.fn(),
  deleteUnionAdminMatchOfficial: vi.fn(),
}));

vi.mock("../../services/unionAdminService", () => serviceMock);

function directory(name: string) {
  return {
    count: 1,
    sport: "RUGBY",
    role_options: [{ value: "CENTRE_REFEREE", label: "Centre referee" }],
    results: [
      {
        id: 1,
        full_name: name,
        email: "official@example.com",
        phone_number: "",
        role_type: "CENTRE_REFEREE",
        role_display: "Centre referee",
        certification_level: "Level 1",
        competitions: "",
        status: "AVAILABLE",
        status_display: "Available",
        notes: "",
        user: null,
        assignment_count: 0,
      },
    ],
  };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

describe("UnionAdminRefereesPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides official mutations without union.referees.manage", async () => {
    serviceMock.getUnionAdminMatchOfficials.mockResolvedValue(directory("Amina Official"));

    render(
      <UnionAdminRefereesPanel
        workspaceSlug="union-a"
        workspaceName="Union A"
        workspaceSport="RUGBY"
        canManageOfficials={false}
      />,
    );

    expect(await screen.findByText("Amina Official")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create official/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit amina official/i })).not.toBeInTheDocument();
  });

  it("does not allow a stale official directory response to replace a newer workspace", async () => {
    const unionA = deferred<ReturnType<typeof directory>>();
    const unionB = deferred<ReturnType<typeof directory>>();
    serviceMock.getUnionAdminMatchOfficials
      .mockReturnValueOnce(unionA.promise)
      .mockReturnValueOnce(unionB.promise);

    const { rerender } = render(
      <UnionAdminRefereesPanel
        workspaceSlug="union-a"
        workspaceName="Union A"
        workspaceSport="RUGBY"
        canManageOfficials
      />,
    );
    rerender(
      <UnionAdminRefereesPanel
        workspaceSlug="union-b"
        workspaceName="Union B"
        workspaceSport="RUGBY"
        canManageOfficials
      />,
    );

    unionB.resolve(directory("Union B Official"));
    expect(await screen.findByText("Union B Official")).toBeInTheDocument();

    unionA.resolve(directory("Union A Official"));
    await waitFor(() => expect(screen.queryByText("Union A Official")).not.toBeInTheDocument());
    expect(screen.getByText("Union B Official")).toBeInTheDocument();
  });
});
