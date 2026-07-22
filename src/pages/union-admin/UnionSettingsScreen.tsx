import { EmptyState, ScreenHeader } from "../../components/union-admin/UnionAdminUi";
import type { UnionWorkspaceOption } from "../../services/unionAdminService";
import styles from "./UnionAdminScreens.module.css";

export interface UnionSettingsScreenProps { workspace: UnionWorkspaceOption }

export default function UnionSettingsScreen({ workspace }: UnionSettingsScreenProps) {
  return <section className={styles.screen}>
    <ScreenHeader eyebrow="Settings" title="Workspace settings" description={`Persisted settings for ${workspace.name} will appear only when supported by a maintained workspace contract.`} />
    <EmptyState title="No configurable workspace settings" description="Nonfunctional landing-module and notification toggles have been removed. Access is managed through Users & Access." />
  </section>;
}
