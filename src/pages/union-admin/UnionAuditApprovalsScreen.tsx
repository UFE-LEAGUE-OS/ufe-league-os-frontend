import { unionDemoData } from "../../data/unionAdminDemoData";
import UnionRecordsScreenBase from "./UnionRecordsScreenBase";

export default function UnionAuditApprovalsScreen() {
  return (
    <UnionRecordsScreenBase
      eyebrow="Audit & Approvals"
      title="Approval queue and audit events"
      description="Search, filter and inspect workspace records when a maintained contract is available."
      records={[...unionDemoData.approvals, ...unionDemoData.auditEvents]}
    />
  );
}
