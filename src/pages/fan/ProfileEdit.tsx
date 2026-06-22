import {
    Camera,
    CheckCircle2,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    User,
    X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { updateProfile } from "../../services/authService.js";
import styles from "./EditProfilePage.module.css";

interface EditProfileFormState {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    location: string;
    dateOfBirth: string;
    gender: string;
    favoriteSport: string;
    bio: string;
}

function createInitialFormState(currentUser: ReturnType<typeof useCurrentUser>["currentUser"]): EditProfileFormState {
    const nameParts = currentUser.name.split(" ");

    return {
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" ") || "",
        username: currentUser.email.includes("@") ? currentUser.email.split("@")[0] ?? "" : "",
        email: currentUser.email === "No email available" ? "" : currentUser.email,
        phone: currentUser.phoneNumber === "No phone number added" ? "" : currentUser.phoneNumber,
        location: currentUser.location,
        dateOfBirth: "",
        gender: "Prefer not to say",
        favoriteSport: currentUser.favoriteSport,
        bio: "Passionate Ugandan sports fan following rugby, football, basketball, and community leagues.",
    };
}

const completionItems = [
    { label: "Basic information", complete: true },
    { label: "Contact details", complete: true },
    { label: "Sports interests", complete: true },
    { label: "Profile photo", complete: false },
];

