import styles from "./UnionAdminScreenToolbar.module.css";

export interface UnionAdminScreenToolbarProps {
  placeholder?: string;
}

export default function UnionAdminScreenToolbar({
  placeholder = "Search records",
}: UnionAdminScreenToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <label>
        Search
        <input type="search" placeholder={placeholder} />
      </label>
      <label>
        Status
        <select defaultValue="ALL">
          <option value="ALL">All statuses</option>
          <option>ACTIVE</option>
          <option>PENDING</option>
          <option>DRAFT</option>
        </select>
      </label>
    </div>
  );
}
