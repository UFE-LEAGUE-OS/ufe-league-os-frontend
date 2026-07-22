import { EmptyState, ScreenHeader } from "../../components/union-admin/UnionAdminUi";
import type { UnionWorkspaceOption } from "../../services/unionAdminService";
import styles from "./UnionAdminScreens.module.css";

export interface UnionProfileBrandingScreenProps { workspace: UnionWorkspaceOption }

export default function UnionProfileBrandingScreen({ workspace }: UnionProfileBrandingScreenProps) {
  return <section className={styles.screen}>
    <ScreenHeader eyebrow="Profile & Branding" title="Union public identity" description="Review the maintained identity returned for the active Union workspace." />
    <div className={styles.detailGrid}>
      <article>
        <h3>{workspace.name}</h3>
        <dl><dt>Acronym</dt><dd>{workspace.acronym}</dd><dt>Description</dt><dd>{workspace.description || "No description has been maintained."}</dd><dt>Sport</dt><dd>{workspace.sport}</dd><dt>Workspace type</dt><dd>{workspace.workspaceType}</dd><dt>Primary colour</dt><dd>{workspace.primaryColor}</dd></dl>
      </article>
      <aside><EmptyState title="Branding editing unavailable" description="The Union workspace API does not expose profile updates or Union-owned logo and banner uploads. Non-persisting controls are intentionally omitted." /></aside>
    </div>
  </section>;
}
