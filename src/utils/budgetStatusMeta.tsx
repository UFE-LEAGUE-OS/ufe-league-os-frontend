import React from "react";
import type { ClubBudget } from "../services/adminWorkspaceService";

/**
 * Single source of truth for how each budget status is labeled and colored.
 * Previously duplicated identically in TreasurerDashboard.tsx and
 * ChairmanDashboard.tsx — keep it here so the two views can't drift apart.
 */
export const BUDGET_STATUS_META: Record<
  ClubBudget["status"],
  { label: string; color: string; background: string }
> = {
  DRAFT: {
    label: "Draft",
    color: "var(--muted)",
    background: "rgba(148, 163, 184, 0.15)",
  },
  PENDING_APPROVAL: {
    label: "Pending approval",
    color: "#f97316",
    background: "rgba(249, 115, 22, 0.12)",
  },
  APPROVED: {
    label: "Approved",
    color: "var(--green)",
    background: "rgba(34, 197, 94, 0.12)",
  },
  REJECTED: {
    label: "Rejected",
    color: "#ef4444",
    background: "rgba(239, 68, 68, 0.12)",
  },
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BudgetStatusBadge({
  status,
}: {
  status: ClubBudget["status"];
}): React.ReactNode {
  const meta = BUDGET_STATUS_META[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: meta.color,
        background: meta.background,
      }}
    >
      {meta.label}
    </span>
  );
}
