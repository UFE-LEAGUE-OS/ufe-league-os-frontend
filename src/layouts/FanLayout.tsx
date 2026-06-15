export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">Sidebar</aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
