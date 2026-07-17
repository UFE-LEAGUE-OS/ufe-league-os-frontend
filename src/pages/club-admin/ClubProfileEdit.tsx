import { useState } from "react";

export default function ClubProfileEdit() {
  const [form, setForm] = useState({
    name: "Kampala City FC",
    shortName: "KCC",
    slug: "kampala-city-fc",
    sport: "Football",
    email: "info@kampalacityfc.ug",
    phone: "+256 700 123 456",
    website: "https://kampalacityfc.ug",
    foundedYear: "1967",
    description:
      "Kampala City FC is a professional football club based in Kampala, Uganda. Founded in 1967, the club competes in the Uganda Premier League and is one of the most successful clubs in the country.",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to save profile
    console.log("Saving club profile:", form);
  };

  return (
    <div className="club-page">
      <div className="club-page-header">
        <h1>Club Profile</h1>
        <p>Manage your club's basic information and contact details.</p>
      </div>

      <div className="club-panel">
        <form className="club-form" onSubmit={handleSave}>
          <div className="club-form-grid">
            <div className="club-form-row">
              <label htmlFor="name">Club Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} />
            </div>

            <div className="club-form-row">
              <label htmlFor="shortName">Short Name</label>
              <input id="shortName" name="shortName" value={form.shortName} onChange={handleChange} />
            </div>

            <div className="club-form-row">
              <label htmlFor="slug">URL Slug</label>
              <input id="slug" name="slug" value={form.slug} onChange={handleChange} />
            </div>

            <div className="club-form-row">
              <label htmlFor="sport">Sport</label>
              <select id="sport" name="sport" value={form.sport} onChange={handleChange}>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Rugby">Rugby</option>
                <option value="Netball">Netball</option>
              </select>
            </div>

            <div className="club-form-row">
              <label htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>

            <div className="club-form-row">
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            </div>

            <div className="club-form-row">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="url" value={form.website} onChange={handleChange} />
            </div>

            <div className="club-form-row">
              <label htmlFor="foundedYear">Founded Year</label>
              <input id="foundedYear" name="foundedYear" value={form.foundedYear} onChange={handleChange} />
            </div>
          </div>

          <div className="club-form-row">
            <label htmlFor="description">Club Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} />
          </div>

          <div className="club-btn-group">
            <button type="submit" className="club-btn-primary">
              Save Changes
            </button>
            <button type="button" className="club-btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="club-panel danger-zone-panel">
        <h2>Danger Zone</h2>
        <p className="panel-desc">Irreversible actions for this club profile.</p>
        <button type="button" className="club-btn-danger">
          Delete Club
        </button>
      </div>
    </div>
  );
}
