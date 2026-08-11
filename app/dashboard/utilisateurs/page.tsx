"use client";

import { useState, useEffect, useCallback } from "react";

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN:   { label: "Admin",    color: "#7c2d12", bg: "#ffedd5" },
  TEACHER: { label: "Formateur", color: "#1e40af", bg: "#dbeafe" },
  STUDENT: { label: "Étudiant", color: "#166534", bg: "#dcfce7" },
};

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  _count: { loans: number; projects: number };
}

type Filter = "ALL" | "ADMIN" | "TEACHER" | "STUDENT";

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetch("/api/users").then(r => r.json());
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (id: string, role: string) => {
    setSavingId(id);
    const updated = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }).then(r => r.json());
    setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
    setSavingId(null);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const filtered = filter === "ALL" ? users : users.filter(u => u.role === filter);

  const counts = {
    ALL: users.length,
    ADMIN: users.filter(u => u.role === "ADMIN").length,
    TEACHER: users.filter(u => u.role === "TEACHER").length,
    STUDENT: users.filter(u => u.role === "STUDENT").length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 6 }}>Administration</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Utilisateurs
        </h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#fff",
        borderRadius: 12, padding: 4, border: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)", width: "fit-content" }}>
        {(["ALL", "ADMIN", "TEACHER", "STUDENT"] as Filter[]).map(f => {
          const labels: Record<Filter, string> = {
            ALL: "Tous", ADMIN: "Admins", TEACHER: "Formateurs", STUDENT: "Étudiants",
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
          <p style={{ fontSize: 13, color: "#94a3b8" }}>Aucun utilisateur dans cette catégorie</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          {filtered.map((u, i) => {
            const r = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.STUDENT;
            const initials = `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
            return (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 16,
                padding: "16px 20px",
                borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg, #2D3A8C, #4BAFD6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff" }}>
                  {initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                    {u.firstName} {u.lastName}
                  </p>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{u.email}</p>
                </div>

                <div style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0, minWidth: 90 }}>
                  {u._count.loans} emprunt{u._count.loans > 1 ? "s" : ""}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0, minWidth: 90 }}>
                  {u._count.projects} projet{u._count.projects > 1 ? "s" : ""}
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1", flexShrink: 0, minWidth: 90 }}>
                  Depuis {fmt(u.createdAt)}
                </div>

                <select
                  value={u.role}
                  disabled={savingId === u.id}
                  onChange={e => changeRole(u.id, e.target.value)}
                  style={{ padding: "5px 10px", borderRadius: 20, fontSize: 11,
                    fontWeight: 600, background: r.bg, color: r.color, border: "none",
                    cursor: savingId === u.id ? "wait" : "pointer", flexShrink: 0 }}>
                  <option value="STUDENT">Étudiant</option>
                  <option value="TEACHER">Formateur</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
