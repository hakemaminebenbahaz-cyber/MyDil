"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const CAT_EMOJI: Record<string, string> = {
  VR_AR: "🥽", IOT: "🔌", COMPUTER: "💻", PRINTING_3D: "🖨️", ROBOTICS: "🤖",
  AUDIO: "🎧", NETWORK: "🌐", PERIPHERALS: "🖱️", COMPONENTS: "⚙️",
  TOOLS: "🔧", CONSUMABLE: "📦", MISC: "📦",
};

interface Recommendation {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  imageUrl: string | null;
  reason: string;
}

/**
 * Assistant "Ask Hanen" accessible depuis n'importe quelle page étudiant
 * (monté une seule fois dans app/student/layout.tsx, donc ne se
 * réinitialise pas en changeant de page). Bulle flottante en bas à
 * gauche, panneau qui s'ouvre en douceur ; cliquer une recommandation
 * amène directement à l'équipement dans l'Inventaire.
 */
export function AskHanen() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ recommendations: Recommendation[]; summary: string } | null>(null);
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const goToEquipment = (id: string) => {
    setOpen(false);
    router.push(`/student/inventaire?equipment=${id}`);
  };

  return (
    <div ref={panelRef} style={{ position: "fixed", bottom: 20, left: 20, zIndex: 90 }}>
      {/* Panel */}
      {open && (
        <div className="modal-panel-anim" style={{
          position: "absolute", bottom: "calc(100% + 12px)", left: 0,
          width: 360, maxHeight: "min(70vh, 560px)", overflowY: "auto",
          background: "#0f172a", borderRadius: 18,
          boxShadow: "0 16px 48px rgba(15,23,42,0.35)",
        }}>
          <div style={{ display: "flex", height: 3, borderRadius: "18px 18px 0 0", overflow: "hidden" }}>
            {["#E8C030", "#2D3A8C", "#4BAFD6", "#E91E8C"].map(c => (
              <div key={c} style={{ flex: 1, background: c }} />
            ))}
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <p style={{ fontSize: 11, color: "#4BAFD6", fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase" }}>Ask Hanen · DiL</p>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 4 }}>
                  Quel matériel pour votre projet ?
                </h2>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8",
                width: 26, height: 26, borderRadius: 6, cursor: "pointer", fontSize: 13, flexShrink: 0,
              }}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>
              Décrivez votre projet, je recommande le matériel dispo le plus adapté — depuis n'importe quelle page.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); search(); } }}
                placeholder="Ex : Je veux créer un robot qui suit une ligne..."
                rows={2}
                style={{
                  padding: "11px 14px", borderRadius: 10, fontSize: 13,
                  border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.07)",
                  color: "#e2e8f0", outline: "none", resize: "none", lineHeight: 1.5, fontFamily: "inherit",
                }}
              />
              <button
                onClick={search}
                disabled={loading || !query.trim()}
                style={{
                  padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: loading || !query.trim() ? "rgba(255,255,255,0.1)" : "#4BAFD6",
                  color: loading || !query.trim() ? "#475569" : "#fff",
                  border: "none", cursor: loading || !query.trim() ? "default" : "pointer",
                  transition: "all 0.15s",
                }}>
                {loading ? "Analyse..." : "Recommander →"}
              </button>
            </div>

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16,
                padding: "12px 14px", borderRadius: 10, background: "rgba(75,175,214,0.1)" }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: "2px solid rgba(75,175,214,0.3)", borderTop: "2px solid #4BAFD6",
                  animation: "askhanen-spin 0.8s linear infinite", flexShrink: 0,
                }} />
                <p style={{ fontSize: 12, color: "#4BAFD6" }}>Ask Hanen consulte l&apos;inventaire...</p>
              </div>
            )}

            {error && (
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10,
                background: "rgba(201,32,80,0.15)", border: "1px solid rgba(201,32,80,0.3)" }}>
                <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>
              </div>
            )}

            {result && (
              <div style={{ marginTop: 18 }}>
                {result.summary && (
                  <div style={{ padding: "10px 14px", borderRadius: 10,
                    background: "rgba(232,192,48,0.1)", border: "1px solid rgba(232,192,48,0.2)",
                    marginBottom: 14 }}>
                    <p style={{ fontSize: 12, color: "#E8C030", lineHeight: 1.5 }}>{result.summary}</p>
                  </div>
                )}
                {result.recommendations.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#64748b" }}>Aucune recommandation pour ce projet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.recommendations.map(eq => (
                      <div key={eq.id} onClick={() => goToEquipment(eq.id)}
                        style={{ display: "flex", gap: 12, padding: "10px 12px", borderRadius: 10,
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                          cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          background: "rgba(75,175,214,0.15)", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 16, overflow: "hidden" }}>
                          {eq.imageUrl
                            ? <img src={eq.imageUrl} alt={eq.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : (CAT_EMOJI[eq.category] ?? "📦")}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{eq.name}</p>
                          <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4,
                            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {eq.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: open ? "12px" : "12px 20px 12px 16px",
          borderRadius: 999, border: "none", cursor: "pointer",
          background: open ? "#0f172a" : "linear-gradient(135deg, #2D3A8C, #4BAFD6)",
          color: "#fff", fontSize: 13, fontWeight: 700,
          boxShadow: open ? "0 4px 16px rgba(15,23,42,0.3)" : "0 6px 20px rgba(45,58,140,0.35)",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
        <span style={{ fontSize: 16 }}>✦</span>
        {!open && "Ask Hanen"}
      </button>

      <style>{`@keyframes askhanen-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
