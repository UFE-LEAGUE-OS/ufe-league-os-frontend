import { afterEach, describe, expect, it, vi } from "vitest";
import { isUnionDemoMode } from "./unionAdminDemoMode";

describe("Union Admin demo mode guard", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("requires both a development build and the explicit flag", () => {
    expect(isUnionDemoMode({ DEV: true, VITE_UNION_DEMO_MODE: "true" })).toBe(true);
    expect(isUnionDemoMode({ DEV: false, VITE_UNION_DEMO_MODE: "true" })).toBe(false);
    expect(isUnionDemoMode({ DEV: true, VITE_UNION_DEMO_MODE: "false" })).toBe(false);
  });

  it("never activates demo records for a production environment", () => {
    expect(isUnionDemoMode({ DEV: false, VITE_UNION_DEMO_MODE: "true" })).toBe(false);
  });
});
