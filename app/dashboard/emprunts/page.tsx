"use client";

import { useState, useEffect, useCallback } from "react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "En attente",  color: "#92400e", bg: "#fef3c7" },
  APPROVED: { label: "Approuvé",    color: "#166534", bg: "#dcfce7" },
  REFUSED:  { label: "Refusé",      color: "#991b1b", bg: "#fee2e2" },
  RETURNED: { label: "Retourné",    color: "#1e40af", bg: "#dbeafe" },
  OVERDUE:  { label: "En retard",   color: "#7c2d12", bg: "#ffedd5" },
};

const CAT: Record<string, string> = {
  IOT: "IoT", VR_AR: "VR / AR", ROBOTICS: "Robotique", NETWORK: "Réseau",
  PRINTING_3D: "Impression 3D", COMPUTER: "Informatique", PERIPHERALS: "Périphériques",
  AUDIO: "Audio", COMPONENTS: "Composants", TOOLS: "Outillage", CONSUMABLE: "Consommable", MISC: "Divers",
};

interface Loan {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  note: string | null;
  createdAt: string;
  equipment: { name: string; internalId: string | null; category: string };
  user: { firstName: string; lastName: string; email: string };
}

type Filter = "ALL" | "PENDING" | "APPROVED" | "RETURNED" | "OVERDUE";

