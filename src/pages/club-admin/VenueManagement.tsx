import { useState } from "react";
import { MapPin, Plus, Edit3, Trash2 } from "lucide-react";

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: "active" | "inactive";
}

const initialVenues: Venue[] = [
  {
    id: "1",
    name: "StarTimes Stadium",
    location: "Kampala, Uganda",
    capacity: 5000,
    status: "active",
  },
  {
    id: "2",
    name: "Lugogo Arena",
    location: "Kampala, Uganda",
    capacity: 3000,
    status: "active",
  },
];

export default function VenueManagement() {
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", location: "", capacity: 0 });

  const resetForm = () => {
    setForm({ name: "", location: "", capacity: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAdd = () => {
    const newVenue: Venue = {
      id: Date.now().toString(),
      ...form,
      capacity: Number(form.capacity),
      status: "active",
    };
    setVenues((prev) => [...prev, newVenue]);
    resetForm();
  };

  const handleEdit = (venue: Venue) => {
    setForm({ name: venue.name, location: venue.location, capacity: venue.capacity });
    setEditingId(venue.id);
    setShowForm(true);
  };

  const handleUpdate = () => {
    setVenues((prev) =>
      prev.map((v) =>
        v.id === editingId ? { ...v, ...form, capacity: Number(form.capacity) } : v
      )
    );
    resetForm();
  };

  const handleDelete = (id: string) => {
    setVenues((prev) => prev.filter((v) => v.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setVenues((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: v.status === "active" ? "inactive" : "active" } : v
      )
    );
  };

  return (
    <div className="club-page">
      <div className="club-page-header">
        <h1>Venues</h1>
        <p>Manage your club's home venues and facilities.</p>
      </div>

      {/* Add Venue Button */}
      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          className="club-btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <Plus size={16} />
          Add Venue
        </button>
      </div>

      {/* Venue Form */}
      {showForm && (
        <div className="club-panel">
          <h2>{editingId ? "Edit Venue" : "Add New Venue"}</h2>
          <p className="panel-desc">Enter the details for this venue.</p>

          <div className="club-form">
            <div className="club-form-grid" style={{ maxWidth: 600 }}>
              <div className="club-form-row">
                <label htmlFor="venue-name">Venue Name</label>
                <input
                  id="venue-name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. StarTimes Stadium"
                />
              </div>

              <div className="club-form-row">
                <label htmlFor="venue-location">Location</label>
                <input
                  id="venue-location"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Kampala, Uganda"
                />
              </div>

              <div className="club-form-row">
                <label htmlFor="venue-capacity">Capacity</label>
                <input
                  id="venue-capacity"
                  type="number"
                  value={form.capacity || ""}
                  onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
                  placeholder="e.g. 5000"
                />
              </div>
            </div>

            <div className="club-btn-group">
              <button
                type="button"
                className="club-btn-primary"
                onClick={editingId ? handleUpdate : handleAdd}
                disabled={!form.name || !form.location}
              >
                {editingId ? "Update Venue" : "Add Venue"}
              </button>
              <button type="button" className="club-btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venues List */}
      <div className="venue-grid">
        {venues.length === 0 && (
          <div className="club-panel" style={{ gridColumn: "1 / -1" }}>
            <p style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>
              No venues added yet. Click "Add Venue" to get started.
            </p>
          </div>
        )}

        {venues.map((venue) => (
          <div className="venue-card" key={venue.id}>
            <div className="venue-card-header">
              <div>
                <h3>{venue.name}</h3>
                <span className="venue-detail">
                  <MapPin size={14} />
                  {venue.location}
                </span>
              </div>
              <span className={`venue-status-badge ${venue.status}`}>
                {venue.status}
              </span>
            </div>

            <div className="venue-detail">
              <strong style={{ color: "var(--text)", fontSize: 13 }}>
                Capacity: {venue.capacity.toLocaleString()}
              </strong>
            </div>

            <div className="venue-actions">
              <button
                type="button"
                className="club-btn-secondary"
                style={{ padding: "8px 14px", fontSize: 12 }}
                onClick={() => handleEdit(venue)}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                type="button"
                className="club-btn-secondary"
                style={{ padding: "8px 14px", fontSize: 12 }}
                onClick={() => handleToggleStatus(venue.id)}
              >
                {venue.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                className="club-btn-danger"
                style={{ padding: "8px 14px", fontSize: 12 }}
                onClick={() => handleDelete(venue.id)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
