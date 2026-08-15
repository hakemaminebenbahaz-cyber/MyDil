"use client";

interface Zone {
  key: string;
  label: string;
  count: number;
}

const DOTS = ["#E8C030", "#2D3A8C", "#4BAFD6", "#C03050"];

/**
 * Plan schématique du local myDiL — 5 vitrines contre le mur du fond
 * + la salle principale (impression 3D, ateliers). Les positions sont
 * stylisées (pas un relevé architectural précis), pensées pour repérer
 * rapidement dans quelle zone se trouve un équipement.
 */
export function VitrineMap({
  zones,
  active,
  onSelect,
}: {
  zones: Zone[];
  active: string;
  onSelect: (key: string) => void;
}) {
  const vitrines = zones.filter(z => z.key.startsWith("Vitrine")).sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
  const salle = zones.find(z => !z.key.startsWith("Vitrine"));

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20,
      border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
            letterSpacing: "0.08em" }}>Plan du local</p>
          <p style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}>Clique une zone pour filtrer</p>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {DOTS.map(c => <div key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />)}
        </div>
      </div>

      {/* Room outline */}
      <div style={{ border: "2px dashed #e2e8f0", borderRadius: 16, padding: 16,
        display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Vitrines row — mur du fond */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${vitrines.length}, 1fr)`, gap: 10 }}>
          {vitrines.map(v => {
            const isActive = active === v.key;
            return (
              <button key={v.key}
                onClick={() => onSelect(isActive ? "ALL" : v.key)}
                style={{
                  padding: "14px 8px", borderRadius: 10, cursor: "pointer",
                  border: `1.5px solid ${isActive ? "#2D3A8C" : "#e2e8f0"}`,
                  background: isActive ? "#eef2ff" : "#fafbfc",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                }}>
                <span style={{ fontSize: 18 }}>🗄️</span>
                <span style={{ fontSize: 11, fontWeight: 700,
                  color: isActive ? "#2D3A8C" : "#0f172a" }}>{v.label}</span>
                <span style={{ fontSize: 10, color: isActive ? "#4BAFD6" : "#94a3b8" }}>
                  {v.count} équip.
                </span>
              </button>
            );
          })}
        </div>

        {/* Salle myDiL — grande zone */}
        {salle && (
          <button
            onClick={() => onSelect(active === salle.key ? "ALL" : salle.key)}
            style={{
              padding: "20px 16px", borderRadius: 10, cursor: "pointer",
              border: `1.5px solid ${active === salle.key ? "#2D3A8C" : "#e2e8f0"}`,
              background: active === salle.key ? "#eef2ff" : "#fafbfc",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.15s",
            }}>
            <span style={{ fontSize: 20 }}>🏭</span>
            <span style={{ fontSize: 12, fontWeight: 700,
              color: active === salle.key ? "#2D3A8C" : "#0f172a" }}>{salle.label}</span>
            <span style={{ fontSize: 11, color: active === salle.key ? "#4BAFD6" : "#94a3b8" }}>
              {salle.count} équip. · impression 3D & ateliers
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
