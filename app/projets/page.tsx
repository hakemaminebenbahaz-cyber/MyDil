"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SkeletonCard } from "@/components/Skeleton";

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  WORKSHOP:   { label: "Workshop",        color: "#92400e", bg: "#fef3c7" },
  OPEN_INNOV: { label: "Open Innovation", color: "#1e40af", bg: "#dbeafe" },
  ACADEMIC:   { label: "Académique",      color: "#166534", bg: "#dcfce7" },
};

const DOTS = ["#E8C030", "#2D3A8C", "#4BAFD6", "#C03050"];

interface Project {
  id: string;
  name: string;
  description: string | null;
  type: string;
  year: number;
  technologies: string[];
  keywords: string[];
  supervisors: string[];
  participants: string[];
  githubUrl: string | null;
  zipUrl: string | null;
  videoUrl: string | null;
  likes: number;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

const LIKED_KEY = "mydil_liked_projects";

function getLikedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export default function VitrineProjetsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sort, setSort] = useState<"recent" | "popular">("recent");
  const [selected, setSelected] = useState<Project | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLiked(getLikedIds());
    fetch("/api/projects?status=PUBLISHED")
      .then(r => r.json())
      .then(data => {
        const published = Array.isArray(data) ? data.filter((p: Project & { status: string }) => p.status === "PUBLISHED") : [];
        setProjects(published);
        setLoading(false);
      });
  }, []);

  const toggleLike = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const isLiked = liked.has(projectId);
    const action = isLiked ? "unlike" : "like";

    const nextLiked = new Set(liked);
    isLiked ? nextLiked.delete(projectId) : nextLiked.add(projectId);
    setLiked(nextLiked);
    localStorage.setItem(LIKED_KEY, JSON.stringify([...nextLiked]));

    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, likes: Math.max(0, p.likes + (isLiked ? -1 : 1)) } : p
    ));
    setSelected(prev => prev && prev.id === projectId
      ? { ...prev, likes: Math.max(0, prev.likes + (isLiked ? -1 : 1)) } : prev);

    try {
      await fetch(`/api/projects/${projectId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    } catch {
      // silencieux — le compteur local reste correct même si la sync réseau échoue
    }
  };

  const years = Array.from(new Set(projects.map(p => p.year))).sort((a, b) => b - a);

  const filtered = projects
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        p.technologies.some(t => t.toLowerCase().includes(q)) ||
        p.keywords.some(k => k.toLowerCase().includes(q));
      const matchType = typeFilter === "ALL" || p.type === typeFilter;
      const matchYear = yearFilter === "ALL" || p.year === Number(yearFilter);
      return matchSearch && matchType && matchYear;
    })
    .sort((a, b) => sort === "popular"
      ? b.likes - a.likes
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff",
        borderBottom: "1px solid #f1f5f9", boxShadow: "0 1px 0 0 #f1f5f9" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 56,
          display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10,
            textDecoration: "none", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {DOTS.map((c, i) => (
                <div key={c} style={{ width: i % 2 === 0 ? 8 : 6, height: i % 2 === 0 ? 8 : 6,
                  background: c, alignSelf: i % 2 === 0 ? "flex-end" : "flex-start" }} />
              ))}
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              myDiL
            </span>
          </Link>
          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
          <span style={{ fontSize: 13, color: "#94a3b8" }}>Vitrine des projets</span>
          <div style={{ flex: 1 }} />
          <Link href="/login" style={{ padding: "7px 18px", borderRadius: 8, fontSize: 13,
            fontWeight: 600, background: "#0f172a", color: "#fff", textDecoration: "none" }}>
            Connexion
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.12em",
            textTransform: "uppercase", marginBottom: 12 }}>EPSI / WIS · Digital Innovation Lab</p>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#0f172a", letterSpacing: "-1px",
            lineHeight: 1.2, marginBottom: 14 }}>
            Projets des étudiants
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Découvrez les réalisations innovantes développées au sein du lab — IoT, IA, robotique, réalité virtuelle et bien plus.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 20 }}>
            {DOTS.map((c, i) => (
              <div key={c} style={{ width: i % 2 === 0 ? 10 : 7, height: i % 2 === 0 ? 10 : 7,
                background: c, alignSelf: i % 2 === 0 ? "flex-end" : "flex-start" }} />
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
          <input type="text" placeholder="Rechercher un projet, technologie..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220, padding: "10px 16px", borderRadius: 10, fontSize: 13,
              border: "1.5px solid #e2e8f0", background: "#fff", outline: "none" }} />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13,
              border: "1.5px solid #e2e8f0", background: "#fff", outline: "none", color: "#0f172a" }}>
            <option value="ALL">Tous les types</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="OPEN_INNOV">Open Innovation</option>
            <option value="ACADEMIC">Académique</option>
          </select>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13,
              border: "1.5px solid #e2e8f0", background: "#fff", outline: "none", color: "#0f172a" }}>
            <option value="ALL">Toutes les années</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div style={{ display: "flex", gap: 2, background: "#fff", borderRadius: 10, padding: 3,
            border: "1.5px solid #e2e8f0" }}>
            {([["recent", "🕐 Récents"], ["popular", "❤ Populaires"]] as const).map(([v, label]) => (
              <button key={v} onClick={() => setSort(v)}
                style={{ padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all 0.15s",
                  background: sort === v ? "#0f172a" : "transparent",
                  color: sort === v ? "#fff" : "#64748b" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>
          {loading ? "Chargement..." : `${filtered.length} projet${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💡</div>
            <p style={{ fontSize: 15, color: "#94a3b8" }}>Aucun projet ne correspond à votre recherche</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {filtered.map((p, i) => {
              const t = TYPE_CONFIG[p.type] ?? TYPE_CONFIG.ACADEMIC;
              return (
                <div key={p.id}
                  className="fade-in-up"
                  style={{ background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer",
                    border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "all 0.15s", animationDelay: `${Math.min(i, 12) * 35}ms` }}
                  onClick={() => setSelected(p)}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)")}>
                  {/* Color bar */}
                  <div style={{ display: "flex", height: 4 }}>
                    {DOTS.map(c => <div key={c} style={{ flex: 1, background: c }} />)}
                  </div>
                  <div style={{ padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "flex-start",
                      justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11,
                        fontWeight: 600, background: t.bg, color: t.color }}>
                        {t.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <button onClick={e => toggleLike(e, p.id)}
                          style={{ display: "flex", alignItems: "center", gap: 4, border: "none",
                            background: "transparent", cursor: "pointer", padding: 0,
                            color: liked.has(p.id) ? "#C03050" : "#cbd5e1", fontSize: 13,
                            transition: "transform 0.15s" }}
                          onMouseDown={e => (e.currentTarget.style.transform = "scale(1.3)")}
                          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}>
                          {liked.has(p.id) ? "♥" : "♡"}
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>{p.likes}</span>
                        </button>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{p.year}</span>
                      </div>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a",
                      lineHeight: 1.3, marginBottom: 8 }}>
                      {p.name}
                    </h3>
                    {p.description && (
                      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 14,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        overflow: "hidden" }}>
                        {p.description}
                      </p>
                    )}
                    {p.technologies.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                        {p.technologies.slice(0, 4).map(tech => (
                          <span key={tech} style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11,
                            background: "#f1f5f9", color: "#64748b" }}>{tech}</span>
                        ))}
                        {p.technologies.length > 4 && (
                          <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11,
                            background: "#f1f5f9", color: "#94a3b8" }}>+{p.technologies.length - 4}</span>
                        )}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center",
                      justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #f8fafc" }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        {p.user.firstName} {p.user.lastName}
                        {p.participants.length > 0 && ` +${p.participants.length}`}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11,
                              background: "#f1f5f9", color: "#0f172a", textDecoration: "none",
                              fontWeight: 500 }}>
                            GitHub
                          </a>
                        )}
                        {p.zipUrl && (
                          <a href={p.zipUrl} download onClick={e => e.stopPropagation()}
                            style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11,
                              background: "#f1f5f9", color: "#0f172a", textDecoration: "none",
                              fontWeight: 500 }}>
                            ZIP
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal detail */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex",
          alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setSelected(null)}>
          <div className="modal-overlay-anim" style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(4px)" }} />
          <div className="modal-panel-anim" style={{ position: "relative", background: "#fff", borderRadius: 20,
            maxWidth: 580, width: "100%", maxHeight: "85vh", overflow: "auto",
            boxShadow: "0 24px 64px rgba(15,23,42,0.3)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", height: 5 }}>
              {DOTS.map(c => <div key={c} style={{ flex: 1, background: c }} />)}
            </div>
            <div style={{ padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: TYPE_CONFIG[selected.type]?.bg ?? "#f1f5f9",
                      color: TYPE_CONFIG[selected.type]?.color ?? "#64748b" }}>
                      {TYPE_CONFIG[selected.type]?.label ?? selected.type}
                    </span>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11,
                      background: "#f1f5f9", color: "#64748b" }}>{selected.year}</span>
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a",
                    letterSpacing: "-0.5px", lineHeight: 1.3 }}>
                    {selected.name}
                  </h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <button onClick={e => toggleLike(e, selected.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 14px", borderRadius: 20, border: "1px solid",
                      borderColor: liked.has(selected.id) ? "#fecdd3" : "#e2e8f0",
                      background: liked.has(selected.id) ? "#fff1f2" : "#f8fafc",
                      color: liked.has(selected.id) ? "#C03050" : "#64748b",
                      cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s" }}>
                    {liked.has(selected.id) ? "♥" : "♡"} {selected.likes}
                  </button>
                  <button onClick={() => setSelected(null)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0",
                      background: "#f8fafc", cursor: "pointer", fontSize: 14, color: "#64748b",
                      flexShrink: 0 }}>
                    ✕
                  </button>
                </div>
              </div>

              {selected.description && (
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 20 }}>
                  {selected.description}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                {selected.participants.length > 0 && (
                  <InfoRow label="Participants" value={selected.participants.join(", ")} />
                )}
                {selected.supervisors.length > 0 && (
                  <InfoRow label="Encadrant(s)" value={selected.supervisors.join(", ")} />
                )}
                <InfoRow label="Auteur" value={`${selected.user.firstName} ${selected.user.lastName}`} />
              </div>

              {selected.technologies.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase",
                    letterSpacing: "0.06em", marginBottom: 10 }}>Technologies</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selected.technologies.map(t => (
                      <span key={t} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12,
                        background: "#eef2ff", color: "#2D3A8C", fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.keywords.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase",
                    letterSpacing: "0.06em", marginBottom: 10 }}>Mots-clés</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selected.keywords.map(k => (
                      <span key={k} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11,
                        background: "#f1f5f9", color: "#64748b" }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                {selected.githubUrl && (
                  <a href={selected.githubUrl} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, padding: "11px 0", borderRadius: 10, fontSize: 13,
                      fontWeight: 600, background: "#0f172a", color: "#fff",
                      textDecoration: "none", textAlign: "center" }}>
                    Voir sur GitHub
                  </a>
                )}
                {selected.zipUrl && (
                  <a href={selected.zipUrl} download
                    style={{ flex: 1, padding: "11px 0", borderRadius: 10, fontSize: 13,
                      fontWeight: 600, background: "#f1f5f9", color: "#0f172a",
                      textDecoration: "none", textAlign: "center" }}>
                    Télécharger ZIP
                  </a>
                )}
                {selected.videoUrl && (
                  <a href={selected.videoUrl} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, padding: "11px 0", borderRadius: 10, fontSize: 13,
                      fontWeight: 600, background: "#f0f9ff", color: "#0369a1",
                      textDecoration: "none", textAlign: "center" }}>
                    Voir la vidéo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <span style={{ fontSize: 12, color: "#94a3b8", width: 90, flexShrink: 0, paddingTop: 1 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 500, lineHeight: 1.5 }}>
        {value}
      </span>
    </div>
  );
}
