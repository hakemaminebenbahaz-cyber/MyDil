"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SkeletonCard } from "@/components/Skeleton";
import { VitrineMap } from "@/components/VitrineMap";

const CAT_LABELS: Record<string, string> = {
  ALL: "Tous", IOT: "IoT", VR_AR: "VR / AR", ROBOTICS: "Robotique", NETWORK: "Réseau",
  PRINTING_3D: "Impression 3D", COMPUTER: "Informatique", PERIPHERALS: "Périphériques",
  AUDIO: "Audio", COMPONENTS: "Composants", TOOLS: "Outillage", CONSUMABLE: "Consommable", MISC: "Divers",
};

const CAT_EMOJI: Record<string, string> = {
  VR_AR: "🥽", IOT: "🔌", COMPUTER: "💻", PRINTING_3D: "🖨️", ROBOTICS: "🤖",
  AUDIO: "🎧", NETWORK: "🌐", PERIPHERALS: "🖱️", COMPONENTS: "⚙️",
  TOOLS: "🔧", CONSUMABLE: "📦", MISC: "📦",
};

interface Equipment {
  id: string;
  internalId: string | null;
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  status: string;
  condition: string;
  location: string | null;
  quantity: number;
  description: string | null;
  loanable: boolean;
  imageUrl: string | null;
  reason?: string;
}

const CONDITION_LABEL: Record<string, { label: string; color: string }> = {
  NEW:      { label: "Neuf",      color: "#166534" },
  GOOD:     { label: "Bon état",  color: "#1e40af" },
  USED:     { label: "Usagé",     color: "#92400e" },
  OBSOLETE: { label: "Obsolète",  color: "#991b1b" },
};

