import {
    Camera,
    CheckCircle2,
    Mail,
    MapPin,
    Phone,
    Save,
    Trash2,
    User,
    X,
} from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import type { BackendProfile } from "../../data/currentUser";
import { removeAvatar, updateProfile, uploadAvatar } from "../../services/authService.js";
import styles from "./ProfileInlineEditor.module.css";

interface ProfileInlineEditorProps {
    onCancel: () => void;
}

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

function cleanProfileValue(value: unknown, fallback = "") {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function createInitialFormState(
    currentUser: ReturnType<typeof useCurrentUser>["currentUser"],
    profile?: BackendProfile | null,
): EditProfileFormState {
    const nameParts = currentUser.name.split(" ");
    const firstName = cleanProfileValue(profile?.first_name, nameParts[0] ?? "");
    const lastName = cleanProfileValue(
        profile?.last_name,
        nameParts.slice(1).join(" ") || "",
    );
    const email = cleanProfileValue(
        profile?.email,
        currentUser.email === "No email available" ? "" : currentUser.email,
    );

    return {
        firstName,
        lastName,
        username:
            cleanProfileValue(profile?.username) ||
            (email.includes("@") ? email.split("@")[0] ?? "" : ""),
        email,
        phone: cleanProfileValue(
            profile?.phone_number,
            currentUser.phoneNumber === "No phone number added"
                ? ""
                : currentUser.phoneNumber,
        ),
        location: cleanProfileValue(profile?.location, currentUser.location),
        dateOfBirth: cleanProfileValue(profile?.date_of_birth),
        gender: cleanProfileValue(profile?.gender, "Prefer not to say"),
        favoriteSport: cleanProfileValue(
            profile?.favourite_sport || profile?.favorite_sport,
            currentUser.favoriteSport,
        ),
        bio: cleanProfileValue(
            profile?.bio,
            "Passionate Ugandan sports fan following rugby, football, basketball, and community leagues.",
        ),
    };
}

function ProfileInlineEditor({ onCancel }: ProfileInlineEditorProps) {
    const { currentUser, profile, isLoading, refreshProfile } = useCurrentUser();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState<EditProfileFormState>(() =>
        createInitialFormState(currentUser, profile),
    );
    const [saveMessage, setSaveMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [hasEditedForm, setHasEditedForm] = useState(false);

    useEffect(() => {
        if (!hasEditedForm) {
            setFormData(createInitialFormState(currentUser, profile));
        }
    }, [currentUser, hasEditedForm, profile]);

    function updateField<Key extends keyof EditProfileFormState>(
        field: Key,
        value: EditProfileFormState[Key],
    ) {
        setHasEditedForm(true);

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
                username: formData.username,
                phone_number: formData.phone,
                location: formData.location,
                date_of_birth: formData.dateOfBirth || null,
                gender: formData.gender,
                favourite_sport: formData.favoriteSport,
                bio: formData.bio,
            });

            setHasEditedForm(false);
            await refreshProfile();

            setSaveMessage("Profile changes saved successfully.");
        } catch {
            setSaveMessage("We could not save your profile changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setSaveMessage("Avatar file size must not exceed 2MB.");
            event.target.value = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            setSaveMessage("Please upload a valid image file.");
            event.target.value = "";
            return;
        }

        setIsUploadingAvatar(true);
        setSaveMessage("");

        try {
            await uploadAvatar(file);
            await refreshProfile();
            setSaveMessage("Profile photo updated successfully.");
        } catch {
            setSaveMessage("We could not upload your profile photo. Please try again.");
        } finally {
            setIsUploadingAvatar(false);
            event.target.value = "";
        }
    }

    async function handleRemoveAvatar() {
        setIsUploadingAvatar(true);
        setSaveMessage("");

        try {
            await removeAvatar();
            await refreshProfile();
            setSaveMessage("Profile photo removed successfully.");
        } catch {
            setSaveMessage("We could not remove your profile photo. Please try again.");
        } finally {
            setIsUploadingAvatar(false);
        }
    }

    return (
        <form className={styles.editor} onSubmit={handleSubmit}>
            <div className={styles.editorHeader}>
                <div>
                    <h2>Edit Profile</h2>
                    <p>
                        Update the details that can change. Your email address is fixed
                        because it is used for login and OTP verification.
                    </p>
                </div>

                <button type="button" className={styles.closeButton} onClick={onCancel}>
                    <X size={18} strokeWidth={2.4} aria-hidden="true" />
                    Close
                </button>
            </div>

            <div className={styles.editorGrid}>
                <aside className={styles.photoCard}>
                    <div className={styles.avatarWrap}>
                        {currentUser.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt="Profile avatar" />
                        ) : (
                            <span>{currentUser.avatarInitials}</span>
                        )}

                        <button
                            type="button"
                            aria-label="Upload profile photo"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                        >
                            <Camera size={19} strokeWidth={2.4} />
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className={styles.fileInput}
                        onChange={handleAvatarChange}
                    />

                    <h3>{currentUser.name}</h3>
                    <p>{currentUser.membership}</p>

                    <div className={styles.avatarActions}>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                        >
                            {isUploadingAvatar ? "Uploading..." : "Upload Photo"}
                        </button>

                        {currentUser.avatarUrl ? (
                            <button
                                type="button"
                                className={styles.removeAvatarButton}
                                onClick={handleRemoveAvatar}
                                disabled={isUploadingAvatar}
                            >
                                <Trash2 size={16} strokeWidth={2.3} aria-hidden="true" />
                                Remove
                            </button>
                        ) : null}
                    </div>

                    <small>JPEG, PNG, WEBP, or GIF. Max file size: 2MB.</small>
                </aside>

                <main className={styles.formCard}>
                    {saveMessage ? (
                        <div className={styles.saveMessage} role="status">
                            <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
                            {saveMessage}
                        </div>
                    ) : null}

                    <div className={styles.sectionHeader}>
                        <span>
                            <User size={22} strokeWidth={2.3} aria-hidden="true" />
                        </span>

                        <div>
                            <h3>Editable Information</h3>
                            <p>
                                These fields update your League OS profile. Email stays locked.
                            </p>
                        </div>
                    </div>

                    <div className={styles.twoColumn}>
                        <label className={styles.field}>
                            <span>First Name</span>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(event) => updateField("firstName", event.target.value)}
                            />
                        </label>

                        <label className={styles.field}>
                            <span>Last Name</span>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(event) => updateField("lastName", event.target.value)}
                            />
                        </label>
                    </div>

                    <div className={styles.twoColumn}>
                        <label className={styles.field}>
                            <span>Username</span>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(event) => updateField("username", event.target.value)}
                            />
                        </label>

                        <label className={styles.field}>
                            <span>Email Address</span>
                            <div className={`${styles.inputWithIcon} ${styles.lockedInput}`}>
                                <Mail size={18} strokeWidth={2.2} aria-hidden="true" />
                                <input type="email" value={formData.email} disabled readOnly />
                            </div>
                            <small>Email cannot be changed here because it is used for login.</small>
                        </label>
                    </div>

                    <div className={styles.twoColumn}>
                        <label className={styles.field}>
                            <span>Phone Number</span>
                            <div className={styles.inputWithIcon}>
                                <Phone size={18} strokeWidth={2.2} aria-hidden="true" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(event) => updateField("phone", event.target.value)}
                                />
                            </div>
                        </label>

                        <label className={styles.field}>
                            <span>Location</span>
                            <div className={styles.inputWithIcon}>
                                <MapPin size={18} strokeWidth={2.2} aria-hidden="true" />
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(event) => updateField("location", event.target.value)}
                                />
                            </div>
                        </label>
                    </div>

                    <div className={styles.twoColumn}>
                        <label className={styles.field}>
                            <span>Date of Birth</span>
                            <input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(event) => updateField("dateOfBirth", event.target.value)}
                            />
                        </label>

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
                    </div>

                    <div className={styles.twoColumn}>
                        <label className={styles.field}>
                            <span>Favourite Sport</span>
                            <select
                                value={formData.favoriteSport}
                                onChange={(event) => updateField("favoriteSport", event.target.value)}
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
                            rows={4}
                            value={formData.bio}
                            onChange={(event) => updateField("bio", event.target.value)}
                        />
                    </label>

                    <div className={styles.actionButtons}>
                        <button type="button" className={styles.secondaryButton} onClick={onCancel}>
                            Cancel
                        </button>

                        <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                            <Save size={18} strokeWidth={2.4} aria-hidden="true" />
                            {isSaving ? "Saving..." : isLoading ? "Loading..." : "Save Changes"}
                        </button>
                    </div>
                </main>
            </div>
        </form>
    );
}

export default ProfileInlineEditor;
