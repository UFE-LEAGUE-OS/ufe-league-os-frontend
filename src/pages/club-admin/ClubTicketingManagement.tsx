import {
  BarChart3,
  Boxes,
  CalendarDays,
  FileDown,
  Plus,
  Radio,
  RefreshCw,
  Tag,
  X,
} from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminWorkspaceLayout, {
  type AdminWorkspaceNavItem,
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
  WorkspaceStatGrid,
  WorkspaceStatus,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getClubAdminWorkspace,
  type AdminWorkspaceMatch,
  type ClubAdminWorkspaceData,
} from "../../services/adminWorkspaceService";
import {
  createTicketType,
  formatTicketCurrency,
  getClubSalesSummary,
  getMatchGateConfig,
  getMatchTicketTypes,
  saveMatchGateConfig,
  setTicketTypeStatus,
  updateTicketType,
  type CreateTicketTypePayload,
  type GateConfigPayload,
  type MatchSalesSummary,
  type TicketTypeApi,
  type TicketTypeStatus,
} from "../../services/clubTicketingService";
import "./ClubTicketingManagement.css";

type TabKey = "games" | "pricing" | "inventory" | "publish" | "performance";

type HomeMatch = AdminWorkspaceMatch & {
  ticket_types?: number;
  tickets_sold?: number;
  checked_in?: number;
};

const navItems: AdminWorkspaceNavItem<TabKey>[] = [
  { key: "games", label: "Home Games & Gates", icon: CalendarDays },
  { key: "pricing", label: "Ticket Pricing", icon: Tag },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "publish", label: "Publish & Go-Live", icon: Radio },
  { key: "performance", label: "Sales Performance", icon: BarChart3 },
];

const emptyTicketTypeForm = {
  name: "",
  description: "",
  price: "",
  currency: "UGX",
  quantity_available: "",
  sale_start_at: "",
  sale_end_at: "",
};

const emptyGateConfigForm = {
  gate_name: "",
  capacity: "",
  notes: "",
  is_ticketing_enabled: false,
};

