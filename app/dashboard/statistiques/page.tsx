"use client";

import { useState, useEffect } from "react";
import { SkeletonStat } from "@/components/Skeleton";

const CAT_LABELS: Record<string, string> = {
  IOT: "IoT", VR_AR: "VR / AR", ROBOTICS: "Robotique", NETWORK: "Réseau",
  PRINTING_3D: "Impression 3D", COMPUTER: "Informatique", PERIPHERALS: "Périphériques",
  AUDIO: "Audio", COMPONENTS: "Composants", TOOLS: "Outillage", CONSUMABLE: "Consommable", MISC: "Divers",
};

const TYPE_LABELS: Record<string, string> = {
  WORKSHOP: "Workshop", OPEN_INNOV: "Open Innovation", ACADEMIC: "Académique",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: "En attente",  color: "#E8C030" },
  APPROVED: { label: "Approuvés",   color: "#4BAFD6" },
  RETURNED: { label: "Retournés",   color: "#2D3A8C" },
  REFUSED:  { label: "Refusés",     color: "#ef4444" },
  OVERDUE:  { label: "En retard",   color: "#C03050" },
};

const CAT_COLORS = ["#2D3A8C","#4BAFD6","#E8C030","#C03050","#22c55e","#f59e0b","#8b5cf6","#ec4899","#14b8a6","#f97316","#64748b","#0ea5e9"];

interface Stats {
  equipmentCount: number;
  activeLoans: number;
  overdueLoans: number;
  totalLoans: number;
  publishedProjects: number;
  pendingProjects: number;
  loansByStatus: { status: string; _count: { status: number } }[];
  projectsByType: { type: string; _count: { type: number } }[];
  equipmentByCategory: { category: string; _count: { category: number } }[];
  topEquipment: { name: string; loanCount: number; category: string }[];
  loansByMonth: { label: string; count: number }[];
}

