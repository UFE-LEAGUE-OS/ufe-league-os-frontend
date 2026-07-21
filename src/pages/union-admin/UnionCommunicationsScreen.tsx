import { unionDemoData } from "../../data/unionAdminDemoData";
import UnionRecordsScreenBase from "./UnionRecordsScreenBase";

export default function UnionCommunicationsScreen() {
  return (
    <UnionRecordsScreenBase
      eyebrow="Communications"
      title="Announcements"
      description="Search, filter and inspect workspace records when a maintained contract is available."
      records={unionDemoData.announcements}
      showCreateAnnouncement
    />
  );
}
