import { unionDemoData } from "../../data/unionAdminDemoData";
import UnionRecordsScreenBase from "./UnionRecordsScreenBase";

export default function UnionStatisticsRecordsScreen() {
  return (
    <UnionRecordsScreenBase
      eyebrow="Statistics & Records"
      title="Maintained historical records"
      description="Clear record tables without fabricated production statistics or charts."
      records={unionDemoData.statistics}
    />
  );
}
