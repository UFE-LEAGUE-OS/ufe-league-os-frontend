import { EmptyState, ScreenHeader } from "../../components/union-admin/UnionAdminUi";
import styles from "./UnionAdminScreens.module.css";

export default function UnionSponsorsScreen() {
  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow="Sponsors"
        title="Union sponsorships"
        description="Union-owned sponsorship packages, agreements and payments will appear only after workspace ownership is enforced by the backend."
      />
      <EmptyState
        title="No safe Union sponsorship contract"
        description="Global sponsor-hub records are intentionally hidden because they are not filtered by the active Union workspace."
      />
    </section>
  );
}
