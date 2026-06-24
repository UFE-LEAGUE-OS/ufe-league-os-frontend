import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/apiClient.js";
import "./EditProfilePage.css";

export default function EditProfile() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [profile, setProfile] = useState<Record<string, string> | null>(null);
  const [edit, setEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: ""
  });

  useEffect(() => {
    axiosInstance.get("/accounts/profile/")
      .then(res => {
        setProfile(res.data);
        setForm(res.data);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    const data = new FormData();
    data.append("username", form.username);
    data.append("email", form.email);
    data.append("full_name", form.full_name);
    if (selectedImage) {
      data.append("image", selectedImage);
    }
    try {
      const res = await axiosInstance.patch("/accounts/profile/", data);
      setProfile(res.data);
      setEdit(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="profile-page">
      <button className="back-btn" onClick={() => navigate("/news")}>
        ← Back to Home
      </button>

      {profile && (
        <div className="profile-section">
          <div className="profile-tabs">
            <div
              className={activeTab === "profile" ? "active-tab" : ""}
              onClick={() => setActiveTab("profile")}
            >
              My Profile
            </div>
            <div
              className={activeTab === "settings" ? "active-tab" : ""}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </div>
            <div
              className={activeTab === "club" ? "active-tab" : ""}
              onClick={() => setActiveTab("club")}
            >
              Club Affiliation
            </div>
          </div>

          {activeTab === "profile" && (
            <>
              <fieldset className="settings-section">
                <legend>Profile</legend>
                <div className="profile-content">
                  <div className="profile-left">
                    <img src={profile.image} className="profile-img-large" alt="profile" />
                    <div className="profile-details">
                      <p>{profile.username}</p>
                      <p>{profile.full_name}</p>
                      <p>{profile.email}</p>
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset className="settings-section">
                {!edit ? (
                  <p className="edit-message" onClick={() => {
                    setEdit(true);
                    setForm({
                      username: " ",
                      email: " ",
                      full_name: " ",
                    });
                    setSelectedImage(null);
                    setPreview(null);
                  }}>
                    <a>Edit Profile</a>
                  </p>
                ) : (
                  <div className="edit-profile-card">
                    <fieldset className="edit-profile-field">
                      <legend>Edit Profile</legend>
                      <div className="edit-photo-section">
                        <img
                          src={preview || profile.image}
                          className="edit-profile-image"
                          alt="preview"
                        />
                        <label className="change-photo-btn">
                          Change Photo
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedImage(file);
                                setPreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                      </div>
                    </fieldset>

                    <div className="form-group">
                      <label>Username:</label>
                      <input
                        name="username"
                        value={form.username || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Email:</label>
                      <input
                        name="email"
                        value={form.email || ""}
                        onChange={handleChange}
                        placeholder="example@email.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        name="full_name"
                        value={form.full_name || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-buttons">
                      <button className="save-btn" onClick={saveProfile}>
                        Save Changes
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => {
                          setEdit(false);
                          setForm({
                            username: "name",
                            email: "example@email.com",
                            full_name: "Full Names",
                          });
                          setSelectedImage(null);
                          setPreview(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </fieldset>
            </>
          )}

          {activeTab === "settings" && (
            <fieldset className="settings-section">
              <legend>Notification Preferences</legend>
              <div className="field field-checkbox">
                <input id="emailEnabled" type="checkbox" name="emailEnabled" />
                <label htmlFor="emailEnabled">Email notifications</label>
              </div>
              <div className="field field-checkbox">
                <input id="smsEnabled" type="checkbox" name="smsEnabled" />
                <label htmlFor="smsEnabled">SMS notifications</label>
              </div>
              <div className="field field-checkbox">
                <input id="pushEnabled" type="checkbox" name="pushEnabled" />
                <label htmlFor="pushEnabled">Push notifications</label>
              </div>
              <div className="field">
                <label htmlFor="digestFrequency">Digest frequency</label>
                <select id="digestFrequency" name="digestFrequency">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div className="field field-checkbox">
                <input id="notifyOnClubEvents" type="checkbox" name="notifyOnClubEvents" />
                <label htmlFor="notifyOnClubEvents">Notify me about club events</label>
              </div>
              <div className="field field-checkbox">
                <input id="notifyOnDirectMessages" type="checkbox" name="notifyOnDirectMessages" />
                <label htmlFor="notifyOnDirectMessages">Notify me about direct messages</label>
              </div>
            </fieldset>
          )}

          {activeTab === "club" && (
            <fieldset className="settings-section">
              <legend>Club Affiliation</legend>
              <p>You are not affiliated with any club yet.</p>
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
}
