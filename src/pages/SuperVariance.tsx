
import { useState, useMemo } from "react";
import "../styles/pages/SportVariance.css";
import "../components/SuperAdminSideBar.css";
import {
    Menu,
    X,
    Plus,
    Pencil,
    
} from "lucide-react";

import Footer from "../components/Footer";

import Sidebar from "../components/SuperAdminSideBar";

/* ---------------- TYPES ---------------- */

type Variant = {
    id: string;
    sport: "Football" | "Basketball" | "Rugby";
    name: string;
    shortCode: string;
    teamSize: number;
    squadMax: number;
    duration: string;
    subs: number | string;
    status: "Active" | "Draft" | "Archived";
    leagues: number;
    updated: string;
};

type FormState = {
    sport: "Football" | "Basketball" | "Rugby";
    name: string;
    shortCode: string;
    teamSize: string;
    squadMax: string;
    duration: string;
    subs: string;
    status: "Active" | "Draft" | "Archived";
};

/* ---------------- CONSTANTS ---------------- */

const SPORTS: Variant["sport"][] = ["Football", "Basketball", "Rugby"];

const SPORT_ACCENT: Record<Variant["sport"], string> = {
    Football: "green",
    Basketball: "amber",
    Rugby: "purple",
};

const STATUS_TONE: Record<Variant["status"], string> = {
    Active: "green",
    Draft: "amber",
    Archived: "muted",
};

/* ---------------- DATA ---------------- */

const INITIAL_VARIANTS: Variant[] = [
    {
        id: "v1",
        sport: "Football",
        name: "11-a-side",
        shortCode: "FB-11",
        teamSize: 11,
        squadMax: 23,
        duration: "90 min",
        subs: 5,
        status: "Active",
        leagues: 14,
        updated: "2 days ago",
    },
    {
        id: "v2",
        sport: "Football",
        name: "7-a-side",
        shortCode: "FB-07",
        teamSize: 7,
        squadMax: 14,
        duration: "60 min",
        subs: "Rolling",
        status: "Active",
        leagues: 6,
        updated: "1 week ago",
    },
    {
        id: "v3",
        sport: "Football",
        name: "Futsal",
        shortCode: "FB-FS",
        teamSize: 5,
        squadMax: 12,
        duration: "40 min",
        subs: "Rolling",
        status: "Draft",
        leagues: 0,
        updated: "3 hours ago",
    },
    {
        id: "v4",
        sport: "Basketball",
        name: "5-on-5",
        shortCode: "BB-05",
        teamSize: 5,
        squadMax: 15,
        duration: "40 min",
        subs: "Unlimited",
        status: "Active",
        leagues: 9,
        updated: "5 days ago",
    },
    {
        id: "v5",
        sport: "Basketball",
        name: "3x3",
        shortCode: "BB-03",
        teamSize: 3,
        squadMax: 6,
        duration: "10 min",
        subs: "Unlimited",
        status: "Active",
        leagues: 3,
        updated: "2 weeks ago",
    },
];

/* ---------------- FORM ---------------- */

const EMPTY_FORM: FormState = {
    sport: "Football",
    name: "",
    shortCode: "",
    teamSize: "",
    squadMax: "",
    duration: "",
    subs: "",
    status: "Draft",
};

/* ---------------- COMPONENT ---------------- */

