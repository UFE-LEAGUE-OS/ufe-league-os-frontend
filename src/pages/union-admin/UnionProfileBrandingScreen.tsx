import { type ChangeEvent, useEffect, useState } from "react";

import { ScreenHeader } from "../../components/union-admin/UnionAdminUi";
import type { UnionWorkspaceOption } from "../../services/unionAdminService";
import styles from "./UnionAdminScreens.module.css";

export interface UnionProfileBrandingScreenProps {
  workspace: UnionWorkspaceOption;
}

export default function UnionProfileBrandingScreen({
  workspace,
}: UnionProfileBrandingScreenProps) {
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");

  useEffect(() => () => {
    if (logo) URL.revokeObjectURL(logo);
  }, [logo]);

  useEffect(() => () => {
    if (banner) URL.revokeObjectURL(banner);
  }, [banner]);

  function preview(
    event: ChangeEvent<HTMLInputElement>,
    current: string,
    setPreview: (value: string) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (current) URL.revokeObjectURL(current);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow="Profile & Branding"
        title="Union public identity"
        description="Preview workspace-owned branding without changing Club-managed identity or uploading files."
      />
      <div className={styles.detailGrid}>
        <form className={styles.form}>
          <label>Union name<input defaultValue={workspace.name} /></label>
          <label>Acronym<input defaultValue={workspace.acronym} /></label>
          <label>Description<textarea defaultValue={workspace.description} /></label>
          <label>Sport<input value={workspace.sport} readOnly /></label>
          <label>Workspace type<input value={workspace.workspaceType} readOnly /></label>
          <label>Primary colour<input type="color" defaultValue={workspace.primaryColor || "#7244df"} /></label>
          <label>
            Logo preview
            <input
              aria-label="Logo preview file"
              type="file"
              accept="image/*"
              onChange={(event) => preview(event, logo, setLogo)}
            />
          </label>
          <label>
            Banner preview
            <input
              aria-label="Banner preview file"
              type="file"
              accept="image/*"
              onChange={(event) => preview(event, banner, setBanner)}
            />
          </label>
          <p className={styles.previewWarning}>
            Preview only — this file has not been uploaded.
          </p>
          <button type="button" disabled>Save branding — not connected</button>
        </form>
        <aside className={styles.publicPreview}>
          {banner ? <img src={banner} alt="Local banner preview" /> : null}
          {logo ? (
            <img src={logo} alt="Local logo preview" />
          ) : (
            <div className={styles.logoFallback}>{workspace.acronym}</div>
          )}
          <h3>{workspace.name}</h3>
          <p>{workspace.description || "Public workspace description preview."}</p>
          <small>Club branding remains owned by each Club Admin workspace.</small>
        </aside>
      </div>
    </section>
  );
}
