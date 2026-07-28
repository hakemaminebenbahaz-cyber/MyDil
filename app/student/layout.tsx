"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Accueil",      href: "/student" },
  { label: "Inventaire",   href: "/student/inventaire" },
  { label: "Mes emprunts", href: "/student/emprunts" },
  { label: "Mes projets",  href: "/student/projets" },
  { label: "Vitrine",      href: "/projets" },
];

const DOTS = ["#E8C030", "#2D3A8C", "#4BAFD6", "#C03050"];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fff", borderBottom: "1px solid #f1f5f9",
        boxShadow: "0 1px 0 0 #f1f5f9",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 32px",
          height: 56, display: "flex", alignItems: "center", gap: 32,
        }}>
          <Link href="/student" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {DOTS.map((c, i) => (
                <div key={c} style={{
                  width: i % 2 === 0 ? 8 : 6, height: i % 2 === 0 ? 8 : 6,
                  background: c, alignSelf: i % 2 === 0 ? "flex-end" : "flex-start",
                }} />
              ))}
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>myDiL</span>
          </Link>
          <div style={{ width: 1, height: 20, background: "#e2e8f0", flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#0f172a" : "#94a3b8",
                  background: active ? "#f1f5f9" : "transparent",
                  textDecoration: "none", transition: "all 0.15s",
                }}>{item.label}</Link>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #4BAFD6, #2D3A8C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff",
            }}>T</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>Thomas B.</p>
              <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.2 }}>B3 Dev IA</p>
            </div>
          </div>
        </div>
      </nav>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px" }}>
        {children}
      </main>
    </div>
  );
}