function EditProfilePage() {
    const { currentUser } = useCurrentUser();
    const [formData, setFormData] = useState<EditProfileFormState>(() =>
        createInitialFormState(currentUser),
    );
    const [saveMessage, setSaveMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(createInitialFormState(currentUser));
    }, [
        currentUser.email,
        currentUser.favoriteSport,
        currentUser.location,
        currentUser.name,
        currentUser.phoneNumber,
    ]);

    function updateField<Key extends keyof EditProfileFormState>(
        field: Key,
        value: EditProfileFormState[Key],
    ) {
        setFormData((currentData) => ({
            ...currentData,
            [field]: value,
        }));

        if (saveMessage) {
            setSaveMessage("");
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSaving(true);
        setSaveMessage("");

        try {
            await updateProfile({
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone_number: formData.phone,
            });

            setSaveMessage("Profile changes saved successfully.");
        } catch {
            setSaveMessage("We could not save your profile changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Edit Profile</h1>
                    <p>Update your account information and public fan profile.</p>
                </div>

                <Link to="/profile" className={styles.closeButton}>
                    <X size={18} strokeWidth={2.4} aria-hidden="true" />
                    Cancel
                </Link>
            </header>

            <form className={styles.formLayout} onSubmit={handleSubmit}>
                <aside className={styles.sideColumn}>
                    <section className={styles.photoCard}>
                        <div className={styles.avatarWrap}>
                            <span>{currentUser.avatarInitials}</span>

                            <button type="button" aria-label="Upload profile photo">
                                <Camera size={20} strokeWidth={2.4} />
                            </button>
                        </div>

                        <h2>{currentUser.name}</h2>
                        <p>{currentUser.membership}</p>

                        <button type="button" className={styles.uploadButton}>
                            Upload New Photo
                        </button>

                        <small>Recommended size: 400 × 400px. Max file size: 2MB.</small>
                    </section>

                    <section className={styles.completionCard}>
                        <h2>Profile Completion</h2>

                        <div className={styles.progressInfo}>
                            <strong>75%</strong>
                            <span>Complete</span>
                        </div>

                        <div className={styles.progressTrack}>
                            <span />
                        </div>

                        <ul>
                            {completionItems.map((item) => (
                                <li key={item.label}>
                                    <CheckCircle2
                                        size={18}
                                        strokeWidth={2.3}
                                        aria-hidden="true"
                                        className={item.complete ? styles.completeIcon : styles.pendingIcon}
                                    />
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className={styles.privacyCard}>
                        <ShieldCheck size={34} strokeWidth={2.2} aria-hidden="true" />

                        <div>
                            <h2>Public Profile</h2>
                            <p>
                                Your name, followed clubs, interests, and badges may appear on
                                your public fan profile.
                            </p>
                        </div>

                        <Link to="/profile/privacy">Manage Privacy</Link>
                    </section>
                </aside>

                <main className={styles.mainColumn}>
                    {saveMessage ? (
                        <div className={styles.saveMessage} role="status">
                            <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                            {saveMessage}
                        </div>
                    ) : null}

                    <section className={styles.formCard}>
                        <div className={styles.sectionHeader}>
                            <span>
                                <User size={22} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Personal Information</h2>
                                <p>These details help us personalize your League OS account.</p>
                            </div>
                        </div>

                        <div className={styles.twoColumn}>
                            <label className={styles.field}>
                                <span>First Name</span>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(event) =>
                                        updateField("firstName", event.target.value)
                                    }
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Last Name</span>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(event) =>
                                        updateField("lastName", event.target.value)
                                    }
                                />
                            </label>
                        </div>

                        <div className={styles.twoColumn}>
                            <label className={styles.field}>
                                <span>Username</span>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(event) =>
                                        updateField("username", event.target.value)
                                    }
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Date of Birth</span>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(event) =>
                                        updateField("dateOfBirth", event.target.value)
                                    }
                                />
                            </label>
                        </div>

                        <div className={styles.twoColumn}>
                            <label className={styles.field}>
                                <span>Gender</span>
                                <select
                                    value={formData.gender}
                                    onChange={(event) => updateField("gender", event.target.value)}
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Prefer not to say</option>
                                </select>
                            </label>

                            <label className={styles.field}>
                                <span>Favourite Sport</span>
                                <select
                                    value={formData.favoriteSport}
                                    onChange={(event) =>
                                        updateField("favoriteSport", event.target.value)
                                    }
                                >
                                    <option>Rugby</option>
                                    <option>Football</option>
                                    <option>Basketball</option>
                                    <option>All Sports</option>
                                </select>
                            </label>
                        </div>

                        <label className={styles.field}>
                            <span>Bio</span>
                            <textarea
                                rows={5}
                                value={formData.bio}
                                onChange={(event) => updateField("bio", event.target.value)}
                            />
                        </label>
                    </section>

                    <section className={styles.formCard}>
                        <div className={styles.sectionHeader}>
                            <span>
                                <Mail size={22} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Contact Details</h2>
                                <p>Used for login, alerts, ticketing, and membership updates.</p>
                            </div>
                        </div>

                        <div className={styles.twoColumn}>
                            <label className={styles.field}>
                                <span>Email Address</span>

                                <div className={styles.inputWithIcon}>
                                    <Mail size={18} strokeWidth={2.2} aria-hidden="true" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(event) =>
                                            updateField("email", event.target.value)
                                        }
                                    />
                                </div>
                            </label>

                            <label className={styles.field}>
                                <span>Phone Number</span>

                                <div className={styles.inputWithIcon}>
                                    <Phone size={18} strokeWidth={2.2} aria-hidden="true" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(event) =>
                                            updateField("phone", event.target.value)
                                        }
                                    />
                                </div>
                            </label>
                        </div>

                        <label className={styles.field}>
                            <span>Location</span>

                            <div className={styles.inputWithIcon}>
                                <MapPin size={18} strokeWidth={2.2} aria-hidden="true" />
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(event) =>
                                        updateField("location", event.target.value)
                                    }
                                />
                            </div>
                        </label>
                    </section>

                    <section className={styles.actionsCard}>
                        <div>
                            <h2>Save Profile Changes</h2>
                            <p>
                                Review your information before saving. Changes are saved to your
                                League OS account.
                            </p>
                        </div>

                        <div className={styles.actionButtons}>
                            <Link to="/profile" className={styles.secondaryButton}>
                                Cancel
                            </Link>

                            <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                                <Save size={18} strokeWidth={2.4} aria-hidden="true" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </section>
                </main>
            </form>
        </section>
    );
}

export default EditProfilePage;