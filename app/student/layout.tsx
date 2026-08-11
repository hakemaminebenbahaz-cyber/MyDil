"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

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
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const name = session?.user?.name ?? "Étudiant";
  const initial = name.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

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
          <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
            <div onClick={() => setMenuOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #4BAFD6, #2D3A8C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff",
              }}>{initial}</div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>{name}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.2 }}>myDiL</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"
                style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            {menuOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9",
                boxShadow: "0 8px 24px rgba(15,23,42,0.12)", minWidth: 180, overflow: "hidden", zIndex: 60 }}>
                <button onClick={handleSignOut}
                  style={{ width: "100%", textAlign: "left", padding: "10px 16px",
                    fontSize: 13, fontWeight: 500, color: "#C03050", background: "none",
                    border: "none", cursor: "pointer" }}>
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px" }}>
        <div key={pathname} className="page-fade">
          {children}
        </div>
      </main>
    </div>
  );
}
