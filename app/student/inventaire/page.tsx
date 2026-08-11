"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetch("/api/equipment")
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setEquipment(list);
        setLoading(false);
        // Arrivée depuis Ask Hanen (autre page) avec un équipement précis à ouvrir
        const wanted = searchParams.get("equipment");
        if (wanted) {
          const match = list.find((e: Equipment) => e.id === wanted);
          if (match) setSelected(match);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <button
            onClick={() => setShowMap(m => !m)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: showMap ? "#0f172a" : "#fff",
              color: showMap ? "#fff" : "#0f172a",
              border: `1px solid ${showMap ? "#0f172a" : "#e2e8f0"}`,
              cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
            }}>
            <span style={{ fontSize: 15 }}>🗺️</span>
            Plan du local
          </button>
        </div>
      </div>

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
    </div>
  );
}
