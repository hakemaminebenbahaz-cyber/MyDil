"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const DOTS = ["#E8C030", "#2D3A8C", "#4BAFD6", "#C03050"];

interface Stats {
  equipmentCount: number;
  activeLoans: number;
  overdueLoans: number;
  pendingLoans: number;
  publishedProjects: number;
  pendingProjects: number;
  recentLoans: {
    id: string;
    startDate: string;
    endDate: string;
    equipment: { name: string };
    user: { firstName: string; lastName: string };
  }[];
  recentProjects: {
    id: string;
    name: string;
    type: string;
    createdAt: string;
    user: { firstName: string; lastName: string };
  }[];
}

const TYPE_LABEL: Record<string, string> = {
  WORKSHOP: "Workshop", OPEN_INNOV: "Open Innovation", ACADEMIC: "Académique",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [today] = useState(() =>
    new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  );

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(setStats);
  }, []);

  const statCards = stats ? [
    { label: "Équipements",     value: stats.equipmentCount,    sub: "dans l'inventaire",   color: "#2D3A8C", bg: "#eef2ff",  bar: 100 },
    { label: "Emprunts actifs", value: stats.activeLoans,       sub: "en cours aujourd'hui", color: "#4BAFD6", bg: "#f0f9ff", bar: Math.min(stats.activeLoans * 5, 100) },
    { label: "Retards",         value: stats.overdueLoans,      sub: "à traiter",            color: "#C03050", bg: "#fff1f2",  bar: Math.min(stats.overdueLoans * 10, 100) },
    { label: "Projets publiés", value: stats.publishedProjects, sub: "cette année",          color: "#E8C030", bg: "#fefce8",  bar: Math.min(stats.publishedProjects * 5, 100) },
  ] : [
    { label: "Équipements",     value: "—", sub: "dans l'inventaire",   color: "#2D3A8C", bg: "#eef2ff",  bar: 0 },
    { label: "Emprunts actifs", value: "—", sub: "en cours aujourd'hui", color: "#4BAFD6", bg: "#f0f9ff", bar: 0 },
    { label: "Retards",         value: "—", sub: "à traiter",            color: "#C03050", bg: "#fff1f2",  bar: 0 },
    { label: "Projets publiés", value: "—", sub: "cette année",          color: "#E8C030", bg: "#fefce8",  bar: 0 },
  ];

  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 6 }}>
            {today}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Tableau de bord
          </h1>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {DOTS.map(c => <div key={c} style={{ width: 6, height: 6, background: c }} />)}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 16, padding: "24px 24px 20px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: s.color, opacity: 0.8 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>{s.sub}</span>
            </div>
            <p style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginTop: 6 }}>{s.label}</p>
            <div style={{ marginTop: 16, height: 3, background: "#f1f5f9", borderRadius: 99 }}>
              <div style={{ height: "100%", width: `${s.bar}%`, background: s.color,
                borderRadius: 99, minWidth: s.bar > 0 ? 8 : 0, transition: "width 0.5s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>

        {/* Pending loans */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24,
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Demandes en attente</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Validation requise</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {stats && stats.pendingLoans > 0 && (
                <div style={{ background: "#fff1f2", color: "#C03050", fontSize: 11, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 99 }}>
                  {stats.pendingLoans} en attente
                </div>
              )}
              <Link href="/dashboard/emprunts" style={{ fontSize: 12, color: "#4BAFD6",
                textDecoration: "none", fontWeight: 500 }}>
                Voir tout →
              </Link>
            </div>
          </div>

          {!stats || !stats.recentLoans?.length ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: 13, color: "#cbd5e1" }}>Aucune demande en attente</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.recentLoans.map(loan => {
                const initials = `${loan.user.firstName[0]}${loan.user.lastName[0]}`.toUpperCase();
                return (
                  <div key={loan.id} style={{ display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: "linear-gradient(135deg, #2D3A8C, #4BAFD6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "#fff" }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                        {loan.user.firstName} {loan.user.lastName}
                      </p>
                      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {loan.equipment.name}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{fmt(loan.startDate)} → {fmt(loan.endDate)}</p>
                      <Link href="/dashboard/emprunts">
                        <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
                          <span style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                            background: "#0f172a", color: "#fff", cursor: "pointer" }}>Gérer</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity / recent projects */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24,
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Projets à valider</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Soumissions récentes</p>
            </div>
            {stats && stats.pendingProjects > 0 && (
              <Link href="/dashboard/projets" style={{ fontSize: 12, color: "#4BAFD6",
                textDecoration: "none", fontWeight: 500 }}>
                Voir tout →
              </Link>
            )}
          </div>

          {!stats || !stats.recentProjects?.length ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: 13, color: "#cbd5e1" }}>Aucun projet en attente</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {stats.recentProjects.map((p, i) => (
                <div key={p.id} style={{ display: "flex", gap: 14,
                  paddingBottom: i < stats.recentProjects.length - 1 ? 16 : 0,
                  marginBottom: i < stats.recentProjects.length - 1 ? 16 : 0,
                  borderBottom: i < stats.recentProjects.length - 1 ? "1px solid #f8fafc" : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8C030", marginTop: 3 }} />
                    {i < stats.recentProjects.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: "#f1f5f9", marginTop: 6 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                        {p.name}
                      </p>
                      <span style={{ fontSize: 11, color: "#cbd5e1", flexShrink: 0, marginLeft: 8 }}>
                        {fmt(p.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                      {TYPE_LABEL[p.type] ?? p.type} · {p.user.firstName} {p.user.lastName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
