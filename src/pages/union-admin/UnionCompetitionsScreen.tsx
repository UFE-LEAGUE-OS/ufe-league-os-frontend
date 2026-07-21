import { useState } from "react";

import UnionAdminManagementWorkflow from "../../components/UnionAdminManagementWorkflow/UnionAdminManagementWorkflow";
import {
  DemoNotice,
  InternalTabs,
  RecordList,
  ScreenHeader,
  StatusBadge,
} from "../../components/union-admin/UnionAdminUi";
import { unionDemoData } from "../../data/unionAdminDemoData";
import type { UnionWorkspaceOption } from "../../services/unionAdminService";
import { getUnionAdminDataSourceMode } from "../../utils/unionAdminDemoMode";
import UnionAdminScreenToolbar from "./UnionAdminScreenToolbar";
import styles from "./UnionAdminScreens.module.css";

type CompetitionView =
  | "directory"
  | "identity"
  | "editions"
  | "entries"
  | "scheduling"
  | "publication";

const views: Array<{ key: CompetitionView; label: string }> = [
  { key: "directory", label: "Competition Directory" },
  { key: "identity", label: "Identity Detail" },
  { key: "editions", label: "Editions / Seasons" },
  { key: "entries", label: "Club Entries" },
  { key: "scheduling", label: "Scheduling / Fixtures" },
  { key: "publication", label: "Publication & Lifecycle" },
];

export interface UnionCompetitionsScreenProps {
  workspace: UnionWorkspaceOption;
}

export default function UnionCompetitionsScreen({
  workspace,
}: UnionCompetitionsScreenProps) {
  const [view, setView] = useState<CompetitionView>("directory");
  const [selectedId, setSelectedId] = useState(unionDemoData.competitions[0].id);
  const competition =
    unionDemoData.competitions.find((item) => item.id === selectedId) ??
    unionDemoData.competitions[0];
  const editions = unionDemoData.editions.filter(
    (item) => item.competitionId === competition.id,
  );

  if (getUnionAdminDataSourceMode() === "api") {
    return (
      <section className={styles.screen}>
        <ScreenHeader
          eyebrow="Competitions"
          title="Competition management"
          description="Create maintained competition editions, manage Club entries, and prepare fixtures through the connected Union APIs."
        />
        <UnionAdminManagementWorkflow
          workspaceSlug={workspace.slug}
          workspaceLabel={workspace.name}
        />
      </section>
    );
  }

  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow="Competitions"
        title="Competition control room"
        description="Manage permanent competition identities separately from their seasonal editions."
        actions={<button type="button">Create Competition</button>}
      />
      <DemoNotice />
      <InternalTabs<CompetitionView>
        label="Competition views"
        active={view}
        onChange={setView}
        items={views}
      />

      {view === "directory" ? (
        <>
          <UnionAdminScreenToolbar placeholder="Search competitions" />
          <RecordList
            records={unionDemoData.competitions}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setView("identity");
            }}
          />
        </>
      ) : null}

      {view === "identity" ? (
        <div className={styles.detailGrid}>
          <article>
            <h3>{competition.title}</h3>
            <dl>
              <dt>Short name</dt><dd>National Premiership</dd>
              <dt>Slug</dt><dd>{competition.meta}</dd>
              <dt>Sport</dt><dd>{workspace.sport}</dd>
              <dt>Format</dt><dd>{competition.subtitle}</dd>
              <dt>Governing workspace</dt><dd>{workspace.name}</dd>
            </dl>
          </article>
          <aside>
            <h3>Activity summary</h3>
            <p>{editions.length} maintained editions</p>
            <p>10 active Club entries</p>
            <p>Fixtures published for the current edition</p>
          </aside>
        </div>
      ) : null}

      {view === "editions" ? (
        <div className={styles.cardGrid}>
          {editions.map((item) => (
            <article key={item.id}>
              <StatusBadge>{item.status.replaceAll("_", " ")}</StatusBadge>
              <h3>{item.title}</h3>
              <dl>
                <dt>Dates</dt><dd>{item.startDate} — {item.endDate}</dd>
                <dt>Registration</dt><dd>{item.registrationWindow}</dd>
                <dt>Club entries</dt><dd>{item.clubEntries}</dd>
                <dt>Fixture readiness</dt><dd>{item.fixtureReadiness}</dd>
              </dl>
            </article>
          ))}
        </div>
      ) : null}

      {view === "entries" ? (
        <>
          <div className={styles.actionRow}>
            <button type="button">Bulk-add Clubs</button>
            <button type="button">Promotion / relegation</button>
          </div>
          <RecordList
            records={unionDemoData.clubs.map((club, index) => ({
              ...club,
              status: index === 2 ? "INVITED" : index === 1 ? "PROMOTED" : "ACTIVE",
            }))}
          />
        </>
      ) : null}

      {view === "scheduling" ? (
        <div className={styles.detailGrid}>
          <form className={styles.form}>
            <h3>Fixture generation preview</h3>
            <label>Edition<select><option>2027 Premiership</option></select></label>
            <label>First match date<input type="date" defaultValue="2027-02-06" /></label>
            <label>Match day<select><option>Saturday</option></select></label>
            <button type="button">Preview fixtures</button>
          </form>
          <aside>
            <h3>Preview only</h3>
            <p>Round 1 · Kampala Rugby Club vs Nile Rugby Club</p>
            <p>Saturday 6 February 2027 · Venue TBC</p>
            <small>No fixture history is persisted from demo mode.</small>
          </aside>
        </div>
      ) : null}

      {view === "publication" ? (
        <div className={styles.timeline}>
          <article>
            <StatusBadge>REGISTRATION OPEN</StatusBadge>
            <h3>2027 Premiership</h3>
            <p>Available local transition: Close registration</p>
            <button type="button">Close registration (demo)</button>
          </article>
          <article>
            <StatusBadge>ACTIVE</StatusBadge>
            <h3>2026 Premiership</h3>
            <p>The active edition has no premature completion action in this review state.</p>
          </article>
        </div>
      ) : null}
    </section>
  );
}
