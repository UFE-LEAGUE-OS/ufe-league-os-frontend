import { useState } from "react";

import {
  DemoNotice,
  InternalTabs,
  NotConnected,
  RecordList,
  ScreenHeader,
} from "../../components/union-admin/UnionAdminUi";
import { unionDemoData } from "../../data/unionAdminDemoData";
import { getUnionAdminDataSourceMode } from "../../utils/unionAdminDemoMode";
import UnionAdminScreenToolbar from "./UnionAdminScreenToolbar";
import styles from "./UnionAdminScreens.module.css";

type PlayersTransfersView =
  | "registry"
  | "submissions"
  | "eligibility"
  | "transfers"
  | "returns";

const views: Array<{ key: PlayersTransfersView; label: string }> = [
  { key: "registry", label: "Player Registry" },
  { key: "submissions", label: "Registration Submissions" },
  { key: "eligibility", label: "Competition Eligibility" },
  { key: "transfers", label: "Transfers" },
  { key: "returns", label: "Loan Returns" },
];

export default function UnionPlayersTransfersScreen() {
  const [view, setView] = useState<PlayersTransfersView>("registry");
  const mode = getUnionAdminDataSourceMode();
  const records =
    view === "registry"
      ? unionDemoData.players
      : view === "submissions"
        ? unionDemoData.registrations
        : view === "eligibility"
          ? unionDemoData.eligibility
          : unionDemoData.transfers;

  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow="Players & Transfers"
        title="Player registration and movement"
        description="Authoritative player identities, competition eligibility, permanent transfers and loans."
      />
      {mode === "demo" ? <DemoNotice /> : null}
      <InternalTabs<PlayersTransfersView>
        label="Player and transfer views"
        active={view}
        onChange={setView}
        items={views}
      />
      {mode === "demo" ? (
        <>
          <UnionAdminScreenToolbar placeholder="Search player or Union number" />
          <RecordList records={records} />
        </>
      ) : (
        <NotConnected feature="Authoritative player registration, eligibility and transfer workflows" />
      )}
    </section>
  );
}
