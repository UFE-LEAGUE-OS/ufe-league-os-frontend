import { AlertTriangle } from "lucide-react";
import "../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css";

export default function SystemMessages() {
    return (
        <div className="ops-placeholder">
            <div className="ops-placeholder-icon"><AlertTriangle size={32} /></div>
            <h2>System Messages</h2>
            <p>This page is under construction. System-wide messaging tools will appear here.</p>
        </div>
    );
}