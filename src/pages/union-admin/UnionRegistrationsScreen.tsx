import { useState } from "react";

import {
  DemoNotice,
  RecordList,
  ScreenHeader,
  StatusBadge,
} from "../../components/union-admin/UnionAdminUi";
import { UnionRegistrationsPanel } from "../../components/UnionOperationalPanels/UnionOperationalPanels";
import { unionDemoData } from "../../data/unionAdminDemoData";
import { getUnionAdminDataSourceMode } from "../../utils/unionAdminDemoMode";
import UnionAdminScreenToolbar from "./UnionAdminScreenToolbar";
import styles from "./UnionAdminScreens.module.css";

export interface UnionRegistrationsScreenProps {
  workspaceSlug: string;
  workspaceName: string;
}

export default function UnionRegistrationsScreen({
  workspaceSlug,
  workspaceName,
}: UnionRegistrationsScreenProps) {
  const [selectedId, setSelectedId] = useState("reg-001");

  if (getUnionAdminDataSourceMode() === "api") {
    return (
      <UnionRegistrationsPanel
        workspaceSlug={workspaceSlug}
        workspaceName={workspaceName}
      />
    );
  }

  const record =
    unionDemoData.registrations.find((item) => item.id === selectedId) ??
    unionDemoData.registrations[0];

  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow="Registrations"
        title="Registration review workspace"
        description="Review authoritative Union player registration submissions separately from legacy applications."
      />
      <DemoNotice />
      <UnionAdminScreenToolbar placeholder="Player name or Union player number" />
      <div className={styles.masterDetail}>
        <RecordList
          records={unionDemoData.registrations}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <article>
          <StatusBadge>{record.status}</StatusBadge>
          <h3>{record.title}</h3>
          <p>{record.subtitle}</p>
          <dl>
            <dt>Identity</dt>
            <dd>Submitted identity is not linked to an existing account.</dd>
            <dt>Evidence</dt>
            <dd>Identity document · Club endorsement · portrait reference</dd>
            <dt>Reviewer</dt>
            <dd>Competition Registrar</dd>
          </dl>
          <ol>
            <li>Submitted · 16 July 2026</li>
            <li>Reviewer assigned · 19 July 2026</li>
          </ol>
          <div className={styles.actionRow}>
            <button type="button">Start review</button>
            <button type="button">Request changes</button>
            <button type="button">Approve</button>
            <button type="button">Reject</button>
          </div>
        </article>
      </div>
    </section>
  );
}