export default function StatistiquesPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats").then(r => r.json()).then(d => { setStats(d); setLoading(false); });
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 6 }}>Administration</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Statistiques
          </h1>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
          {Array.from({ length: 5 }).map((_, i) => <SkeletonStat key={i} />)}
        </div>
      </div>
    );
  }

  const maxMonth = Math.max(...stats.loansByMonth.map(m => m.count), 1);
  const totalLoansByStatus = stats.loansByStatus.reduce((s, l) => s + l._count.status, 0) || 1;
  const totalByType = stats.projectsByType.reduce((s, p) => s + p._count.type, 0) || 1;
  const totalByCat  = stats.equipmentByCategory.reduce((s, e) => s + e._count.category, 0) || 1;
  const maxLoanCount = Math.max(...stats.topEquipment.map(e => e.loanCount), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 6 }}>Administration</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Statistiques
        </h1>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {[
          { label: "Équipements",      value: stats.equipmentCount,    color: "#2D3A8C", bg: "#eef2ff" },
          { label: "Total emprunts",   value: stats.totalLoans,        color: "#4BAFD6", bg: "#f0f9ff" },
          { label: "Actifs",           value: stats.activeLoans,       color: "#22c55e", bg: "#f0fdf4" },
          { label: "En retard",        value: stats.overdueLoans,      color: "#C03050", bg: "#fff1f2" },
          { label: "Projets publiés",  value: stats.publishedProjects, color: "#E8C030", bg: "#fefce8" },
        ].map((k, i) => (
          <div key={k.label} className="fade-in-up" style={{ animationDelay: `${i * 40}ms`, background: "#fff", borderRadius: 14, padding: "20px 20px 16px",
            border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: k.color }} />
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", lineHeight: 1 }}>
              {k.value}
            </p>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, fontWeight: 500 }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Row 2 — bar chart emprunts + statuts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>

        {/* Bar chart: emprunts/mois */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 28,
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
            Emprunts par mois
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 28 }}>6 derniers mois</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
            {stats.loansByMonth.map(m => {
              const h = maxMonth === 0 ? 0 : Math.max((m.count / maxMonth) * 120, m.count > 0 ? 8 : 0);
              return (
                <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>
                    {m.count > 0 ? m.count : ""}
                  </span>
                  <div style={{ width: "100%", height: 120, display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", height: h, borderRadius: "6px 6px 0 0",
                      background: "linear-gradient(180deg, #2D3A8C 0%, #4BAFD6 100%)",
                      transition: "height 0.4s ease", minHeight: m.count > 0 ? 4 : 0 }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "capitalize" }}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statuts emprunts */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 28,
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
            Statuts des emprunts
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>Répartition actuelle</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {stats.loansByStatus.map(s => {
              const pct = Math.round((s._count.status / totalLoansByStatus) * 100);
              const cfg = STATUS_LABELS[s.status] ?? { label: s.status, color: "#94a3b8" };
              return (
                <div key={s.status}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 500 }}>{cfg.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>
                      {s._count.status} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99,
                      background: cfg.color, transition: "width 0.5s ease", minWidth: pct > 0 ? 6 : 0 }} />
                  </div>
                </div>
              );
            })}
            {stats.loansByStatus.length === 0 && (
              <p style={{ fontSize: 13, color: "#cbd5e1", textAlign: "center", padding: "16px 0" }}>
                Aucun emprunt enregistré
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Row 3 — catégories + types projets + top équipements */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>

        {/* Équipements par catégorie */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 28,
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
            Inventaire
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Par catégorie</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.equipmentByCategory.slice(0, 7).map((e, i) => {
              const pct = Math.round((e._count.category / totalByCat) * 100);
              return (
                <div key={e.category}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#0f172a" }}>
                      {CAT_LABELS[e.category] ?? e.category}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                      {e._count.category}
                    </span>
                  </div>
                  <div style={{ height: 5, background: "#f1f5f9", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99,
                      background: CAT_COLORS[i % CAT_COLORS.length],
                      transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Types de projets */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 28,
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
            Projets
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Par type</p>

          {stats.projectsByType.length === 0 ? (
            <p style={{ fontSize: 13, color: "#cbd5e1", textAlign: "center", padding: "24px 0" }}>
              Aucun projet enregistré
            </p>
          ) : (
            <>
              {/* Donut visuel CSS */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ position: "relative", width: 100, height: 100 }}>
                  {stats.projectsByType.map((p, i) => {
                    const pct = (p._count.type / totalByType) * 100;
                    const colors = ["#2D3A8C", "#4BAFD6", "#E8C030"];
                    const prev = stats.projectsByType.slice(0, i).reduce((s, x) => s + (x._count.type / totalByType) * 100, 0);
                    const deg = (prev / 100) * 360;
                    const len = (pct / 100) * 360;
                    return (
                      <div key={p.type} style={{ position: "absolute", inset: 0, borderRadius: "50%",
                        background: `conic-gradient(transparent ${deg}deg, ${colors[i % 3]} ${deg}deg ${deg + len}deg, transparent ${deg + len}deg)` }} />
                    );
                  })}
                  <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                      {stats.projectsByType.reduce((s, p) => s + p._count.type, 0)}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.projectsByType.map((p, i) => {
                  const pct = Math.round((p._count.type / totalByType) * 100);
                  const colors = ["#2D3A8C", "#4BAFD6", "#E8C030"];
                  return (
                    <div key={p.type} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                        background: colors[i % 3] }} />
                      <span style={{ fontSize: 12, color: "#0f172a", flex: 1 }}>
                        {TYPE_LABELS[p.type] ?? p.type}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                        {p._count.type} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Top équipements */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 28,
          border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
            Top équipements
          </h3>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Les plus empruntés</p>
          {stats.topEquipment.length === 0 ? (
            <p style={{ fontSize: 13, color: "#cbd5e1", textAlign: "center", padding: "24px 0" }}>
              Aucun emprunt enregistré
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {stats.topEquipment.map((e, i) => (
                <div key={e.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8",
                        width: 16, flexShrink: 0 }}>#{i + 1}</span>
                      <span style={{ fontSize: 12, color: "#0f172a", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#2D3A8C", flexShrink: 0 }}>
                      {e.loanCount}×
                    </span>
                  </div>
                  <div style={{ height: 5, background: "#f1f5f9", borderRadius: 99 }}>
                    <div style={{ height: "100%", borderRadius: 99,
                      width: `${(e.loanCount / maxLoanCount) * 100}%`,
                      background: "linear-gradient(90deg, #2D3A8C, #4BAFD6)",
                      transition: "width 0.5s ease", minWidth: e.loanCount > 0 ? 6 : 0 }} />
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
