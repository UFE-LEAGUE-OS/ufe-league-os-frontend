import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";

import "../../../styles/pages/club-admin/ClubManagement.css";
import AdminWorkspaceLayout from "../../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import { clubAdminNavItems } from "./clubAdminNav";

interface StaffMember {
  id: number;
  clubId: number;
  clubName: string;
  name: string;
  role: string;
  sport: "Football" | "Basketball" | "Rugby";
  team: string;
  phone: string;
  status: "Active" | "Inactive";
}



const staffData: StaffMember[] = [
  {
    id: 1,
    clubId: 1,
    clubName: "KCCA FC",
    name: "John Doe",
    role: "Head Coach",
    sport: "Football",
    team: "Senior Men",
    phone: "0700000000",
    status: "Active",
  },
  {
    id: 2,
    clubId: 1,
    clubName: "KCCA FC",
    name: "Sarah Namusoke",
    role: "Physiotherapist",
    sport: "Football",
    team: "Senior Women",
    phone: "0711111111",
    status: "Active",
  },
  {
    id: 3,
    clubId: 2,
    clubName: "City Oilers",
    name: "Peter Ojara",
    role: "Team Manager",
    sport: "Basketball",
    team: "Warriors",
    phone: "0722222222",
    status: "Active",
  },
  {
    id: 4,
    clubId: 3,
    clubName: "Heathens Rugby Club",
    name: "David Okello",
    role: "Coach",
    sport: "Rugby",
    team: "Rhinos",
    phone: "0733333333",
    status: "Inactive",
  },
];

const roles = [
  "Head Coach",
  "Assistant Coach",
  "Goalkeeping Coach",
  "Fitness Coach",
  "Team Manager",
  "Doctor",
  "Physiotherapist",
  "Analyst",
  "Media Officer",
  "Kit Manager",
  "Club Secretary",
];

const currentClub = {
  id: 1,
  name: "KCCA FC",
  sport: "Football" as const,
};
const sports: StaffMember["sport"][] = ["Football", "Basketball", "Rugby"];

const emptyForm = {
  name: "",
  role: roles[0],
  sport: sports[0],
  team: "",
  phone: "",
  status: "Active" as "Active" | "Inactive",
};

const StaffOfficials = () => {
  const navigate = useNavigate();

 const [staff, setStaff] = useState<StaffMember[]>(
  staffData.filter(
    (member) =>
      member.clubId === currentClub.id &&
      member.sport === currentClub.sport
  )
);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filteredStaff = staff.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      role: member.role,
      sport: member.sport,
      team: member.team,
      phone: member.phone,
      status: member.status,
    });
    setShowModal(true);
  };

  const deleteStaff = (id: number) => {
    setStaff(staff.filter((member) => member.id !== id));
  };

  const saveStaff = () => {
    if (!form.name.trim() || !form.phone.trim()) return;

    if (editingId) {
      setStaff(
        staff.map((member) =>
          member.id === editingId
            ? {
                ...member,
                name: form.name,
                role: form.role,
                sport: form.sport,
                team: form.team,
                phone: form.phone,
                status: form.status,
              }
            : member
        )
      );
    } else {
      const newMember: StaffMember = {
  id: Math.max(0, ...staff.map((m) => m.id)) + 1,

  clubId: currentClub.id,
  clubName: currentClub.name,

  name: form.name,
  role: form.role,

  // Force the club's sport
  sport: currentClub.sport,

  team: form.team || "Unassigned",
  phone: form.phone,
  status: form.status,
};
      setStaff([...staff, newMember]);
    }

    setShowModal(false);
  };

  return (
    <AdminWorkspaceLayout
      workspaceTitle="KCCA FC"
      workspaceSubtitle="Football Club"
      eyebrow="Club Management"
      title="Staff & Officials"
      description="Manage coaches, officials and club technical staff."
      navItems={clubAdminNavItems}
      activeTab="staff"
      onTabChange={(key) => {
        const item = clubAdminNavItems.find((i) => i.key === key);
        if (item) navigate(item.path);
      }}
    >
      <div className="club-page">
        <div className="club-header">
          <div>
            <h1>KCCA</h1>
            <p>Football </p>
          </div>

          <button className="primary-btn" onClick={openCreate}>
            <Plus size={18} />
            Add Staff
          </button>
        </div>

        <div className="club-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="club-card">
          <div className="table-wrapper">
            <table className="club-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Sport</th>
                  <th>Team</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-row">
                      No staff match your search.
                    </td>
                  </tr>
                )}
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <strong>{member.name}</strong>
                    </td>
                    <td>{member.role}</td>
                    <td>
                      <span className="sport-badge">{member.sport}</span>
                    </td>
                    <td>{member.team}</td>
                    <td>{member.phone}</td>
                    <td>
                      <span
                        className={member.status === "Active" ? "status active" : "status expired"}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button title="Edit" onClick={() => openEdit(member)}>
                          <Pencil size={16} />
                        </button>
                        <button title="Delete" onClick={() => deleteStaff(member.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="club-modal">
              <div className="modal-header">
                <h2>{editingId ? "Edit Staff Member" : "Add Staff Member"}</h2>
                <button onClick={() => setShowModal(false)}>
                  <X />
                </button>
              </div>

              <div className="form-grid">
                <input
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {roles.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>

                <select
                  value={form.sport}
                  onChange={(e) =>
                    setForm({ ...form, sport: e.target.value as StaffMember["sport"] })
                  }
                >
                  {sports.map((sport) => (
                    <option key={sport}>{sport}</option>
                  ))}
                </select>

                <input
                  placeholder="Assigned Team"
                  value={form.team}
                  onChange={(e) => setForm({ ...form, team: e.target.value })}
                />

                <input
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as "Active" | "Inactive" })
                  }
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="primary-btn" onClick={saveStaff}>
                  Save Staff
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminWorkspaceLayout>
  );
};

export default StaffOfficials;
