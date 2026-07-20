import type { ClubBudget } from "../services/adminWorkspaceService";
import { BUDGET_STATUS_META } from "../utils/budgetStatusMeta";

export function BudgetStatusBadge({
  status,
}: {
  status: ClubBudget["status"];
}) {
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
