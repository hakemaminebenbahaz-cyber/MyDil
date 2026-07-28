"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "En attente",  color: "#92400e", bg: "#fef3c7" },
  APPROVED: { label: "Approuvé",    color: "#166534", bg: "#dcfce7" },
  REFUSED:  { label: "Refusé",      color: "#991b1b", bg: "#fee2e2" },
  RETURNED: { label: "Retourné",    color: "#1e40af", bg: "#dbeafe" },
  OVERDUE:  { label: "En retard",   color: "#7c2d12", bg: "#ffedd5" },
};

const CAT_EMOJI: Record<string, string> = {
  VR_AR: "🥽", IOT: "🔌", COMPUTER: "💻", PRINTING_3D: "🖨️", ROBOTICS: "🤖", AUDIO: "🎧",
};

interface Loan {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  note: string | null;
  createdAt: string;
  equipment: { name: string; internalId: string | null; category: string };
}

export default function MesEmpruntsPage() {
  const { data: session } = useSession();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/loans?userId=${session.user.id}`)
      .then(r => r.json())
      .then(data => {
        setLoans(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const active   = loans.filter(l => l.status === "APPROVED" || l.status === "PENDING");
  const history  = loans.filter(l => l.status === "RETURNED" || l.status === "REFUSED" || l.status === "OVERDUE");

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8", fontSize: 13 }}>
        Chargement...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: 6 }}>Mes emprunts</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Suivi des prêts
          </h1>
        </div>
        <Link href="/student/emprunts/nouveau" style={{ textDecoration: "none" }}>
          <button style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "#0f172a", color: "#fff", border: "none", cursor: "pointer" }}>
            + Nouveau prêt
          </button>
        </Link>
      </div>

      {loans.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: "60px 24px",
          border: "1px solid #f1f5f9", textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
            Aucun emprunt
          </h3>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
            Vous n'avez pas encore fait de demande de prêt
          </p>
          <Link href="/student/emprunts/nouveau" style={{ textDecoration: "none" }}>
            <button style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "#0f172a", color: "#fff", border: "none", cursor: "pointer" }}>
              Faire une demande
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Active */}
          {active.length > 0 && (
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                En cours · {active.length}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {active.map(loan => {
                  const s = STATUS_CONFIG[loan.status];
                  const emoji = CAT_EMOJI[loan.equipment.category] ?? "📦";
                  const isOverdue = new Date(loan.endDate) < new Date() && loan.status === "APPROVED";
                  return (
                    <div key={loan.id} style={{ background: "#fff", borderRadius: 14,
                      border: `1px solid ${isOverdue ? "#fecaca" : "#f1f5f9"}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                      {isOverdue && (
                        <div style={{ background: "#fee2e2", padding: "6px 20px", fontSize: 11,
                          fontWeight: 600, color: "#991b1b" }}>
                          ⚠ Retour en retard
                        </div>
                      )}
                      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f8fafc",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20, flexShrink: 0 }}>{emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {loan.equipment.name}
                            </p>
                            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11,
                              fontWeight: 600, background: s.bg, color: s.color, flexShrink: 0 }}>
                              {s.label}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "#94a3b8" }}>
                            Du {fmt(loan.startDate)} au {fmt(loan.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                Historique · {history.length}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map(loan => {
                  const s = STATUS_CONFIG[loan.status] ?? STATUS_CONFIG.RETURNED;
                  const emoji = CAT_EMOJI[loan.equipment.category] ?? "📦";
                  return (
                    <div key={loan.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 20px",
                      border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      display: "flex", alignItems: "center", gap: 16, opacity: 0.7 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f8fafc",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, flexShrink: 0 }}>{emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {loan.equipment.name}
                          </p>
                          <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11,
                            fontWeight: 600, background: s.bg, color: s.color, flexShrink: 0 }}>
                            {s.label}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: "#94a3b8" }}>
                          {fmt(loan.startDate)} → {fmt(loan.endDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
