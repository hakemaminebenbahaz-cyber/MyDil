"use client";

import { useState, useEffect, useCallback } from "react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: "Brouillon",  color: "#64748b", bg: "#f1f5f9" },
  PENDING:   { label: "En attente", color: "#92400e", bg: "#fef3c7" },
  PUBLISHED: { label: "Publié",     color: "#166534", bg: "#dcfce7" },
};

const TYPE_LABEL: Record<string, string> = {
  WORKSHOP:   "Workshop",
  OPEN_INNOV: "Open Innovation",
  ACADEMIC:   "Académique",
};

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  year: number;
  description: string | null;
  technologies: string[];
  keywords: string[];
  supervisors: string[];
  participants: string[];
  githubUrl: string | null;
  zipUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

type Filter = "ALL" | "PENDING" | "PUBLISHED" | "DRAFT";

export default function AdminProjetsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selected, setSelected] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetch("/api/projects").then(r => r.json());
    setProjects(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setActionLoading(null);
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setSelected(null);
    load();
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const filtered = filter === "ALL" ? projects : projects.filter(p => p.status === filter);

  const counts = {
    ALL: projects.length,
    PENDING: projects.filter(p => p.status === "PENDING").length,
    PUBLISHED: projects.filter(p => p.status === "PUBLISHED").length,
    DRAFT: projects.filter(p => p.status === "DRAFT").length,
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 6 }}>Administration</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Validation des projets
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20 }}>
        {/* List */}
        <div>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#fff",
            borderRadius: 12, padding: 4, border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)", width: "fit-content" }}>
            {(["ALL", "PENDING", "PUBLISHED", "DRAFT"] as Filter[]).map(f => {
              const labels: Record<Filter, string> = {
                ALL: "Tous", PENDING: "En attente", PUBLISHED: "Publiés", DRAFT: "Brouillons",
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

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 13 }}>
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: "48px 24px",
              border: "1px solid #f1f5f9", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Aucun projet dans cette catégorie</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(project => {
                const s = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.DRAFT;
                const isSelected = selected?.id === project.id;
                return (
                  <div key={project.id} onClick={() => setSelected(isSelected ? null : project)}
                    style={{ background: "#fff", borderRadius: 14, padding: "16px 20px",
                      border: `1px solid ${isSelected ? "#2D3A8C" : "#f1f5f9"}`,
                      boxShadow: isSelected ? "0 0 0 3px rgba(45,58,140,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
                      cursor: "pointer", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eef2ff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0 }}>💡</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {project.name}
                        </p>
                        <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11,
                          fontWeight: 600, background: s.bg, color: s.color, flexShrink: 0 }}>
                          {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "#94a3b8" }}>
                        {project.user.firstName} {project.user.lastName} ·{" "}
                        {TYPE_LABEL[project.type] ?? project.type} · {project.year}
                      </p>
                    </div>
                    {project.status === "PENDING" && (
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}
                        onClick={e => e.stopPropagation()}>
                        <button disabled={!!actionLoading}
                          onClick={() => updateStatus(project.id, "PUBLISHED")}
                          style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: "#dcfce7", color: "#166534", border: "none",
                            cursor: actionLoading ? "wait" : "pointer" }}>
                          {actionLoading === project.id + "PUBLISHED" ? "..." : "Publier"}
                        </button>
                        <button disabled={!!actionLoading}
                          onClick={() => updateStatus(project.id, "DRAFT")}
                          style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: "#fee2e2", color: "#991b1b", border: "none",
                            cursor: actionLoading ? "wait" : "pointer" }}>
                          {actionLoading === project.id + "DRAFT" ? "..." : "Refuser"}
                        </button>
                      </div>
                    )}
                    {project.status === "PUBLISHED" && (
                      <button disabled={!!actionLoading}
                        onClick={e => { e.stopPropagation(); updateStatus(project.id, "DRAFT"); }}
                        style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                          background: "#f1f5f9", color: "#64748b", border: "none",
                          cursor: "pointer", flexShrink: 0 }}>
                        Dépublier
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
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
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20,
                      background: "rgba(255,255,255,0.1)", color: "#94a3b8",
                      display: "inline-block", marginBottom: 8 }}>
                      {TYPE_LABEL[selected.type] ?? selected.type} · {selected.year}
                    </span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                      {selected.name}
                    </h3>
                    <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                      par {selected.user.firstName} {selected.user.lastName}
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)}
                    style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8",
                      width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
                    ✕
                  </button>
                </div>

                {selected.description && (
                  <div style={{ padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.05)",
                    marginBottom: 16 }}>
                    <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                      {selected.description}
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  {selected.participants.length > 0 && (
                    <Row label="Participants" value={selected.participants.join(", ")} />
                  )}
                  {selected.supervisors.length > 0 && (
                    <Row label="Encadrant(s)" value={selected.supervisors.join(", ")} />
                  )}
                  <Row label="Soumis le" value={fmt(selected.createdAt)} />
                  <Row label="Email" value={selected.user.email} />
                </div>

                {selected.technologies.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>Technologies</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {selected.technologies.map(t => (
                        <span key={t} style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11,
                          background: "rgba(45,58,140,0.4)", color: "#93c5fd" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {selected.githubUrl && (
                    <a href={selected.githubUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                        borderRadius: 8, background: "rgba(255,255,255,0.06)", textDecoration: "none" }}>
                      <span style={{ fontSize: 14 }}>🔗</span>
                      <span style={{ fontSize: 12, color: "#4BAFD6", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.githubUrl}</span>
                    </a>
                  )}
                  {selected.zipUrl && (
                    <a href={selected.zipUrl} download
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                        borderRadius: 8, background: "rgba(255,255,255,0.06)", textDecoration: "none" }}>
                      <span style={{ fontSize: 14 }}>📦</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>Télécharger le ZIP</span>
                    </a>
                  )}
                  {selected.videoUrl && (
                    <a href={selected.videoUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                        borderRadius: 8, background: "rgba(255,255,255,0.06)", textDecoration: "none" }}>
                      <span style={{ fontSize: 14 }}>🎬</span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>Voir la vidéo</span>
                    </a>
                  )}
                </div>

                {selected.status === "PENDING" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => updateStatus(selected.id, "PUBLISHED")}
                      disabled={!!actionLoading}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13,
                        fontWeight: 600, background: "#22c55e", color: "#fff", border: "none",
                        cursor: "pointer" }}>
                      Publier
                    </button>
                    <button onClick={() => updateStatus(selected.id, "DRAFT")}
                      disabled={!!actionLoading}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13,
                        fontWeight: 600, background: "#ef4444", color: "#fff", border: "none",
                        cursor: "pointer" }}>
                      Refuser
                    </button>
                  </div>
                )}
                {selected.status === "PUBLISHED" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => updateStatus(selected.id, "DRAFT")}
                      disabled={!!actionLoading}
                      style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13,
                        fontWeight: 600, background: "rgba(255,255,255,0.1)", color: "#94a3b8",
                        border: "none", cursor: "pointer" }}>
                      Dépublier
                    </button>
                    <button onClick={() => deleteProject(selected.id)}
                      style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13,
                        fontWeight: 600, background: "#ef4444", color: "#fff", border: "none",
                        cursor: "pointer" }}>
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <span style={{ fontSize: 12, color: "#475569", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", textAlign: "right" }}>{value}</span>
    </div>
  );
}
