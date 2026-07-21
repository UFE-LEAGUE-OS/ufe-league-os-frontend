import { ScreenHeader } from "../../components/union-admin/UnionAdminUi";
import type { UnionWorkspaceOption } from "../../services/unionAdminService";
import styles from "./UnionAdminScreens.module.css";

export interface UnionSettingsScreenProps {
  workspace: UnionWorkspaceOption;
}

export default function UnionSettingsScreen({
  workspace,
}: UnionSettingsScreenProps) {
  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow="Settings"
        title="Workspace preferences"
        description="Display and notification preferences without duplicating branding or access management."
      />
      <div className={styles.cardGrid}>
        <article>
          <h3>Workspace preferences</h3>
          <label>
            Default landing module
            <select defaultValue="overview">
              <option value="overview">Overview</option>
              <option value="competitions">Competitions</option>
            </select>
          </label>
        </article>
        <article>
          <h3>Notifications</h3>
          <label><input type="checkbox" defaultChecked /> Approval queue updates</label>
          <label><input type="checkbox" /> Weekly readiness summary</label>
        </article>
        <article>
          <h3>Feature availability</h3>
          <p>Workspace: {workspace.name}</p>
          <p>Connected modules are determined by role permissions and maintained APIs.</p>
        </article>
      </div>
    </section>
  );
}
