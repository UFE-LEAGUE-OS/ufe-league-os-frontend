import { Link } from "react-router-dom";
import styles from "./DashboardEmptyState.module.css";

interface DashboardEmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    actionLabel: string;
    actionTo: string;
    compact?: boolean;
}

function DashboardEmptyState({
    icon = "•",
    title,
    message,
    actionLabel,
    actionTo,
    compact = false,
}: DashboardEmptyStateProps) {
    return (
        <div className={`${styles.emptyState} ${compact ? styles.compact : ""}`}>
            <span className={styles.icon} aria-hidden="true">
                {icon}
            </span>

            <div>
                <h3>{title}</h3>
                <p>{message}</p>
            </div>

            <Link to={actionTo}>{actionLabel}</Link>
        </div>
    );
}

export default DashboardEmptyState;
