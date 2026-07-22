import { EmptyState, ScreenHeader } from "../../components/union-admin/UnionAdminUi";
import styles from "./UnionAdminScreens.module.css";

export default function UnionCommunicationsScreen() {
  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow="Communications"
        title="Union communications"
        description="Drafts, scheduled notices and published announcements will appear when a maintained Union-workspace contract is available."
      />
      <EmptyState
        title="Union communications are not available"
        description="Club-owned announcements are intentionally not shown in this workspace."
      />
    </section>
  );
}
