"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const TECH_OPTIONS = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "Arduino", "Raspberry Pi", "TensorFlow", "OpenCV", "Unity", "Blender",
  "C++", "Java", "Kotlin", "Swift", "Flutter", "Vue.js", "Docker", "SQL",
];

interface AiSuggestion {
  technologies: string[];
  keywords: string[];
  type: string;
}

const TYPE_OPTIONS = [
  { value: "WORKSHOP", label: "Workshop", desc: "Atelier pratique, formation", color: "#E8C030", bg: "#fefce8" },
  { value: "OPEN_INNOV", label: "Open Innovation", desc: "Projet innovation ouverte", color: "#4BAFD6", bg: "#f0f9ff" },
  { value: "ACADEMIC", label: "Académique", desc: "Projet de cours, mémoire", color: "#2D3A8C", bg: "#eef2ff" },
];

type Step = 1 | 2 | 3;

interface FormData {
  name: string;
  description: string;
  type: string;
  year: number;
  technologies: string[];
  keywords: string;
  supervisors: string;
  participants: string;
  githubUrl: string;
  zipFile: File | null;
  zipUrl: string;
  videoFile: File | null;
  videoUrl: string;
}

export default function NouveauProjetPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingZip, setUploadingZip] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [techInput, setTechInput] = useState("");
  const zipRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [aiError, setAiError] = useState("");

  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    type: "",
    year: new Date().getFullYear(),
    technologies: [],
    keywords: "",
    supervisors: "",
    participants: "",
    githubUrl: "",
    zipFile: null,
    zipUrl: "",
    videoFile: null,
    videoUrl: "",
  });

  const set = (k: keyof FormData, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const uploadFile = async (file: File, type: "zip" | "video") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    return data.url as string;
  };

  const handleZip = async (file: File) => {
    set("zipFile", file);
    setUploadingZip(true);
    try {
      const url = await uploadFile(file, "zip");
      set("zipUrl", url);
    } finally {
      setUploadingZip(false);
    }
  };

  const handleVideo = async (file: File) => {
    set("videoFile", file);
    setUploadingVideo(true);
    try {
      const url = await uploadFile(file, "video");
      set("videoUrl", url);
    } finally {
      setUploadingVideo(false);
    }
  };

  const toggleTech = (t: string) => {
    set("technologies", form.technologies.includes(t)
      ? form.technologies.filter(x => x !== t)
      : [...form.technologies, t]);
  };

  const addCustomTech = () => {
    const v = techInput.trim();
    if (v && !form.technologies.includes(v)) {
      set("technologies", [...form.technologies, v]);
      setTechInput("");
    }
  };

  const handleAiSuggest = async () => {
    if (!form.name.trim() && !form.description.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiSuggestion(null);
    try {
      const res = await fetch("/api/ai/project-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setAiSuggestion(data);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Erreur serveur");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    const newTechs = [...new Set([...form.technologies, ...aiSuggestion.technologies])];
    set("technologies", newTechs);
    const existingKeywords = form.keywords.split(",").map(k => k.trim()).filter(Boolean);
    const allKeywords = [...new Set([...existingKeywords, ...aiSuggestion.keywords])];
    set("keywords", allKeywords.join(", "));
    if (!form.type && aiSuggestion.type) set("type", aiSuggestion.type);
    setAiSuggestion(null);
  };

  const canStep1 = form.name.trim() && form.type && form.description.trim();
  const canStep2 = true;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          type: form.type,
          year: form.year,
          technologies: form.technologies,
          keywords: form.keywords.split(",").map(k => k.trim()).filter(Boolean),
          supervisors: form.supervisors.split(",").map(s => s.trim()).filter(Boolean),
          participants: form.participants.split(",").map(p => p.trim()).filter(Boolean),
          githubUrl: form.githubUrl || null,
          zipUrl: form.zipUrl || null,
          videoUrl: form.videoUrl || null,
          userId: session?.user?.id,
        }),
      });
      if (res.ok) setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 540, margin: "80px auto", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "#dcfce7",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
          margin: "0 auto 24px" }}>✓</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          Projet soumis avec succès !
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 32 }}>
          Votre projet a été transmis à l'équipe pédagogique pour validation.<br />
          Vous serez notifié une fois qu'il sera publié sur la vitrine.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => router.push("/student/projets")}
            style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "#0f172a", color: "#fff", border: "none", cursor: "pointer" }}>
            Voir mes projets
          </button>
          <button onClick={() => { setSuccess(false); setStep(1); setForm({ name: "", description: "",
            type: "", year: new Date().getFullYear(), technologies: [], keywords: "", supervisors: "",
            participants: "", githubUrl: "", zipFile: null, zipUrl: "", videoFile: null, videoUrl: "" }); }}
            style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "#f1f5f9", color: "#0f172a", border: "none", cursor: "pointer" }}>
            Nouveau projet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/student/projets" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          ← Mes projets
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Déposer un projet
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
          Partagez votre travail avec la communauté myDiL
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
        {(["Informations", "Médias", "Confirmation"] as const).map((label, i) => {
          const s = (i + 1) as Step;
          const done = step > s;
          const active = step === s;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", fontSize: 12, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? "#0f172a" : active ? "#2D3A8C" : "#f1f5f9",
                  color: done || active ? "#fff" : "#94a3b8",
                  transition: "all 0.2s",
                }}>
                  {done ? "✓" : s}
                </div>
                <span style={{ fontSize: 12, fontWeight: active ? 600 : 400,
                  color: active ? "#0f172a" : done ? "#64748b" : "#94a3b8" }}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div style={{ flex: 1, height: 1, background: done ? "#0f172a" : "#e2e8f0",
                  margin: "0 16px", transition: "background 0.2s" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1 — Project info */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Name */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 28,
            border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "block", marginBottom: 8 }}>
              Nom du projet <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="Ex: Bras robotique autonome, Application AR visite virtuelle..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                border: "1.5px solid #e2e8f0", outline: "none", color: "#0f172a",
                boxSizing: "border-box", background: "#fafafa" }}
            />
            <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "block",
              marginTop: 20, marginBottom: 8 }}>
              Description <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Décrivez les objectifs, le contexte et les résultats de votre projet..."
              rows={4}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                border: "1.5px solid #e2e8f0", outline: "none", color: "#0f172a",
                boxSizing: "border-box", background: "#fafafa", resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {/* AI Suggestion */}
          {(form.name.trim() || form.description.trim()) && (
            <div style={{ background: "#0f172a", borderRadius: 16, padding: 20,
              border: "none", boxShadow: "0 4px 16px rgba(15,23,42,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                    ✦ Ask Hanen
                  </p>
                  <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                    Suggère des technologies, mots-clés et un type de projet adaptés.
                  </p>
                </div>
                <button
                  onClick={handleAiSuggest}
                  disabled={aiLoading}
                  style={{
                    padding: "9px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                    background: aiLoading ? "rgba(255,255,255,0.1)" : "#4BAFD6",
                    color: aiLoading ? "#475569" : "#fff", border: "none",
                    cursor: aiLoading ? "default" : "pointer", flexShrink: 0,
                    transition: "all 0.15s", whiteSpace: "nowrap",
                  }}>
                  {aiLoading ? "Analyse..." : "Suggérer →"}
                </button>
              </div>

              {aiLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16,
                  padding: "12px 14px", borderRadius: 10, background: "rgba(75,175,214,0.1)" }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(75,175,214,0.3)", borderTop: "2px solid #4BAFD6",
                    animation: "spin 0.8s linear infinite", flexShrink: 0,
                  }} />
                  <p style={{ fontSize: 12, color: "#4BAFD6" }}>Ask Hanen analyse votre projet...</p>
                </div>
              )}

              {aiError && (
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10,
                  background: "rgba(201,32,80,0.15)" }}>
                  <p style={{ fontSize: 12, color: "#f87171" }}>{aiError}</p>
                </div>
              )}

              {aiSuggestion && (
                <div style={{ marginTop: 16, padding: "16px", borderRadius: 12,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#4BAFD6", textTransform: "uppercase",
                    letterSpacing: "0.08em", marginBottom: 14 }}>Suggestions IA</p>

                  {aiSuggestion.type && !form.type && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Type suggéré :</p>
                      <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: "rgba(75,175,214,0.2)", color: "#4BAFD6" }}>
                        {aiSuggestion.type === "WORKSHOP" ? "Workshop" : aiSuggestion.type === "OPEN_INNOV" ? "Open Innovation" : "Académique"}
                      </span>
                    </div>
                  )}

                  {aiSuggestion.technologies.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Technologies :</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {aiSuggestion.technologies.map(t => (
                          <span key={t} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11,
                            background: "rgba(45,58,140,0.3)", color: "#93c5fd", fontWeight: 500 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiSuggestion.keywords.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Mots-clés :</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {aiSuggestion.keywords.map(k => (
                          <span key={k} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11,
                            background: "rgba(232,192,48,0.15)", color: "#E8C030", fontWeight: 500 }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={applyAiSuggestion}
                      style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: "#4BAFD6", color: "#fff", border: "none", cursor: "pointer" }}>
                      Appliquer les suggestions
                    </button>
                    <button onClick={() => setAiSuggestion(null)}
                      style={{ padding: "9px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: "rgba(255,255,255,0.08)", color: "#94a3b8",
                        border: "none", cursor: "pointer" }}>
                      Ignorer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Type */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 28,
            border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "block", marginBottom: 16 }}>
              Type de projet <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {TYPE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => set("type", opt.value)}
                  style={{ padding: "16px 14px", borderRadius: 12, border: "2px solid",
                    borderColor: form.type === opt.value ? opt.color : "#e2e8f0",
                    background: form.type === opt.value ? opt.bg : "#fafafa",
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <p style={{ fontSize: 13, fontWeight: 700,
                    color: form.type === opt.value ? opt.color : "#0f172a", marginBottom: 4 }}>
                    {opt.label}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 28,
            border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "block", marginBottom: 16 }}>
              Technologies utilisées
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {TECH_OPTIONS.map(t => (
                <button key={t} onClick={() => toggleTech(t)}
                  style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    border: "1.5px solid", cursor: "pointer", transition: "all 0.1s",
                    borderColor: form.technologies.includes(t) ? "#2D3A8C" : "#e2e8f0",
                    background: form.technologies.includes(t) ? "#eef2ff" : "#fafafa",
                    color: form.technologies.includes(t) ? "#2D3A8C" : "#64748b" }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={techInput} onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustomTech()}
                placeholder="Autre technologie..."
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 12,
                  border: "1.5px solid #e2e8f0", outline: "none", background: "#fafafa" }} />
              <button onClick={addCustomTech}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: "#0f172a", color: "#fff", border: "none", cursor: "pointer" }}>
                Ajouter
              </button>
            </div>
          </div>

          {/* Meta */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 28,
            border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a",
                  display: "block", marginBottom: 8 }}>Année</label>
                <select value={form.year} onChange={e => set("year", Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1.5px solid #e2e8f0", outline: "none", background: "#fafafa",
                    color: "#0f172a" }}>
                  {[2026, 2025, 2024, 2023, 2022].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a",
                  display: "block", marginBottom: 8 }}>Encadrant(s)</label>
                <input value={form.supervisors} onChange={e => set("supervisors", e.target.value)}
                  placeholder="Mr Dupont, Mme Martin..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1.5px solid #e2e8f0", outline: "none", background: "#fafafa",
                    boxSizing: "border-box" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a",
                  display: "block", marginBottom: 8 }}>Participants</label>
                <input value={form.participants} onChange={e => set("participants", e.target.value)}
                  placeholder="Thomas B., Sarah M., Lucas D. (séparés par des virgules)"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1.5px solid #e2e8f0", outline: "none", background: "#fafafa",
                    boxSizing: "border-box" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a",
                  display: "block", marginBottom: 8 }}>Mots-clés</label>
                <input value={form.keywords} onChange={e => set("keywords", e.target.value)}
                  placeholder="IA, robotique, vision, embarqué... (séparés par des virgules)"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1.5px solid #e2e8f0", outline: "none", background: "#fafafa",
                    boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button disabled={!canStep1} onClick={() => setStep(2)}
              style={{ padding: "11px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: canStep1 ? "#0f172a" : "#e2e8f0",
                color: canStep1 ? "#fff" : "#94a3b8", border: "none", cursor: canStep1 ? "pointer" : "default",
                transition: "all 0.15s" }}>
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Media */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* ZIP upload */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 28,
            border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "block", marginBottom: 4 }}>
              Archive ZIP du projet
            </label>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              Code source, documentation, ressources (max 200 Mo)
            </p>
            <div
              onClick={() => !uploadingZip && zipRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleZip(f); }}
              style={{ border: "2px dashed", borderColor: form.zipUrl ? "#22c55e" : "#e2e8f0",
                borderRadius: 12, padding: "36px 24px", textAlign: "center", cursor: "pointer",
                background: form.zipUrl ? "#f0fdf4" : "#fafafa", transition: "all 0.15s" }}>
              <input ref={zipRef} type="file" accept=".zip,.rar,.7z"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleZip(f); }} />
              {uploadingZip ? (
                <div>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e2e8f0",
                    borderTop: "3px solid #2D3A8C", margin: "0 auto 12px",
                    animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: 13, color: "#64748b" }}>Upload en cours...</p>
                </div>
              ) : form.zipUrl ? (
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
                    {form.zipFile?.name}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    Cliquer pour remplacer
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>
                    Glisser-déposer ou cliquer pour choisir
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>.zip · .rar · .7z</p>
                </div>
              )}
            </div>
          </div>

          {/* Video upload */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 28,
            border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "block", marginBottom: 4 }}>
              Vidéo de présentation
            </label>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              Démo, présentation, soutenance (max 500 Mo)
            </p>
            <div
              onClick={() => !uploadingVideo && videoRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleVideo(f); }}
              style={{ border: "2px dashed", borderColor: form.videoUrl ? "#22c55e" : "#e2e8f0",
                borderRadius: 12, padding: "36px 24px", textAlign: "center", cursor: "pointer",
                background: form.videoUrl ? "#f0fdf4" : "#fafafa", transition: "all 0.15s" }}>
              <input ref={videoRef} type="file" accept="video/*"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleVideo(f); }} />
              {uploadingVideo ? (
                <div>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e2e8f0",
                    borderTop: "3px solid #4BAFD6", margin: "0 auto 12px",
                    animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: 13, color: "#64748b" }}>Upload en cours...</p>
                </div>
              ) : form.videoUrl ? (
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
                    {form.videoFile?.name}
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Cliquer pour remplacer</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>
                    Glisser-déposer ou cliquer pour choisir
                  </p>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>.mp4 · .mov · .avi · .webm</p>
                </div>
              )}
            </div>
          </div>

          {/* GitHub */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 28,
            border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "block", marginBottom: 4 }}>
              Lien GitHub
            </label>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
              Dépôt public ou privé du projet
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid #e2e8f0",
              borderRadius: 10, overflow: "hidden", background: "#fafafa" }}>
              <div style={{ padding: "10px 14px", background: "#f1f5f9", borderRight: "1px solid #e2e8f0",
                fontSize: 12, color: "#64748b", whiteSpace: "nowrap", flexShrink: 0 }}>
                github.com/
              </div>
              <input value={form.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\/?/, "")}
                onChange={e => set("githubUrl", e.target.value ? `https://github.com/${e.target.value}` : "")}
                placeholder="username/repository"
                style={{ flex: 1, padding: "10px 14px", fontSize: 13, border: "none",
                  outline: "none", background: "transparent", color: "#0f172a" }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(1)}
              style={{ padding: "11px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "#f1f5f9", color: "#0f172a", border: "none", cursor: "pointer" }}>
              ← Retour
            </button>
            <button disabled={!canStep2} onClick={() => setStep(3)}
              style={{ padding: "11px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: "#0f172a", color: "#fff", border: "none", cursor: "pointer" }}>
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Confirmation */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28,
            border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 24 }}>
              Récapitulatif du projet
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Row label="Nom" value={form.name} />
              <Row label="Type" value={TYPE_OPTIONS.find(t => t.value === form.type)?.label || form.type} />
              <Row label="Année" value={String(form.year)} />
              {form.description && <Row label="Description" value={form.description} multiline />}
              {form.technologies.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8",
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Technologies
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {form.technologies.map(t => (
                      <span key={t} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12,
                        background: "#eef2ff", color: "#2D3A8C", fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {form.supervisors && <Row label="Encadrant(s)" value={form.supervisors} />}
              {form.participants && <Row label="Participants" value={form.participants} />}
              {form.keywords && <Row label="Mots-clés" value={form.keywords} />}

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Archive ZIP</span>
                  {form.zipUrl
                    ? <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>✓ {form.zipFile?.name}</span>
                    : <span style={{ fontSize: 12, color: "#94a3b8" }}>Non fourni</span>}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Vidéo</span>
                  {form.videoUrl
                    ? <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>✓ {form.videoFile?.name}</span>
                    : <span style={{ fontSize: 12, color: "#94a3b8" }}>Non fourni</span>}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>GitHub</span>
                  {form.githubUrl
                    ? <span style={{ fontSize: 12, fontWeight: 600, color: "#2D3A8C" }}>{form.githubUrl}</span>
                    : <span style={{ fontSize: 12, color: "#94a3b8" }}>Non fourni</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Status info */}
          <div style={{ background: "#fffbeb", borderRadius: 12, padding: 16,
            border: "1px solid #fde68a", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ</span>
            <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
              Votre projet sera soumis en <strong>attente de validation</strong>. L'équipe pédagogique
              l'examinera avant publication sur la vitrine myDiL.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(2)}
              style={{ padding: "11px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "#f1f5f9", color: "#0f172a", border: "none", cursor: "pointer" }}>
              ← Retour
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              style={{ padding: "11px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: submitting ? "#94a3b8" : "#2D3A8C",
                color: "#fff", border: "none", cursor: submitting ? "default" : "pointer",
                transition: "all 0.15s" }}>
              {submitting ? "Envoi en cours..." : "Soumettre le projet"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, textarea:focus, select:focus { border-color: #2D3A8C !important; }
        input:focus-visible, textarea:focus-visible { outline: none; }
      `}</style>
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase",
        letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, color: "#0f172a", lineHeight: multiline ? 1.6 : 1.4 }}>{value}</p>
    </div>
  );
}
