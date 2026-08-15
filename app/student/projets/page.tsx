"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SkeletonRow } from "@/components/Skeleton";

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
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
  technologies: string[];
  zipUrl: string | null;
  videoUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
}

export default function MesProjetsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/projects?userId=${session.user.id}`)
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 6 }}>Mes projets</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Projets déposés
          </h1>
        </div>
        <Link href="/student/projets/nouveau" style={{ textDecoration: "none" }}>
          <button style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "#0f172a", color: "#fff", border: "none", cursor: "pointer" }}>
            + Nouveau projet
          </button>
        </Link>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: "60px 24px",
          border: "1px solid #f1f5f9", textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💡</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
            Aucun projet déposé
          </h3>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
            Partagez vos travaux avec la communauté myDiL
          </p>
          <Link href="/student/projets/nouveau" style={{ textDecoration: "none" }}>
            <button style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "#0f172a", color: "#fff", border: "none", cursor: "pointer" }}>
              Déposer mon premier projet
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {projects.map((p, i) => {
            const s = STATUS_LABEL[p.status] ?? STATUS_LABEL.DRAFT;
            return (
              <div key={p.id} className="fade-in-up" style={{ background: "#fff", borderRadius: 16, padding: 24,
                border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                display: "flex", alignItems: "center", gap: 20, animationDelay: `${i * 40}ms` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eef2ff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  flexShrink: 0 }}>💡</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </p>
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: s.bg, color: s.color, flexShrink: 0 }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      {TYPE_LABEL[p.type] ?? p.type}
                    </span>
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>·</span>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{p.year}</span>
                    {p.technologies.slice(0, 3).map(t => (
                      <span key={t} style={{ padding: "1px 8px", borderRadius: 20, fontSize: 11,
                        background: "#f1f5f9", color: "#64748b" }}>{t}</span>
                    ))}
                    {p.technologies.length > 3 && (
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>+{p.technologies.length - 3}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                        background: "#f1f5f9", color: "#0f172a", textDecoration: "none" }}>
                      GitHub
                    </a>
                  )}
                  {p.zipUrl && (
                    <a href={p.zipUrl} download
                      style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                        background: "#f1f5f9", color: "#0f172a", textDecoration: "none" }}>
                      ZIP
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
