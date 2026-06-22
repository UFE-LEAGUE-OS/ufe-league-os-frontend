import { Outlet } from "react-router-dom";
import LoggedInHeader from "../LoggedInHeader/LoggedInHeader";
import UserSidebar from "../UserSidebar/UserSidebar";
import styles from "./AuthenticatedLayout.module.css";

function AuthenticatedLayout() {
    return (
        <div className={styles.shell}>
            <LoggedInHeader />

            <div className={styles.body}>
                <UserSidebar />

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AuthenticatedLayout;