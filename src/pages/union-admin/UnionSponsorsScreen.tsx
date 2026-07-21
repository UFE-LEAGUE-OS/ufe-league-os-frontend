import { unionDemoData } from "../../data/unionAdminDemoData";
import UnionRecordsScreenBase from "./UnionRecordsScreenBase";

export default function UnionSponsorsScreen() {
  return (
    <UnionRecordsScreenBase
      eyebrow="Sponsors"
      title="Union sponsorship relationships"
      description="Search, filter and inspect workspace records when a maintained contract is available."
      records={unionDemoData.sponsors}
    />
  );
}
