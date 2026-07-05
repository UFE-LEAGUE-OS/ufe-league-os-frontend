import { useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Save, ShieldCheck, KeyRound } from "lucide-react";
import profileImage from "../../assets/kcca.png";
import "../../styles/pages/SuperAdminProfile.css";

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
  title: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SuperAdminProfilePage() {
  const [avatarPreview, setAvatarPreview] = useState<string>(profileImage);
  const [form, setForm] = useState<ProfileForm>({
    fullName: "Merab Apio",
    email: "merab.apio@leagueos.com",
    phone: "+256 700 000 000",
    title: "Super Admin",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function handleFieldChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePasswordChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError(null);
  }

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: replace with a real API call, e.g. PATCH /api/users/me
    setSavedMessage("Profile updated.");
    setTimeout(() => setSavedMessage(null), 3000);
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }
    // TODO: replace with a real API call, e.g. POST /api/users/me/password
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSavedMessage("Password changed.");
    setTimeout(() => setSavedMessage(null), 3000);
  }

  return (
    <main className="super-admin-page profile-page">
      <section className="page-heading">
        <div className="title-group">
          <h1>My Profile</h1>
          <p>Manage your basic account details and login credentials.</p>
        </div>
      </section>

      {savedMessage && <div className="profile-toast">{savedMessage}</div>}

      <section className="profile-grid">
        <article className="panel profile-identity-card">
          <div className="profile-avatar-wrap">
            <img src={avatarPreview} alt={form.fullName} className="profile-avatar" />
            <label className="profile-avatar-edit" htmlFor="avatar-upload">
              <Camera size={14} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
            </label>
          </div>
          <h3>{form.fullName}</h3>
          <span className="profile-role-tag">
            <ShieldCheck size={13} />
            {form.title}
          </span>
          <p className="profile-identity-note">
            Your role and permissions are managed by platform governance and
            can't be changed from this page.
          </p>
        </article>

        <article className="panel profile-form-card">
          <h3>Basic information</h3>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="profile-form-row">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="profile-form-row">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleFieldChange}
                required
              />
            </div>

            <div className="profile-form-row">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleFieldChange}
              />
            </div>

            <div className="profile-form-row">
              <label htmlFor="title">Role</label>
              <input id="title" name="title" type="text" value={form.title} disabled />
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="button-primary">
                <Save size={15} />
                Save changes
              </button>
            </div>
          </form>
        </article>

        <article className="panel profile-form-card">
          <h3>
            <KeyRound size={15} />
            Change password
          </h3>
          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="profile-form-row">
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="profile-form-row">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="profile-form-row">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>

            {passwordError && <p className="profile-form-error">{passwordError}</p>}

            <div className="profile-form-actions">
              <button type="submit" className="button-secondary">
                Update password
              </button>
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}