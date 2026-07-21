import type { UnionDemoRecord } from "../../types/unionAdminDemo";
import {
  DemoNotice,
  NotConnected,
  RecordList,
  ScreenHeader,
} from "../../components/union-admin/UnionAdminUi";
import { getUnionAdminDataSourceMode } from "../../utils/unionAdminDemoMode";
import UnionAdminScreenToolbar from "./UnionAdminScreenToolbar";
import styles from "./UnionAdminScreens.module.css";

export interface UnionRecordsScreenBaseProps {
  eyebrow: string;
  title: string;
  description: string;
  records: UnionDemoRecord[];
  showCreateAnnouncement?: boolean;
}

export default function UnionRecordsScreenBase({
  eyebrow,
  title,
  description,
  records,
  showCreateAnnouncement = false,
}: UnionRecordsScreenBaseProps) {
  const isDemo = getUnionAdminDataSourceMode() === "demo";

  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          showCreateAnnouncement && isDemo ? (
            <button type="button">Create announcement</button>
          ) : undefined
        }
      />
      {isDemo ? (
        <>
          <DemoNotice />
          <UnionAdminScreenToolbar />
          <RecordList records={records} />
        </>
      ) : (
        <NotConnected feature={title} />
      )}
    </section>
  );
}