function downloadCsv(filename: string, rows: string[][]) {
  const csvContent = rows
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function MatchSelector({
  matches,
  selectedMatchId,
  onChange,
}: {
  matches: HomeMatch[];
  selectedMatchId: number | null;
  onChange: (matchId: number) => void;
}) {
  return (
    <div className="ctm-match-selector">
      <label htmlFor="ctm-match-select">Home game</label>
      <select
        id="ctm-match-select"
        value={selectedMatchId ?? ""}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {matches.map((match) => (
          <option key={match.id} value={match.id}>
            {match.label} · {formatWorkspaceDate(match.match_date)}
          </option>
        ))}
      </select>
    </div>
  );
}

function InventoryRow({
  ticketType,
  onSave,
}: {
  ticketType: TicketTypeApi;
  onSave: (nextQuantity: number) => void;
}) {
  const [value, setValue] = useState(String(ticketType.quantity_available));

  useEffect(() => {
    setValue(String(ticketType.quantity_available));
  }, [ticketType.quantity_available]);

  const sellThrough =
    ticketType.quantity_available > 0
      ? Math.round((ticketType.quantity_sold / ticketType.quantity_available) * 100)
      : 0;

  return (
    <tr>
      <td>
        <span className={styles.tablePrimary}>{ticketType.name}</span>
      </td>
      <td>
        <div className="ctm-inline-edit">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            type="button"
            className="ctm-link-button"
            onClick={() => onSave(Number(value) || 0)}
          >
            Save
          </button>
        </div>
      </td>
      <td>{ticketType.quantity_sold}</td>
      <td>{ticketType.active_reserved_quantity}</td>
      <td>{ticketType.remaining_quantity}</td>
      <td>{sellThrough}%</td>
    </tr>
  );
}

export default function ClubTicketingManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>("games");

  const [workspace, setWorkspace] = useState<ClubAdminWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const [ticketTypesByMatch, setTicketTypesByMatch] = useState<
    Record<number, TicketTypeApi[]>
  >({});
  const [isLoadingTicketTypes, setIsLoadingTicketTypes] = useState(false);
  const [ticketTypesError, setTicketTypesError] = useState("");

  const [showTicketTypeForm, setShowTicketTypeForm] = useState(false);
  const [editingTicketTypeId, setEditingTicketTypeId] = useState<number | null>(null);
  const [ticketTypeForm, setTicketTypeForm] = useState(emptyTicketTypeForm);
  const [ticketTypeFormError, setTicketTypeFormError] = useState("");
  const [isSavingTicketType, setIsSavingTicketType] = useState(false);

  const [gateConfigForm, setGateConfigForm] = useState(emptyGateConfigForm);
  const [isLoadingGateConfig, setIsLoadingGateConfig] = useState(false);
  const [isSavingGateConfig, setIsSavingGateConfig] = useState(false);
  const [gateConfigError, setGateConfigError] = useState("");

  const [salesSummaries, setSalesSummaries] = useState<MatchSalesSummary[] | null>(null);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [salesError, setSalesError] = useState("");

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const workspaceData = await getClubAdminWorkspace();
      setWorkspace(workspaceData);
    } catch (loadError) {
      setError(
        getApiErrorMessage(
          loadError,
          "The club ticketing workspace could not be loaded."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const homeMatches = useMemo<HomeMatch[]>(() => {
    if (!workspace) return [];

    const byId = new Map<number, HomeMatch>();

    workspace.upcoming_fixtures
      .filter((match) => match.home_club_id === workspace.club.id)
      .forEach((match) => byId.set(match.id, match));

    workspace.ticket_events
      .filter((match) => match.home_club_id === workspace.club.id)
      .forEach((match) => {
        byId.set(match.id, { ...byId.get(match.id), ...match });
      });

    return Array.from(byId.values()).sort(
      (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    );
  }, [workspace]);

  useEffect(() => {
    if (!selectedMatchId && homeMatches.length > 0) {
      setSelectedMatchId(homeMatches[0].id);
    }
  }, [homeMatches, selectedMatchId]);

  const loadTicketTypesForMatch = useCallback(async (matchId: number) => {
    setIsLoadingTicketTypes(true);
    setTicketTypesError("");

    try {
      const { ticket_types } = await getMatchTicketTypes(matchId);
      setTicketTypesByMatch((prev) => ({ ...prev, [matchId]: ticket_types }));
    } catch (loadError) {
      setTicketTypesError(
        getApiErrorMessage(
          loadError,
          "Ticket types for this match could not be loaded."
        )
      );
    } finally {
      setIsLoadingTicketTypes(false);
    }
  }, []);

  useEffect(() => {
    if (
      selectedMatchId &&
      (activeTab === "pricing" || activeTab === "inventory" || activeTab === "publish") &&
      !ticketTypesByMatch[selectedMatchId]
    ) {
      void loadTicketTypesForMatch(selectedMatchId);
    }
  }, [selectedMatchId, activeTab, ticketTypesByMatch, loadTicketTypesForMatch]);

  const loadGateConfigForMatch = useCallback(async (matchId: number) => {
    setIsLoadingGateConfig(true);
    setGateConfigError("");

    try {
      const config = await getMatchGateConfig(matchId);
      setGateConfigForm(
        config
          ? {
              gate_name: config.gate_name,
              capacity: config.capacity !== null ? String(config.capacity) : "",
              notes: config.notes,
              is_ticketing_enabled: config.is_ticketing_enabled,
            }
          : emptyGateConfigForm
      );
    } catch {
      // Treated as "not configured yet" — no error banner on a missing gate config.
      setGateConfigForm(emptyGateConfigForm);
    } finally {
      setIsLoadingGateConfig(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMatchId && activeTab === "games") {
      void loadGateConfigForMatch(selectedMatchId);
    }
  }, [selectedMatchId, activeTab, loadGateConfigForMatch]);

  const loadSalesSummary = useCallback(async () => {
    setIsLoadingSales(true);
    setSalesError("");

    try {
      const summaries = await getClubSalesSummary(
        homeMatches.map((match) => ({
          id: match.id,
          label: match.label,
          match_date: match.match_date,
        }))
      );
      setSalesSummaries(summaries);
    } catch (loadError) {
      setSalesError(
        getApiErrorMessage(loadError, "Sales performance data could not be loaded.")
      );
    } finally {
      setIsLoadingSales(false);
    }
  }, [homeMatches]);

  useEffect(() => {
    if (activeTab === "performance" && salesSummaries === null && homeMatches.length > 0) {
      void loadSalesSummary();
    }
  }, [activeTab, salesSummaries, homeMatches, loadSalesSummary]);

  function handleSelectMatch(matchId: number) {
    setSelectedMatchId(matchId);
  }

  function goToPricingForMatch(matchId: number) {
    setSelectedMatchId(matchId);
    setActiveTab("pricing");
  }

  const selectedTicketTypes = selectedMatchId
    ? ticketTypesByMatch[selectedMatchId] ?? []
    : [];

  function openCreateTicketType() {
    setEditingTicketTypeId(null);
    setTicketTypeForm(emptyTicketTypeForm);
    setTicketTypeFormError("");
    setShowTicketTypeForm(true);
  }

  function openEditTicketType(ticketType: TicketTypeApi) {
    setEditingTicketTypeId(ticketType.id);
    setTicketTypeForm({
      name: ticketType.name,
      description: ticketType.description,
      price: ticketType.price,
      currency: ticketType.currency,
      quantity_available: String(ticketType.quantity_available),
      sale_start_at: ticketType.sale_start_at ?? "",
      sale_end_at: ticketType.sale_end_at ?? "",
    });
    setTicketTypeFormError("");
    setShowTicketTypeForm(true);
  }

  function closeTicketTypeForm() {
    setShowTicketTypeForm(false);
    setEditingTicketTypeId(null);
    setTicketTypeForm(emptyTicketTypeForm);
    setTicketTypeFormError("");
  }

  async function saveTicketType() {
    if (!selectedMatchId) return;

    if (!ticketTypeForm.name.trim() || !ticketTypeForm.price.trim()) {
      setTicketTypeFormError("Ticket name and price are required.");
      return;
    }

    setIsSavingTicketType(true);
    setTicketTypeFormError("");

    const payload: CreateTicketTypePayload = {
      name: ticketTypeForm.name.trim(),
      description: ticketTypeForm.description.trim(),
      price: ticketTypeForm.price.trim(),
      currency: ticketTypeForm.currency,
      quantity_available: Number(ticketTypeForm.quantity_available) || 0,
      sale_start_at: ticketTypeForm.sale_start_at || null,
      sale_end_at: ticketTypeForm.sale_end_at || null,
    };

    try {
      const saved = editingTicketTypeId
        ? await updateTicketType(editingTicketTypeId, payload)
        : await createTicketType(selectedMatchId, payload);

      setTicketTypesByMatch((prev) => {
        const existing = prev[selectedMatchId] ?? [];
        const next = editingTicketTypeId
          ? existing.map((ticketType) => (ticketType.id === saved.id ? saved : ticketType))
          : [...existing, saved];

        return { ...prev, [selectedMatchId]: next };
      });

      closeTicketTypeForm();
    } catch (saveError) {
      setTicketTypeFormError(
        getApiErrorMessage(saveError, "The ticket type could not be saved.")
      );
    } finally {
      setIsSavingTicketType(false);
    }
  }

  async function saveGateConfig() {
    if (!selectedMatchId) return;

    setIsSavingGateConfig(true);
    setGateConfigError("");

    const payload: GateConfigPayload = {
      match: selectedMatchId,
      gate_name: gateConfigForm.gate_name.trim(),
      capacity: gateConfigForm.capacity ? Number(gateConfigForm.capacity) : null,
      notes: gateConfigForm.notes.trim(),
      is_ticketing_enabled: gateConfigForm.is_ticketing_enabled,
    };

    try {
      await saveMatchGateConfig(selectedMatchId, payload);
    } catch (saveError) {
      setGateConfigError(
        getApiErrorMessage(saveError, "Gate settings could not be saved.")
      );
    } finally {
      setIsSavingGateConfig(false);
    }
  }

  async function updateInventoryQuantity(ticketType: TicketTypeApi, nextQuantity: number) {
    if (!selectedMatchId) return;

    const floor = ticketType.quantity_sold + ticketType.active_reserved_quantity;

    if (nextQuantity < floor) {
      setTicketTypesError(
        `Inventory can't drop below ${floor} (already sold or reserved).`
      );
      return;
    }

    try {
      const updated = await updateTicketType(ticketType.id, {
        quantity_available: nextQuantity,
      });

      setTicketTypesByMatch((prev) => ({
        ...prev,
        [selectedMatchId]: (prev[selectedMatchId] ?? []).map((t) =>
          t.id === updated.id ? updated : t
        ),
      }));
    } catch (updateError) {
      setTicketTypesError(
        getApiErrorMessage(updateError, "Inventory could not be updated.")
      );
    }
  }

  async function handleStatusChange(ticketType: TicketTypeApi, status: TicketTypeStatus) {
    if (!selectedMatchId) return;

    try {
      const updated = await setTicketTypeStatus(ticketType.id, status);

      setTicketTypesByMatch((prev) => ({
        ...prev,
        [selectedMatchId]: (prev[selectedMatchId] ?? []).map((t) =>
          t.id === updated.id ? updated : t
        ),
      }));
    } catch (updateError) {
      setTicketTypesError(
        getApiErrorMessage(updateError, "Ticket status could not be updated.")
      );
    }
  }

  async function handleBulkStatusChange(from: TicketTypeStatus, to: TicketTypeStatus) {
    if (!selectedMatchId) return;

    const targets = selectedTicketTypes.filter((t) => t.status === from);
    if (targets.length === 0) return;

    try {
      const updated = await Promise.all(targets.map((t) => setTicketTypeStatus(t.id, to)));
      const updatedById = new Map(updated.map((t) => [t.id, t]));

      setTicketTypesByMatch((prev) => ({
        ...prev,
        [selectedMatchId]: (prev[selectedMatchId] ?? []).map(
          (t) => updatedById.get(t.id) ?? t
        ),
      }));
    } catch (updateError) {
      setTicketTypesError(getApiErrorMessage(updateError, "Bulk status update failed."));
    }
  }

  function exportSalesCsv() {
    if (!salesSummaries) return;

    const rows = [
      ["Match", "Date", "Revenue", "Tickets Sold", "Available", "Sell-Through %"],
      ...salesSummaries.map((summary) => [
        summary.match_label,
        summary.match_date,
        String(summary.revenue),
        String(summary.tickets_sold),
        String(summary.quantity_available),
        (summary.sell_through_rate * 100).toFixed(1),
      ]),
    ];

    downloadCsv(`${workspace?.club.slug ?? "club"}-ticket-sales.csv`, rows);
  }

  function renderGames() {
    return (
      <>
        <WorkspacePanel
          eyebrow="Home fixtures"
          title="Home Games"
          description="Fixtures where your club is the home side. Select a match to configure ticketing and gate details."
        >
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Ticket Types</th>
                  <th>Sold</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {homeMatches.map((match) => (
                  <tr key={match.id}>
                    <td>
                      <span className={styles.tablePrimary}>{match.label}</span>
                      <span className={styles.tableSecondary}>{match.competition}</span>
                    </td>
                    <td>{formatWorkspaceDate(match.match_date)}</td>
                    <td>{match.venue || "TBC"}</td>
                    <td>{match.ticket_types ?? 0}</td>
                    <td>{match.tickets_sold ?? 0}</td>
                    <td>
                      <button
                        type="button"
                        className="ctm-link-button"
                        onClick={() => goToPricingForMatch(match.id)}
                      >
                        Configure pricing →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WorkspacePanel>

        {selectedMatchId ? (
          <WorkspacePanel
            eyebrow="Gate & venue settings"
            title="Home gate configuration"
            description="Configure gate details and enable ticketing for the selected home game."
            actions={
              <MatchSelector
                matches={homeMatches}
                selectedMatchId={selectedMatchId}
                onChange={handleSelectMatch}
              />
            }
          >
            {isLoadingGateConfig ? (
              <WorkspaceLoading label="Loading gate settings…" />
            ) : (
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="gate-name">Gate name</label>
                  <input
                    id="gate-name"
                    value={gateConfigForm.gate_name}
                    onChange={(e) =>
                      setGateConfigForm({ ...gateConfigForm, gate_name: e.target.value })
                    }
                    placeholder="Main Gate"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="gate-capacity">Capacity</label>
                  <input
                    id="gate-capacity"
                    type="number"
                    min={0}
                    value={gateConfigForm.capacity}
                    onChange={(e) =>
                      setGateConfigForm({ ...gateConfigForm, capacity: e.target.value })
                    }
                    placeholder="5000"
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="gate-notes">Notes</label>
                  <textarea
                    id="gate-notes"
                    rows={3}
                    value={gateConfigForm.notes}
                    onChange={(e) =>
                      setGateConfigForm({ ...gateConfigForm, notes: e.target.value })
                    }
                    placeholder="Entry points, security instructions, accessibility notes…"
                  />
                </div>

                <label className="ctm-checkbox-row">
                  <input
                    type="checkbox"
                    checked={gateConfigForm.is_ticketing_enabled}
                    onChange={(e) =>
                      setGateConfigForm({
                        ...gateConfigForm,
                        is_ticketing_enabled: e.target.checked,
                      })
                    }
                  />
                  Ticketing enabled for this match
                </label>

                {gateConfigError ? <p className="ctm-form-error">{gateConfigError}</p> : null}

                <div className={`${styles.toolbar} ${styles.fieldFull}`}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => void saveGateConfig()}
                    disabled={isSavingGateConfig}
                  >
                    {isSavingGateConfig ? "Saving…" : "Save gate settings"}
                  </button>
                </div>
              </div>
            )}
          </WorkspacePanel>
        ) : null}
      </>
    );
  }

  function renderPricing() {
    return (
      <WorkspacePanel
        eyebrow="Ticket types"
        title="Ticket Type & Pricing Builder"
        description="Create and edit ticket types for the selected home game."
        actions={
          <div className="ctm-match-selector">
            <MatchSelector
              matches={homeMatches}
              selectedMatchId={selectedMatchId}
              onChange={handleSelectMatch}
            />
            <button
              type="button"
              className={styles.primaryButton}
              onClick={openCreateTicketType}
              disabled={!selectedMatchId}
            >
              <Plus size={15} /> New Ticket Type
            </button>
          </div>
        }
      >
        {ticketTypesError ? (
          <div className={styles.validationCard}>
            <strong>Something went wrong</strong>
            <span>{ticketTypesError}</span>
          </div>
        ) : null}

        {isLoadingTicketTypes ? (
          <WorkspaceLoading label="Loading ticket types…" />
        ) : selectedTicketTypes.length === 0 ? (
          <WorkspaceEmpty
            title="No ticket types yet"
            description="Create a ticket type to start selling tickets for this match."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Sale Window</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedTicketTypes.map((ticketType) => (
                  <tr key={ticketType.id}>
                    <td>
                      <span className={styles.tablePrimary}>{ticketType.name}</span>
                      <span className={styles.tableSecondary}>
                        {ticketType.description}
                      </span>
                    </td>
                    <td>
                      {formatTicketCurrency(Number(ticketType.price), ticketType.currency)}
                    </td>
                    <td>
                      {ticketType.sale_start_at
                        ? formatWorkspaceDate(ticketType.sale_start_at)
                        : "—"}
                      {" – "}
                      {ticketType.sale_end_at
                        ? formatWorkspaceDate(ticketType.sale_end_at)
                        : "—"}
                    </td>
                    <td>
                      <WorkspaceStatus value={ticketType.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="ctm-link-button"
                        onClick={() => openEditTicketType(ticketType)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showTicketTypeForm && (
          <div className="ctm-form-overlay" onClick={closeTicketTypeForm}>
            <div className="ctm-form-card" onClick={(e) => e.stopPropagation()}>
              <div className="ctm-form-header">
                <h3>{editingTicketTypeId ? "Edit Ticket Type" : "New Ticket Type"}</h3>
                <button type="button" onClick={closeTicketTypeForm} className="ctm-form-close">
                  <X size={18} />
                </button>
              </div>

              <div className="ctm-form-grid">
                <label>
                  Name
                  <input
                    type="text"
                    value={ticketTypeForm.name}
                    onChange={(e) =>
                      setTicketTypeForm({ ...ticketTypeForm, name: e.target.value })
                    }
                    placeholder="General Admission"
                  />
                </label>
                <label>
                  Price
                  <input
                    type="text"
                    inputMode="decimal"
                    value={ticketTypeForm.price}
                    onChange={(e) =>
                      setTicketTypeForm({ ...ticketTypeForm, price: e.target.value })
                    }
                    placeholder="20000"
                  />
                </label>
                <label>
                  Currency
                  <input
                    type="text"
                    value={ticketTypeForm.currency}
                    onChange={(e) =>
                      setTicketTypeForm({ ...ticketTypeForm, currency: e.target.value })
                    }
                    placeholder="UGX"
                  />
                </label>
                <label>
                  Quantity available
                  <input
                    type="number"
                    min={0}
                    value={ticketTypeForm.quantity_available}
                    onChange={(e) =>
                      setTicketTypeForm({
                        ...ticketTypeForm,
                        quantity_available: e.target.value,
                      })
                    }
                    placeholder="500"
                  />
                </label>
                <label>
                  Sale start
                  <input
                    type="datetime-local"
                    value={ticketTypeForm.sale_start_at}
                    onChange={(e) =>
                      setTicketTypeForm({
                        ...ticketTypeForm,
                        sale_start_at: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Sale end
                  <input
                    type="datetime-local"
                    value={ticketTypeForm.sale_end_at}
                    onChange={(e) =>
                      setTicketTypeForm({ ...ticketTypeForm, sale_end_at: e.target.value })
                    }
                  />
                </label>
                <label className="ctm-form-full">
                  Description
                  <textarea
                    rows={2}
                    value={ticketTypeForm.description}
                    onChange={(e) =>
                      setTicketTypeForm({ ...ticketTypeForm, description: e.target.value })
                    }
                  />
                </label>
              </div>

              {ticketTypeFormError && <p className="ctm-form-error">{ticketTypeFormError}</p>}

              <div className="ctm-form-actions">
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={closeTicketTypeForm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => void saveTicketType()}
                  disabled={isSavingTicketType}
                >
                  {isSavingTicketType
                    ? "Saving..."
                    : editingTicketTypeId
                      ? "Save Changes"
                      : "Create Ticket Type"}
                </button>
              </div>
            </div>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderInventory() {
    return (
      <WorkspacePanel
        eyebrow="Inventory"
        title="Inventory Management"
        description="Track and adjust available capacity per ticket type for the selected home game."
        actions={
          <MatchSelector
            matches={homeMatches}
            selectedMatchId={selectedMatchId}
            onChange={handleSelectMatch}
          />
        }
      >
        {ticketTypesError ? (
          <div className={styles.validationCard}>
            <strong>Something went wrong</strong>
            <span>{ticketTypesError}</span>
          </div>
        ) : null}

        {isLoadingTicketTypes ? (
          <WorkspaceLoading label="Loading inventory…" />
        ) : selectedTicketTypes.length === 0 ? (
          <WorkspaceEmpty
            title="No ticket types configured"
            description="Create ticket types in the Ticket Pricing tab before managing inventory."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Ticket Type</th>
                  <th>Available</th>
                  <th>Sold</th>
                  <th>Reserved</th>
                  <th>Remaining</th>
                  <th>Sell-through</th>
                </tr>
              </thead>
              <tbody>
                {selectedTicketTypes.map((ticketType) => (
                  <InventoryRow
                    key={ticketType.id}
                    ticketType={ticketType}
                    onSave={(nextQuantity) =>
                      void updateInventoryQuantity(ticketType, nextQuantity)
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderPublish() {
    const draftCount = selectedTicketTypes.filter((t) => t.status === "DRAFT").length;
    const onSaleCount = selectedTicketTypes.filter((t) => t.status === "ON_SALE").length;

    return (
      <WorkspacePanel
        eyebrow="Go-live control"
        title="Publish & Go-Live"
        description="Move ticket types between draft, on sale, and closed for the selected home game."
        actions={
          <MatchSelector
            matches={homeMatches}
            selectedMatchId={selectedMatchId}
            onChange={handleSelectMatch}
          />
        }
      >
        <div className="ctm-bulk-actions">
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => void handleBulkStatusChange("DRAFT", "ON_SALE")}
            disabled={draftCount === 0}
          >
            <Radio size={15} /> Go Live ({draftCount} draft)
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => void handleBulkStatusChange("ON_SALE", "CLOSED")}
            disabled={onSaleCount === 0}
          >
            Close Sales ({onSaleCount} on sale)
          </button>
        </div>

        {ticketTypesError ? (
          <div className={styles.validationCard}>
            <strong>Something went wrong</strong>
            <span>{ticketTypesError}</span>
          </div>
        ) : null}

        {isLoadingTicketTypes ? (
          <WorkspaceLoading label="Loading ticket types…" />
        ) : selectedTicketTypes.length === 0 ? (
          <WorkspaceEmpty
            title="No ticket types configured"
            description="Create ticket types in the Ticket Pricing tab before publishing."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Ticket Type</th>
                  <th>Current Status</th>
                  <th>Change To</th>
                </tr>
              </thead>
              <tbody>
                {selectedTicketTypes.map((ticketType) => (
                  <tr key={ticketType.id}>
                    <td>
                      <span className={styles.tablePrimary}>{ticketType.name}</span>
                    </td>
                    <td>
                      <WorkspaceStatus value={ticketType.status} />
                    </td>
                    <td>
                      <select
                        value={ticketType.status}
                        onChange={(e) =>
                          void handleStatusChange(
                            ticketType,
                            e.target.value as TicketTypeStatus
                          )
                        }
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ON_SALE">On Sale</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderPerformance() {
    const totals = (salesSummaries ?? []).reduce(
      (acc, summary) => ({
        revenue: acc.revenue + summary.revenue,
        sold: acc.sold + summary.tickets_sold,
        available: acc.available + summary.quantity_available,
        matchesWithSales: acc.matchesWithSales + (summary.tickets_sold > 0 ? 1 : 0),
      }),
      { revenue: 0, sold: 0, available: 0, matchesWithSales: 0 }
    );

    const sellThroughRate =
      totals.available > 0 ? (totals.sold / totals.available) * 100 : 0;

    const stats = [
      {
        label: "Total Revenue",
        value: formatTicketCurrency(totals.revenue),
        detail: "Across all home games",
        icon: BarChart3,
      },
      {
        label: "Tickets Sold",
        value: totals.sold,
        detail: "Total tickets issued",
        icon: Tag,
      },
      {
        label: "Sell-Through Rate",
        value: `${sellThroughRate.toFixed(1)}%`,
        detail: "Sold vs available inventory",
        icon: Boxes,
      },
      {
        label: "Home Matches With Sales",
        value: totals.matchesWithSales,
        detail: `Of ${homeMatches.length} home games`,
        icon: CalendarDays,
      },
    ];

    return (
      <>
        <WorkspaceStatGrid stats={stats} loading={isLoadingSales} />

        <div className="ctm-notice-banner">
          Figures are computed live from ticket type inventory and sales counts. There is
          no historical trend data yet — a revenue-over-time chart will need a backend
          sales-aggregation endpoint (see the backend requirements handoff).
        </div>

        {salesError ? (
          <WorkspaceError message={salesError} onRetry={() => void loadSalesSummary()} />
        ) : isLoadingSales ? (
          <WorkspaceLoading label="Loading sales performance…" />
        ) : !salesSummaries || salesSummaries.length === 0 ? (
          <WorkspaceEmpty
            title="No sales data yet"
            description="Sales performance will appear here once ticket types have been created for your home games."
          />
        ) : (
          <>
            <WorkspacePanel
              eyebrow="Revenue"
              title="Revenue by home game"
              description="Ticket revenue recorded per home fixture."
              actions={
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={exportSalesCsv}
                >
                  <FileDown size={15} /> Export CSV
                </button>
              }
            >
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={salesSummaries.map((summary) => ({
                      name: summary.match_label,
                      revenue: summary.revenue,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted)" />
                    <YAxis stroke="var(--muted)" />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="var(--green)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </WorkspacePanel>

            <WorkspacePanel
              eyebrow="Breakdown"
              title="Sales by home game"
              description="Revenue, tickets sold, and sell-through rate per home fixture."
            >
              <div className={styles.tableShell}>
                <table>
                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Date</th>
                      <th>Revenue</th>
                      <th>Sold</th>
                      <th>Available</th>
                      <th>Sell-Through</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesSummaries.map((summary) => (
                      <tr key={summary.match_id}>
                        <td>
                          <span className={styles.tablePrimary}>
                            {summary.match_label}
                          </span>
                        </td>
                        <td>{formatWorkspaceDate(summary.match_date)}</td>
                        <td>{formatTicketCurrency(summary.revenue)}</td>
                        <td>{summary.tickets_sold}</td>
                        <td>{summary.quantity_available}</td>
                        <td>{(summary.sell_through_rate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </WorkspacePanel>
          </>
        )}
      </>
    );
  }

  let content: ReactNode = null;

  if (isLoading) {
    content = <WorkspaceLoading label="Loading club ticketing workspace…" />;
  } else if (error) {
    content = <WorkspaceError message={error} onRetry={() => void loadWorkspace()} />;
  } else if (homeMatches.length === 0) {
    content = (
      <WorkspaceEmpty
        title="No home fixtures yet"
        description="Ticketing can be configured once your club has upcoming home fixtures."
      />
    );
  } else if (activeTab === "pricing") {
    content = renderPricing();
  } else if (activeTab === "inventory") {
    content = renderInventory();
  } else if (activeTab === "publish") {
    content = renderPublish();
  } else if (activeTab === "performance") {
    content = renderPerformance();
  } else {
    content = renderGames();
  }

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={workspace?.club.name ?? "Club Ticketing"}
      workspaceSubtitle={
        workspace
          ? `${workspace.club.sport_display} ticketing management`
          : "Club-scoped access"
      }
      eyebrow="Ticketing Management"
      title="Club Ticketing Management"
      description="Configure home games, ticket types, inventory, publish status, and sales performance."
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      publicPath={workspace ? `/clubs/${workspace.club.slug}` : "/clubs"}
      publicLabel="View club page"
      headerActions={
        <button
          type="button"
          className={styles.publicLink}
          disabled={isLoading}
          onClick={() => void loadWorkspace()}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      {content}
    </AdminWorkspaceLayout>
  );
}