export default function AdminEmpruntsPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<Loan | null>(null);

  const load = useCallback(async () => {
    const data = await fetch("/api/loans").then(r => r.json());
    setLoans(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    await fetch(`/api/loans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        ...(status === "RETURNED" ? { returnedAt: new Date().toISOString() } : {}),
      }),
    });
    await load();
    setActionLoading(null);
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const filtered = filter === "ALL" ? loans : loans.filter(l => l.status === filter);

  const counts = {
    ALL: loans.length,
    PENDING: loans.filter(l => l.status === "PENDING").length,
    APPROVED: loans.filter(l => l.status === "APPROVED").length,
    RETURNED: loans.filter(l => l.status === "RETURNED").length,
    OVERDUE: loans.filter(l => l.status === "OVERDUE").length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 6 }}>Administration</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Gestion des emprunts
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 20 }}>
        {/* Left: list */}
        <div>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#fff",
            borderRadius: 12, padding: 4, border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)", width: "fit-content" }}>
            {(["ALL", "PENDING", "APPROVED", "RETURNED", "OVERDUE"] as Filter[]).map(f => {
              const labels: Record<Filter, string> = {
                ALL: "Tous", PENDING: "En attente", APPROVED: "Approuvés",
                RETURNED: "Retournés", OVERDUE: "En retard",
              };
              return (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                    border: "none", cursor: "pointer", transition: "all 0.15s",
                    background: filter === f ? "#0f172a" : "transparent",
                    color: filter === f ? "#fff" : "#94a3b8" }}>
                  {labels[f]}
                  {counts[f] > 0 && (
                    <span style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 10, fontSize: 10,
                      background: filter === f ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                      color: filter === f ? "#fff" : "#64748b" }}>
                      {counts[f]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 13 }}>
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: "48px 24px",
              border: "1px solid #f1f5f9", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Aucun emprunt dans cette catégorie</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(loan => {
                const s = STATUS_CONFIG[loan.status] ?? STATUS_CONFIG.PENDING;
                const isSelected = selected?.id === loan.id;
                return (
                  <div key={loan.id} onClick={() => setSelected(isSelected ? null : loan)}
                    style={{ background: "#fff", borderRadius: 14, padding: "16px 20px",
                      border: `1px solid ${isSelected ? "#2D3A8C" : "#f1f5f9"}`,
                      boxShadow: isSelected ? "0 0 0 3px rgba(45,58,140,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
                      cursor: "pointer", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f8fafc",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0 }}>
                      {loan.equipment.category === "VR_AR" ? "🥽" :
                       loan.equipment.category === "IOT" ? "🔌" :
                       loan.equipment.category === "COMPUTER" ? "💻" :
                       loan.equipment.category === "PRINTING_3D" ? "🖨️" :
                       loan.equipment.category === "ROBOTICS" ? "🤖" : "📦"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {loan.equipment.name}
                        </p>
                        <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11,
                          fontWeight: 600, background: s.bg, color: s.color, flexShrink: 0 }}>
                          {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "#94a3b8" }}>
                        {loan.user.firstName} {loan.user.lastName} ·{" "}
                        {fmt(loan.startDate)} → {fmt(loan.endDate)}
                      </p>
                    </div>
                    {loan.status === "PENDING" && (
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}
                        onClick={e => e.stopPropagation()}>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => updateStatus(loan.id, "APPROVED")}
                          style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: "#dcfce7", color: "#166534", border: "none",
                            cursor: actionLoading ? "wait" : "pointer" }}>
                          {actionLoading === loan.id + "APPROVED" ? "..." : "Valider"}
                        </button>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => updateStatus(loan.id, "REFUSED")}
                          style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: "#fee2e2", color: "#991b1b", border: "none",
                            cursor: actionLoading ? "wait" : "pointer" }}>
                          {actionLoading === loan.id + "REFUSED" ? "..." : "Refuser"}
                        </button>
                      </div>
                    )}
                    {loan.status === "APPROVED" && (
                      <button
                        disabled={!!actionLoading}
                        onClick={e => { e.stopPropagation(); updateStatus(loan.id, "RETURNED"); }}
                        style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                          background: "#dbeafe", color: "#1e40af", border: "none",
                          cursor: actionLoading ? "wait" : "pointer", flexShrink: 0 }}>
                        {actionLoading === loan.id + "RETURNED" ? "..." : "Marquer retourné"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        {selected && (
          <div style={{ position: "sticky", top: 80, alignSelf: "flex-start" }}>
            <div style={{ background: "#0f172a", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 8px 24px rgba(15,23,42,0.2)" }}>
              <div style={{ display: "flex", height: 3 }}>
                {["#E8C030","#2D3A8C","#4BAFD6","#C03050"].map(c => (
                  <div key={c} style={{ flex: 1, background: c }} />
                ))}
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 10, color: "#4BAFD6", fontFamily: "monospace",
                      letterSpacing: "0.1em", marginBottom: 4 }}>
                      {selected.equipment.internalId ?? "—"}
                    </p>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                      {selected.equipment.name}
                    </h3>
                    <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                      {CAT[selected.equipment.category]}
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)}
                    style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8",
                      width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
                    ✕
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Étudiant", value: `${selected.user.firstName} ${selected.user.lastName}` },
                    { label: "Email", value: selected.user.email },
                    { label: "Début", value: fmt(selected.startDate) },
                    { label: "Retour prévu", value: fmt(selected.endDate) },
                    { label: "Demandé le", value: fmt(selected.createdAt) },
                    { label: "Statut", value: STATUS_CONFIG[selected.status]?.label ?? selected.status },
                  ].map(f => (
                    <div key={f.label} style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "#475569", flexShrink: 0 }}>{f.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", textAlign: "right" }}>
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>

                {selected.note && (
                  <div style={{ marginTop: 16, padding: 12, borderRadius: 10,
                    background: "rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Note</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{selected.note}</p>
                  </div>
                )}

                {selected.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                    <button onClick={() => updateStatus(selected.id, "APPROVED")}
                      disabled={!!actionLoading}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13,
                        fontWeight: 600, background: "#22c55e", color: "#fff", border: "none",
                        cursor: "pointer" }}>
                      Valider
                    </button>
                    <button onClick={() => updateStatus(selected.id, "REFUSED")}
                      disabled={!!actionLoading}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13,
                        fontWeight: 600, background: "#ef4444", color: "#fff", border: "none",
                        cursor: "pointer" }}>
                      Refuser
                    </button>
                  </div>
                )}
                {selected.status === "APPROVED" && (
                  <button onClick={() => updateStatus(selected.id, "RETURNED")}
                    disabled={!!actionLoading}
                    style={{ width: "100%", marginTop: 20, padding: "10px 0", borderRadius: 10,
                      fontSize: 13, fontWeight: 600, background: "#3b82f6", color: "#fff",
                      border: "none", cursor: "pointer" }}>
                    Marquer comme retourné
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
