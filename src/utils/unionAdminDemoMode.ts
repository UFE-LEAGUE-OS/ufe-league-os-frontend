import type { UnionAdminDataSourceMode } from "../types/unionAdminDemo";

type UnionDemoEnvironment = {
  DEV?: boolean;
  VITE_UNION_DEMO_MODE?: string;
};

export function isUnionDemoMode(environment: UnionDemoEnvironment = import.meta.env): boolean {
  return environment.DEV === true && environment.VITE_UNION_DEMO_MODE === "true";
}

export function getUnionAdminDataSourceMode(): UnionAdminDataSourceMode {
  return isUnionDemoMode() ? "demo" : "api";
}