export default function StudentInventairePage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [showMap, setShowMap] = useState(false);

  // AI assistant state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ recommendations: Equipment[]; summary: string } | null>(null);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    fetch("/api/equipment")
      .then(r => r.json())
      .then(data => { setEquipment(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const filtered = equipment.filter(e => {
    const matchCat = category === "ALL" || e.category === category;
    const matchLoc = location === "ALL" || e.location === location;
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) ||
      (e.brand ?? "").toLowerCase().includes(q) || (e.model ?? "").toLowerCase().includes(q);
    return matchCat && matchLoc && matchSearch && e.status === "AVAILABLE" && e.loanable;
  });

  const categories = ["ALL", ...Array.from(new Set(equipment.map(e => e.category)))];
  const locations = ["ALL", ...Array.from(new Set(equipment.map(e => e.location).filter((l): l is string => !!l))).sort()];

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const res = await fetch("/api/ai/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setAiResult(data);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Erreur serveur");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 6 }}>Inventaire</p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              Matériel disponible
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              {equipment.filter(e => e.status === "AVAILABLE" && e.loanable).length} équipements disponibles au prêt
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => setShowMap(m => !m)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: showMap ? "#0f172a" : "#fff",
                color: showMap ? "#fff" : "#0f172a",
                border: `1px solid ${showMap ? "#0f172a" : "#e2e8f0"}`,
                cursor: "pointer", transition: "all 0.15s",
              }}>
              <span style={{ fontSize: 15 }}>🗺️</span>
              Plan du local
            </button>
            <button
              onClick={() => { setAiOpen(o => !o); setAiResult(null); setAiError(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: aiOpen ? "#0f172a" : "linear-gradient(135deg, #2D3A8C, #4BAFD6)",
                color: "#fff", border: "none", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(45,58,140,0.25)", transition: "all 0.15s",
              }}>
              <span style={{ fontSize: 15 }}>✦</span>
              Ask Hanen
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {aiOpen && (
        <div style={{
          background: "#0f172a", borderRadius: 16, padding: 24, marginBottom: 24,
          boxShadow: "0 8px 32px rgba(15,23,42,0.2)",
        }}>
          <div style={{ display: "flex", height: 3, borderRadius: 2, overflow: "hidden", marginBottom: 20 }}>
            {["#E8C030", "#2D3A8C", "#4BAFD6", "#E91E8C"].map(c => (
              <div key={c} style={{ flex: 1, background: c }} />
            ))}
          </div>

          <p style={{ fontSize: 11, color: "#4BAFD6", fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", marginBottom: 6 }}>Ask Hanen · DiL</p>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
            Quel matériel pour votre projet ?
          </h2>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20, lineHeight: 1.5 }}>
            Décrivez votre projet en quelques mots et l'IA vous recommande le matériel le plus adapté parmi ce qui est disponible.
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <textarea
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAiSearch(); } }}
              placeholder="Ex : Je veux créer un robot qui suit une ligne et détecte des obstacles..."
              rows={3}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 10, fontSize: 13,
                border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.07)",
                color: "#e2e8f0", outline: "none", resize: "none", lineHeight: 1.6,
              }}
            />
            <button
              onClick={handleAiSearch}
              disabled={aiLoading || !aiQuery.trim()}
              style={{
                padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: aiLoading || !aiQuery.trim() ? "rgba(255,255,255,0.1)" : "#4BAFD6",
                color: aiLoading || !aiQuery.trim() ? "#475569" : "#fff",
                border: "none", cursor: aiLoading || !aiQuery.trim() ? "default" : "pointer",
                alignSelf: "flex-end", transition: "all 0.15s", whiteSpace: "nowrap",
              }}>
              {aiLoading ? "Analyse..." : "Recommander →"}
            </button>
          </div>

          {aiLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20,
              padding: "14px 16px", borderRadius: 10, background: "rgba(75,175,214,0.1)" }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                border: "2px solid rgba(75,175,214,0.3)", borderTop: "2px solid #4BAFD6",
                animation: "spin 0.8s linear infinite", flexShrink: 0,
              }} />
              <p style={{ fontSize: 12, color: "#4BAFD6" }}>Ask Hanen analyse votre projet et consulte l'inventaire...</p>
            </div>
          )}

          {aiError && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10,
              background: "rgba(201,32,80,0.15)", border: "1px solid rgba(201,32,80,0.3)" }}>
              <p style={{ fontSize: 12, color: "#f87171" }}>{aiError}</p>
            </div>
          )}

          {aiResult && (
            <div style={{ marginTop: 20 }}>
              {aiResult.summary && (
                <div style={{ padding: "12px 16px", borderRadius: 10,
                  background: "rgba(232,192,48,0.1)", border: "1px solid rgba(232,192,48,0.2)",
                  marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: "#E8C030", lineHeight: 1.6 }}>
                    <strong>Analyse IA :</strong> {aiResult.summary}
                  </p>
                </div>
              )}

              {aiResult.recommendations.length === 0 ? (
                <p style={{ fontSize: 13, color: "#64748b" }}>Aucune recommandation trouvée pour ce projet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                    letterSpacing: "0.08em", marginBottom: 4 }}>
                    {aiResult.recommendations.length} équipement(s) recommandé(s)
                  </p>
                  {aiResult.recommendations.map((eq: Equipment) => (
                    <div key={eq.id}
                      onClick={() => setSelected(eq)}
                      style={{
                        display: "flex", gap: 14, padding: "14px 16px", borderRadius: 12,
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer", transition: "all 0.15s",
                      }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: "rgba(75,175,214,0.15)", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, overflow: "hidden",
                      }}>
                        {eq.imageUrl
                          ? <img src={eq.imageUrl} alt={eq.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : (CAT_EMOJI[eq.category] ?? "📦")
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{eq.name}</p>
                          {eq.brand && (
                            <span style={{ fontSize: 11, color: "#475569" }}>
                              {eq.brand}{eq.model ? ` ${eq.model}` : ""}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{eq.reason}</p>
                      </div>
                      <div style={{ flexShrink: 0, alignSelf: "center" }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20,
                          background: "rgba(75,175,214,0.2)", color: "#4BAFD6", fontWeight: 600 }}>
                          Voir →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showMap && (
        <VitrineMap
          zones={locations.filter(l => l !== "ALL").map(l => ({
            key: l, label: l,
            count: equipment.filter(e => e.location === l && e.status === "AVAILABLE" && e.loanable).length,
          }))}
          active={location}
          onSelect={setLocation}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap: 20 }}>
        <div>
          {/* Search + filter */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input type="text" placeholder="Rechercher..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: "10px 16px", borderRadius: 10, fontSize: 13,
                border: "1px solid #e2e8f0", background: "#fff", outline: "none" }} />
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13,
                border: "1px solid #e2e8f0", background: "#fff", outline: "none" }}>
              {categories.map(c => (
                <option key={c} value={c}>{CAT_LABELS[c] ?? c}</option>
              ))}
            </select>
            <select value={location} onChange={e => setLocation(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13,
                border: "1px solid #e2e8f0", background: "#fff", outline: "none" }}>
              <option value="ALL">Tous les emplacements</option>
              {locations.filter(l => l !== "ALL").map(l => (
                <option key={l} value={l}>📍 {l}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: "48px 24px",
              border: "1px solid #f1f5f9", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Aucun équipement disponible</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {filtered.map((e, i) => {
                const isSelected = selected?.id === e.id;
                return (
                  <div key={e.id} onClick={() => setSelected(isSelected ? null : e)}
                    className="fade-in-up"
                    style={{ background: "#fff", borderRadius: 14, padding: 18, cursor: "pointer",
                      border: `1px solid ${isSelected ? "#2D3A8C" : "#f1f5f9"}`,
                      boxShadow: isSelected ? "0 0 0 3px rgba(45,58,140,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                      animationDelay: `${Math.min(i, 16) * 25}ms` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f8fafc",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, marginBottom: 14, overflow: "hidden", flexShrink: 0 }}>
                      {e.imageUrl
                        ? <img src={e.imageUrl} alt={e.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : (CAT_EMOJI[e.category] ?? "📦")
                      }
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                      {e.name}
                    </p>
                    <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>
                      {[e.brand, e.model].filter(Boolean).join(" · ") || CAT_LABELS[e.category]}
                    </p>
                    {e.location && (
                      <p style={{ fontSize: 11, color: "#2D3A8C", fontWeight: 600, marginBottom: 12,
                        display: "flex", alignItems: "center", gap: 4 }}>
                        📍 {e.location}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20,
                        background: "#dcfce7", color: "#166534", fontWeight: 600 }}>
                        Disponible
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>×{e.quantity}</span>
                    </div>
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
                {selected.imageUrl && (
                  <div style={{ width: "100%", height: 130, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
                    <img src={selected.imageUrl} alt={selected.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 10, color: "#4BAFD6", fontFamily: "monospace",
                      letterSpacing: "0.1em", marginBottom: 4 }}>
                      {selected.internalId ?? "—"}
                    </p>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                      {selected.name}
                    </h3>
                    <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                      {[selected.brand, selected.model].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)}
                    style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8",
                      width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
                    ✕
                  </button>
                </div>

                {selected.reason && (
                  <div style={{ padding: "10px 12px", borderRadius: 8,
                    background: "rgba(75,175,214,0.1)", border: "1px solid rgba(75,175,214,0.2)",
                    marginBottom: 16 }}>
                    <p style={{ fontSize: 11, color: "#4BAFD6", fontWeight: 600, marginBottom: 4 }}>
                      ✦ Recommandé par Ask Hanen
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{selected.reason}</p>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Catégorie",   value: CAT_LABELS[selected.category] ?? selected.category },
                    { label: "État",        value: CONDITION_LABEL[selected.condition]?.label ?? selected.condition },
                    { label: "Localisation", value: selected.location ?? "—" },
                    { label: "Quantité",    value: `${selected.quantity} disponible(s)` },
                  ].map(f => (
                    <div key={f.label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "#475569" }}>{f.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", textAlign: "right" }}>{f.value}</span>
                    </div>
                  ))}
                </div>

                {selected.description && (
                  <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.05)", marginBottom: 20 }}>
                    <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{selected.description}</p>
                  </div>
                )}

                <Link href={`/student/emprunts/nouveau?equipment=${selected.id}`} style={{ textDecoration: "none" }}>
                  <button style={{ width: "100%", padding: "11px 0", borderRadius: 10, fontSize: 13,
                    fontWeight: 700, background: "#4BAFD6", color: "#fff", border: "none", cursor: "pointer" }}>
                    Emprunter ce matériel
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus { border-color: rgba(75,175,214,0.5) !important; }
      `}</style>
    </div>
  );
}
