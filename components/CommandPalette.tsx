"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface NavItem { label: string; href: string; icon: string; }
interface EquipmentLite { id: string; name: string; brand: string | null; model: string | null; category: string; }

type Result =
  | { kind: "page"; label: string; sub: string; href: string; icon: string }
  | { kind: "equipment"; label: string; sub: string; href: string; icon: string };

/**
 * Palette de commande (Cmd+K / Ctrl+K) — recherche unifiée pages + matériel,
 * accessible depuis n'importe quelle page du dashboard ou de l'espace étudiant.
 */
export function CommandPalette({ navItems, equipmentBaseHref }: {
  navItems: NavItem[];
  equipmentBaseHref: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [equipment, setEquipment] = useState<EquipmentLite[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/equipment").then(r => r.json()).then(d => setEquipment(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const close = useCallback(() => { setOpen(false); setQuery(""); setActive(0); }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  const q = query.trim().toLowerCase();

  const pageResults: Result[] = navItems
    .filter(n => !q || n.label.toLowerCase().includes(q))
    .map(n => ({ kind: "page", label: n.label, sub: "Page", href: n.href, icon: n.icon }));

  const equipmentResults: Result[] = !q ? [] : equipment
    .filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.brand ?? "").toLowerCase().includes(q) ||
      (e.model ?? "").toLowerCase().includes(q))
    .slice(0, 8)
    .map(e => ({
      kind: "equipment", label: e.name,
      sub: [e.brand, e.model].filter(Boolean).join(" · ") || "Équipement",
      href: `${equipmentBaseHref}?equipment=${e.id}`, icon: "📦",
    }));

  const results = [...pageResults, ...equipmentResults];

  const go = (r: Result) => { close(); router.push(r.href); };

  useEffect(() => setActive(0), [query]);

  return (
    <>
      {/* Trigger hint, cliquable aussi */}
      <button onClick={() => setOpen(true)} style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 10px", borderRadius: 8, fontSize: 12,
        background: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0",
        cursor: "pointer", flexShrink: 0,
      }}>
        <span>🔎</span>
        <span style={{ display: "none" }} className="cmdk-label">Rechercher</span>
        <kbd style={{ fontSize: 10, fontFamily: "monospace", padding: "1px 5px", borderRadius: 4,
          background: "#fff", border: "1px solid #e2e8f0", color: "#94a3b8" }}>⌘K</kbd>
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex",
          alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}
          onClick={close}>
          <div className="modal-overlay-anim" style={{ position: "absolute", inset: 0,
            background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }} />
          <div className="modal-panel-anim" style={{ position: "relative", width: "100%", maxWidth: 560,
            margin: "0 20px", background: "#fff", borderRadius: 16, overflow: "hidden",
            boxShadow: "0 24px 64px rgba(15,23,42,0.3)" }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px",
              borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 15, color: "#94a3b8" }}>🔎</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
                  else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
                  else if (e.key === "Enter" && results[active]) { go(results[active]); }
                }}
                placeholder="Rechercher une page, un équipement..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#0f172a",
                  background: "transparent" }}
              />
              <kbd style={{ fontSize: 10, fontFamily: "monospace", padding: "2px 6px", borderRadius: 4,
                background: "#f1f5f9", color: "#94a3b8" }}>ESC</kbd>
            </div>

            <div style={{ maxHeight: 360, overflowY: "auto", padding: 8 }}>
              {results.length === 0 ? (
                <p style={{ fontSize: 13, color: "#cbd5e1", textAlign: "center", padding: "24px 0" }}>
                  Aucun résultat
                </p>
              ) : (
                <>
                  {pageResults.length > 0 && (
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase",
                      letterSpacing: "0.08em", padding: "6px 10px" }}>Pages</p>
                  )}
                  {results.map((r, i) => {
                    if (r.kind === "equipment" && (i === 0 || results[i - 1].kind !== "equipment")) {
                      return (
                        <div key={r.href}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase",
                            letterSpacing: "0.08em", padding: "10px 10px 6px" }}>Équipements</p>
                          <ResultRow r={r} isActive={i === active} onClick={() => go(r)} onHover={() => setActive(i)} />
                        </div>
                      );
                    }
                    return <ResultRow key={r.href} r={r} isActive={i === active} onClick={() => go(r)} onHover={() => setActive(i)} />;
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ResultRow({ r, isActive, onClick, onHover }: {
  r: Result; isActive: boolean; onClick: () => void; onHover: () => void;
}) {
  return (
    <div onClick={onClick} onMouseEnter={onHover}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px",
        borderRadius: 10, cursor: "pointer",
        background: isActive ? "#f1f5f9" : "transparent" }}>
      <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>{r.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</p>
        <p style={{ fontSize: 11, color: "#94a3b8" }}>{r.sub}</p>
      </div>
      {isActive && (
        <kbd style={{ fontSize: 10, fontFamily: "monospace", padding: "2px 6px", borderRadius: 4,
          background: "#fff", border: "1px solid #e2e8f0", color: "#94a3b8", flexShrink: 0 }}>↵</kbd>
      )}
    </div>
  );
}
