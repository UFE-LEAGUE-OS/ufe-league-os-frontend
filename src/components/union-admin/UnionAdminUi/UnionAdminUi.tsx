import type { ReactNode } from "react";

import styles from "./UnionAdminUi.module.css";

export interface ScreenHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function ScreenHeader({
  eyebrow,
  title,
  description,
  actions,
}: ScreenHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}

export interface InternalTab<T extends string> {
  key: T;
  label: string;
}

export interface InternalTabsProps<T extends string> {
  label: string;
  items: InternalTab<T>[];
  active: T;
  onChange: (key: T) => void;
}

export function InternalTabs<T extends string>({
  label,
  items,
  active,
  onChange,
}: InternalTabsProps<T>) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={active === item.key}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export interface StatusBadgeProps {
  children: ReactNode;
}

export function StatusBadge({ children }: StatusBadgeProps) {
  return <span className={styles.badge}>{children}</span>;
}

export interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className={styles.empty} role="status">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export interface LoadingStateProps {
  label?: string;
}

export function LoadingState({
  label = "Loading workspace records…",
}: LoadingStateProps) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span />
      <span />
      <span />
      <p>{label}</p>
    </div>
  );
}

export interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <strong>Unable to load this screen</strong>
      <p>{message}</p>
    </div>
  );
}

export interface RecordListItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  meta?: string;
}

export interface RecordListProps {
  records: RecordListItem[];
  onSelect?: (id: string) => void;
  selectedId?: string;
}

export function RecordList({ records, onSelect, selectedId }: RecordListProps) {
  return (
    <div className={styles.recordList}>
      {records.map((record) => (
        <button
          key={record.id}
          type="button"
          className={selectedId === record.id ? styles.selectedRecord : ""}
          onClick={() => onSelect?.(record.id)}
          disabled={!onSelect}
        >
          <span>
            <strong>{record.title}</strong>
            <small>{record.subtitle}</small>
            {record.meta ? <small>{record.meta}</small> : null}
          </span>
          <StatusBadge>{record.status.replaceAll("_", " ")}</StatusBadge>
        </button>
      ))}
    </div>
  );
}

export function DemoNotice() {
  return (
    <p className={styles.demoNotice}>
      Development demo — changes on this screen are local and are not persisted.
    </p>
  );
}

export interface NotConnectedProps {
  feature: string;
}

export function NotConnected({ feature }: NotConnectedProps) {
  return (
    <EmptyState
      title="Not connected yet"
      description={`${feature} will appear here when a maintained Union backend contract is available.`}
    />
  );
}