export default function SportVariance() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [variants, setVariants] = useState<Variant[]>(INITIAL_VARIANTS);

    const [activeSport, setActiveSport] = useState<"All" | Variant["sport"]>("All");
    const [statusFilter, setStatusFilter] = useState<"All" | Variant["status"]>("All");
    const [query, setQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    /* ---------------- FILTERED ---------------- */

    const filtered = useMemo(() => {
        return variants.filter((v) => {
            if (activeSport !== "All" && v.sport !== activeSport) return false;
            if (statusFilter !== "All" && v.status !== statusFilter) return false;
            if (query && !v.name.toLowerCase().includes(query.toLowerCase())) return false;
            return true;
        });
    }, [variants, activeSport, statusFilter, query]);

    /* ---------------- COUNTS (USED IN UI) ---------------- */

    const counts = useMemo(() => {
        const c: Record<string, number> = {
            All: variants.length,
            Football: 0,
            Basketball: 0,
            Rugby: 0,
        };

        variants.forEach((v) => {
            c[v.sport]++;
        });

        return c;
    }, [variants]);

    /* ---------------- ACTIONS (ALL USED) ---------------- */

    function openCreate() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    }

    function openEdit(variant: Variant) {
        setEditingId(variant.id);
        setForm({
            sport: variant.sport,
            name: variant.name,
            shortCode: variant.shortCode,
            teamSize: String(variant.teamSize),
            squadMax: String(variant.squadMax),
            duration: variant.duration,
            subs: String(variant.subs),
            status: variant.status,
        });
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const normalized: Omit<Variant, "id" | "leagues" | "updated"> = {
            sport: form.sport,
            name: form.name,
            shortCode: form.shortCode,
            teamSize: Number(form.teamSize),
            squadMax: Number(form.squadMax),
            duration: form.duration,
            subs: form.subs,
            status: form.status,
        };

        if (editingId) {
            setVariants((prev) =>
                prev.map((v) =>
                    v.id === editingId
                        ? { ...v, ...normalized, updated: "Just now" }
                        : v
                )
            );
        } else {
            const newVariant: Variant = {
                id: `v${Date.now()}`,
                ...normalized,
                leagues: 0,
                updated: "Just now",
            };

            setVariants((prev) => [newVariant, ...prev]);
        }

        closeModal();
    }

    function toggleArchive(variant: Variant) {
        setVariants((prev) =>
            prev.map((v) =>
                v.id === variant.id
                    ? {
                          ...v,
                          status:
                              v.status === "Archived" ? "Draft" : "Archived",
                          updated: "Just now",
                      }
                    : v
            )
        );
    }

    /* ---------------- UI (ALL VALUES USED HERE) ---------------- */

    return (
        <div
            className="super-admin"
            
        >
            <header className="admin-header">
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X /> : <Menu />}
                </button>

                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                />
            </header>
<div className="sport-tabs">
    {SPORTS.map((sport) => (
        <button
            key={sport}
            className={`sport-tab ${activeSport === sport ? "active" : ""}`}
            onClick={() => setActiveSport(sport)}
        >
            {sport}
        </button>
    ))}
</div>
            <div className="dashboard-layout">
                <Sidebar collapsed={!sidebarOpen} activeNav="variants" onChange={() => {}} />

                <main className="main-content">

                    {/* FILTERS */}
                    <div className="filters">
                        <button onClick={() => setActiveSport("All")}>
                            All ({counts.All})
                        </button>
                        <button onClick={() => setActiveSport("Football")}>
                            Football ({counts.Football})
                        </button>
                        <button onClick={() => setActiveSport("Basketball")}>
                            Basketball ({counts.Basketball})
                        </button>
                        <button onClick={() => setActiveSport("Rugby")}>
                            Rugby ({counts.Rugby})
                        </button>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as any)
                            }
                        >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>

                    <button onClick={openCreate}>
                        <Plus /> New Variant
                    </button>

                    {/* GRID */}
                    <section className="variant-grid">
                        {filtered.map((v) => (
                            <div
                                key={v.id}
                                className={`variant-card accent-${SPORT_ACCENT[v.sport]}`}
                            >
                                <h3>{v.name}</h3>

                                <span
                                    className={`status-badge tone-${STATUS_TONE[v.status]}`}
                                >
                                    {v.status}
                                </span>

                                <button onClick={() => openEdit(v)}>
                                    <Pencil />
                                </button>

                                <button onClick={() => toggleArchive(v)}>
                                    {v.status}
                                </button>
                            </div>
                        ))}
                    </section>
                </main>
            </div>

            <Footer />

            {/* MODAL */}
            {modalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleSubmit}>
                            <input
                                value={form.name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        name: e.target.value,
                                    })
                                }
                            />
                            <button type="submit">Save</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
