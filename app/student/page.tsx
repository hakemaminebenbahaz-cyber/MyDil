import Link from "next/link";

export default function StudentHomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 6 }}>Espace étudiant</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Bonjour, Thomas 👋
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>B3 Dev IA · EPSI Courbevoie</p>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Faire un emprunt", sub: "Demander du matériel", href: "/student/emprunts/nouveau",
            accent: "#2D3A8C", bg: "#eef2ff", emoji: "📦" },
          { label: "Déposer un projet", sub: "Soumettre votre travail", href: "/student/projets/nouveau",
            accent: "#4BAFD6", bg: "#f0f9ff", emoji: "💡" },
          { label: "Voir l'inventaire", sub: "Explorer le matériel dispo", href: "/student/inventaire",
            accent: "#166534", bg: "#dcfce7", emoji: "🔍" },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 24,
              border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: a.bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>
                {a.emoji}
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{a.label}</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{a.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Active loans */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24,
        border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Mes emprunts actifs</h3>
          <Link href="/student/emprunts" style={{ fontSize: 12, color: "#4BAFD6", textDecoration: "none", fontWeight: 500 }}>
            Voir tout →
          </Link>
        </div>
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <p style={{ fontSize: 13, color: "#cbd5e1" }}>Aucun emprunt en cours</p>
          <Link href="/student/emprunts/nouveau">
            <button style={{ marginTop: 16, padding: "9px 20px", borderRadius: 10, fontSize: 12,
              fontWeight: 600, background: "#0f172a", color: "#fff", border: "none", cursor: "pointer" }}>
              + Faire une demande
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
