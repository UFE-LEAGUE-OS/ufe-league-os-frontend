import {
    Bell,
    Camera,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Heart,
    HelpCircle,
    Lock,
    Mail,
    MapPin,
    PenLine,
    Phone,
    Save,
    ShieldCheck,
    Trash2,
    Trophy,
    User,
} from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { BackendProfile } from "../../data/currentUser";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { removeAvatar, updateProfile, uploadAvatar } from "../../services/authService.js";
import styles from "./ProfileOverviewPage.module.css";

const PROFILE_UPDATED_EVENT = "leagueos:profile-updated";

function notifyProfileShellUpdated() {
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

type EditableField =
    | "firstName"
    | "lastName"
    | "username"
    | "phone"
    | "location"
    | "dateOfBirth"
    | "gender"
    | "favoriteSport"
    | "bio";

interface ProfileFormState {
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

const profileActions = [
    {
        title: "Profile & Interests",
        description: "Manage sports, clubs, leagues and competitions that shape your fan experience.",
        href: "/profile/interests",
        icon: Heart,
        tone: "purple",
    },
    {
        title: "My Clubs",
        description: "Manage followed clubs, memberships and club notification preferences.",
        href: "/profile/clubs",
        icon: ShieldCheck,
        tone: "orange",
    },
    {
        title: "Payments",
        description: "View membership payments, ticket receipts, refunds and checkout history.",
        href: "/profile/payments",
        icon: CreditCard,
        tone: "green",
    },
    {
        title: "Notifications",
        description: "Choose what you want to hear about and how you want to be notified.",
        href: "/profile/notifications",
        icon: Bell,
        tone: "blue",
    },
    {
        title: "Privacy & Security",
        description: "Control account security, privacy settings and connected access.",
        href: "/profile/privacy",
        icon: Lock,
        tone: "yellow",
    },
    {
        title: "Help & Support",
        description: "Get help, browse FAQs or contact the League OS support team.",
        href: "/profile/support",
        icon: HelpCircle,
        tone: "cyan",
    },
];

const recentActivity = [
    {
        title: "Profile Updated",
        description: "You updated your profile information",
        time: "2h ago",
        icon: User,
        tone: "purple",
    },
    {
        title: "Joined City Oilers",
        description: "You joined City Oilers Basketball Club",
        time: "1d ago",
        icon: ShieldCheck,
        tone: "orange",
    },
    {
        title: "Payment Method Added",
        description: "MTN Mobile Money •••• 4242",
        time: "2d ago",
        icon: CreditCard,
        tone: "green",
    },
    {
        title: "Notification Settings",
        description: "You updated your notification preferences",
        time: "3d ago",
        icon: Bell,
        tone: "blue",
    },
];

const quickActions = [
    {
        title: "Manage Alerts",
        description: "Customize your notifications",
        href: "/profile/notifications",
        icon: Bell,
    },
    {
        title: "Contact Support",
        description: "Get help from our support team",
        href: "/profile/support",
        icon: HelpCircle,
    },
];

function cleanValue(value: unknown, fallback = "") {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function createInitialFormState(
    profile: BackendProfile | null | undefined,
    currentUser?: ReturnType<typeof useCurrentUser>["currentUser"],
): ProfileFormState {
    const nameParts = currentUser?.name ? currentUser.name.split(" ") : [];
    const currentEmail =
        currentUser?.email && currentUser.email !== "No email available"
            ? currentUser.email
            : "";
    const email = cleanValue(profile?.email, currentEmail);

    const firstName = cleanValue(profile?.first_name, nameParts[0] ?? "");
    const lastName = cleanValue(
        profile?.last_name,
        nameParts.slice(1).join(" ") || "",
    );

    const username =
        cleanValue(profile?.username) ||
        (email.includes("@") ? email.split("@")[0] ?? "" : "");

    const currentPhone =
        currentUser?.phoneNumber && currentUser.phoneNumber !== "No phone number added"
            ? currentUser.phoneNumber
            : "";

    return {
        firstName,
        lastName,
        username,
        email,
        phone: cleanValue(profile?.phone_number, currentPhone),
        location: cleanValue(profile?.location, currentUser?.location ?? ""),
        dateOfBirth: cleanValue(profile?.date_of_birth),
        gender: cleanValue(profile?.gender),
        favoriteSport: cleanValue(
            profile?.favourite_sport || profile?.favorite_sport,
            currentUser?.favoriteSport ?? "",
        ),
        bio: cleanValue(profile?.bio),
    };
}

function ProfileOverviewPage() {
    const { currentUser, profile, isLoading, refreshProfile } = useCurrentUser();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState<ProfileFormState>(() =>
        createInitialFormState(profile, currentUser),
    );
    const [editableFields, setEditableFields] = useState<Record<EditableField, boolean>>({
        firstName: false,
        lastName: false,
        username: false,
        phone: false,
        location: false,
        dateOfBirth: false,
        gender: false,
        favoriteSport: false,
        bio: false,
    });
    const [statusMessage, setStatusMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    useEffect(() => {
        setFormData(createInitialFormState(profile, currentUser));
    }, [currentUser, profile]);

    function toggleEditableField(field: EditableField) {
        setEditableFields((currentFields) => ({
            ...currentFields,
            [field]: !currentFields[field],
        }));
    }

    function updateField<Key extends keyof ProfileFormState>(
        field: Key,
        value: ProfileFormState[Key],
    ) {
        setFormData((currentData) => ({
            ...currentData,
            [field]: value,
        }));

        if (statusMessage) {
            setStatusMessage("");
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSaving(true);
        setStatusMessage("");

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

            await refreshProfile();
            notifyProfileShellUpdated();

            setEditableFields({
                firstName: false,
                lastName: false,
                username: false,
                phone: false,
                location: false,
                dateOfBirth: false,
                gender: false,
                favoriteSport: false,
                bio: false,
            });

            setStatusMessage("Profile changes saved successfully.");
        } catch {
            setStatusMessage("We could not save your profile changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setStatusMessage("Please upload a valid image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setStatusMessage("Avatar file size must not exceed 2MB.");
            event.target.value = "";
            return;
        }

        setIsUploadingAvatar(true);
        setStatusMessage("");

        try {
            await uploadAvatar(file);
            await refreshProfile();
            notifyProfileShellUpdated();
            setStatusMessage("Profile photo updated successfully.");
        } catch {
            setStatusMessage("We could not upload your profile photo. Please try again.");
        } finally {
            setIsUploadingAvatar(false);
            event.target.value = "";
        }
    }

    async function handleRemoveAvatar() {
        setIsUploadingAvatar(true);
        setStatusMessage("");

        try {
            await removeAvatar();
            await refreshProfile();
            notifyProfileShellUpdated();
            setStatusMessage("Profile photo removed successfully.");
        } catch {
            setStatusMessage("We could not remove your profile photo. Please try again.");
        } finally {
            setIsUploadingAvatar(false);
        }
    }

    function renderTextInput(
        field: EditableField,
        label: string,
        value: string,
        type = "text",
    ) {
        const isEditable = editableFields[field];

        return (
            <label className={styles.profileField}>
                <span>{label}</span>

                <div className={`${styles.profileInputRow} ${isEditable ? styles.editingField : ""}`}>
                    <input
                        type={type}
                        value={value}
                        disabled={!isEditable}
                        onChange={(event) => updateField(field, event.target.value)}
                    />

                    <button
                        type="button"
                        aria-label={`Edit ${label}`}
                        onClick={() => toggleEditableField(field)}
                    >
                        <PenLine size={16} strokeWidth={2.4} />
                    </button>
                </div>
            </label>
        );
    }

    function renderSelectInput(
        field: EditableField,
        label: string,
        value: string,
        options: string[],
    ) {
        const isEditable = editableFields[field];

        return (
            <label className={styles.profileField}>
                <span>{label}</span>

                <div className={`${styles.profileInputRow} ${isEditable ? styles.editingField : ""}`}>
                    <select
                        value={value}
                        disabled={!isEditable}
                        onChange={(event) => updateField(field, event.target.value)}
                    >
                        {options.map((option) => (
                            <option key={option}>{option}</option>
                        ))}
                    </select>

                    <button
                        type="button"
                        aria-label={`Edit ${label}`}
                        onClick={() => toggleEditableField(field)}
                    >
                        <PenLine size={16} strokeWidth={2.4} />
                    </button>
                </div>
            </label>
        );
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <h1>Profile</h1>
                <p>View and update your fan profile, account preferences and support options.</p>
            </header>

            <div className={styles.layoutGrid}>
                <div className={styles.mainColumn}>
                    <form className={styles.profileEditCard} onSubmit={handleSubmit}>
                        <div className={styles.profileEditHeader}>
                            <div className={styles.avatarWrap}>
                                <span>
                                    {currentUser.avatarUrl ? (
                                        <img src={currentUser.avatarUrl} alt="Profile avatar" />
                                    ) : (
                                        currentUser.avatarInitials
                                    )}
                                </span>

                                <button
                                    type="button"
                                    aria-label="Upload profile photo"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                >
                                    <Camera size={15} strokeWidth={2.4} />
                                </button>
                            </div>

                            <div className={styles.profileTitleBlock}>
                                <h2>
                                    {currentUser.name}
                                    <ShieldCheck size={23} strokeWidth={2.4} aria-hidden="true" />
                                </h2>

                                <p>{currentUser.membership}</p>

                                <div className={styles.profileMeta}>
                                    <span>
                                        <Trophy size={16} strokeWidth={2.2} />
                                        Member since {currentUser.memberSince}
                                    </span>

                                    <span>
                                        <MapPin size={16} strokeWidth={2.2} />
                                        {currentUser.location}
                                    </span>
                                </div>

                                <div className={styles.avatarActions}>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingAvatar}
                                    >
                                        {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
                                    </button>

                                    {currentUser.avatarUrl ? (
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            disabled={isUploadingAvatar}
                                        >
                                            <Trash2 size={15} strokeWidth={2.4} />
                                            Remove
                                        </button>
                                    ) : null}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                    className={styles.fileInput}
                                    onChange={handleAvatarChange}
                                />
                            </div>
                        </div>

                        {statusMessage ? (
                            <div className={styles.profileStatusMessage} role="status">
                                <CheckCircle2 size={18} strokeWidth={2.4} />
                                {statusMessage}
                            </div>
                        ) : null}

                        <div className={styles.profileFormGrid}>
                            {renderTextInput("firstName", "First Name", formData.firstName)}
                            {renderTextInput("lastName", "Last Name", formData.lastName)}
                            {renderTextInput("username", "Username", formData.username)}

                            <label className={styles.profileField}>
                                <span>Email Address</span>

                                <div className={`${styles.profileInputRow} ${styles.iconInputRow} ${styles.lockedField}`}>
                                    <Mail size={18} strokeWidth={2.2} aria-hidden="true" />
                                    <input value={formData.email} disabled readOnly />

                                </div>
                            </label>

                            <label className={styles.profileField}>
                                <span>Phone Number</span>

                                <div
                                    className={`${styles.profileInputRow} ${styles.iconInputRow} ${
                                        editableFields.phone ? styles.editingField : ""
                                    }`}
                                >
                                    <Phone size={18} strokeWidth={2.2} aria-hidden="true" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        disabled={!editableFields.phone}
                                        onChange={(event) => updateField("phone", event.target.value)}
                                    />
                                    <button
                                        type="button"
                                        aria-label="Edit phone number"
                                        onClick={() => toggleEditableField("phone")}
                                    >
                                        <PenLine size={16} strokeWidth={2.4} />
                                    </button>
                                </div>
                            </label>

                            {renderTextInput("location", "Location", formData.location)}
                            {renderTextInput("dateOfBirth", "Date of Birth", formData.dateOfBirth, "date")}
                            {renderSelectInput("gender", "Gender", formData.gender, [
                                "Male",
                                "Female",
                                "Prefer not to say",
                            ])}
                            {renderSelectInput("favoriteSport", "Favourite Sport", formData.favoriteSport, [
                                "Rugby",
                                "Football",
                                "Basketball",
                                "All Sports",
                            ])}
                        </div>

                        <label className={`${styles.profileField} ${styles.bioField}`}>
                            <span>Bio / About</span>

                            <div
                                className={`${styles.profileTextareaRow} ${
                                    editableFields.bio ? styles.editingField : ""
                                }`}
                            >
                                <textarea
                                    rows={4}
                                    value={formData.bio}
                                    disabled={!editableFields.bio}
                                    maxLength={220}
                                    onChange={(event) => updateField("bio", event.target.value)}
                                />

                                <button
                                    type="button"
                                    aria-label="Edit bio"
                                    onClick={() => toggleEditableField("bio")}
                                >
                                    <PenLine size={16} strokeWidth={2.4} />
                                </button>

                                <small>{formData.bio.length}/220</small>
                            </div>
                        </label>

                        <div className={styles.profileFormActions}>

                            <button type="submit" disabled={isSaving || isLoading}>
                                <Save size={18} strokeWidth={2.4} />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>

                    <section className={styles.compactActionGrid} aria-label="Profile actions">
                        {profileActions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <Link
                                    to={action.href}
                                    className={`${styles.compactActionCard} ${styles[action.tone]}`}
                                    key={action.title}
                                >
                                    <span className={styles.actionIcon}>
                                        <Icon size={24} strokeWidth={2.2} aria-hidden="true" />
                                    </span>

                                    <div>
                                        <h2>{action.title}</h2>
                                        <p>{action.description}</p>
                                    </div>

                                    <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
                                </Link>
                            );
                        })}
                    </section>
                </div>

                <aside className={styles.sideColumn}>
                    <section className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <h2>Recent Activity</h2>
                            <Link to="/profile">View All</Link>
                        </div>

                        <div className={styles.activityList}>
                            {recentActivity.map((activity) => {
                                const Icon = activity.icon;

                                return (
                                    <article className={styles.activityItem} key={activity.title}>
                                        <span className={`${styles.activityIcon} ${styles[activity.tone]}`}>
                                            <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
                                        </span>

                                        <div>
                                            <h3>{activity.title}</h3>
                                            <p>{activity.description}</p>
                                        </div>

                                        <time>{activity.time}</time>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.sidePanel}>
                        <h2>Quick Actions</h2>

                        <div className={styles.quickActionList}>
                            {quickActions.map((action) => {
                                const Icon = action.icon;

                                return (
                                    <Link to={action.href} className={styles.quickAction} key={action.title}>
                                        <span>
                                            <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
                                        </span>

                                        <div>
                                            <strong>{action.title}</strong>
                                            <p>{action.description}</p>
                                        </div>

                                        <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.supportCard}>
                        <span>
                            <HelpCircle size={48} strokeWidth={2.2} aria-hidden="true" />
                        </span>

                        <div>
                            <h2>Need Help?</h2>
                            <p>Our support team is here for you.</p>
                        </div>

                        <Link to="/profile/support">Contact Support →</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default ProfileOverviewPage;
