"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Equipment = {
  id: string; internalId: string | null; name: string;
  brand: string | null; model: string | null; category: string; location: string | null;
};

const LEVELS = ["B1", "B2", "B3", "M1", "M2"];
const SCHOOLS = ["EPSI", "WIS"];
const LOCATIONS = ["Courbevoie", "Paris", "Lyon", "Bordeaux", "Toulouse", "Nantes"];

const CAT: Record<string, string> = {
  IOT: "IoT", VR_AR: "VR / AR", ROBOTICS: "Robotique", NETWORK: "Réseau",
  PRINTING_3D: "Impression 3D", COMPUTER: "Informatique", PERIPHERALS: "Périphériques",
  AUDIO: "Audio", COMPONENTS: "Composants", TOOLS: "Outillage", CONSUMABLE: "Consommable", MISC: "Divers",
};

export default function NouvelEmpruntPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Equipment | null>(null);
  const [step, setStep]           = useState<1 | 2 | 3>(1);
  const [agreed, setAgreed]       = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    level: "B3", school: "EPSI", classe: "B3 Dev IA",
    startDate: "", startTime: "", endDate: "", endTime: "",
    location: "Courbevoie", note: "",
  });

  useEffect(() => {
    fetch("/api/equipment").then(r => r.json()).then(setEquipment);
  }, []);

  const filtered = equipment.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.brand ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const today = new Date().toISOString().split("T")[0];

  if (submitted) {
    return (
      <div style={{ maxWidth: 560, margin: "80px auto", textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, background: "#dcfce7",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Demande envoyée
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 10, lineHeight: 1.6 }}>
          Votre demande d'emprunt pour <strong>{selected?.name}</strong> a été transmise.<br />
          Un responsable va valider votre demande sous peu.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 32 }}>
          <button onClick={() => router.push("/student/emprunts")}
            style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "#0f172a", color: "#fff", border: "none", cursor: "pointer" }}>
            Voir mes emprunts
          </button>
          <button onClick={() => { setSubmitted(false); setStep(1); setSelected(null); setAgreed(false); }}
            style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "#f1f5f9", color: "#0f172a", border: "none", cursor: "pointer" }}>
            Nouveau prêt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          Espace étudiant
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Nouvelle demande de prêt
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
          Remplace la fiche de prêt papier · Validation par un responsable myDiL
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
        {[
          { n: 1, label: "Matériel" },
          { n: 2, label: "Informations" },
          { n: 3, label: "Confirmation" },
        ].map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: step >= s.n ? "#0f172a" : "#f1f5f9",
                color: step >= s.n ? "#fff" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
              }}>{step > s.n ? "✓" : s.n}</div>
              <span style={{ fontSize: 12, fontWeight: step === s.n ? 600 : 400,
                color: step === s.n ? "#0f172a" : "#94a3b8" }}>{s.label}</span>
            </div>
            {i < 2 && (
              <div style={{ flex: 1, height: 1, background: step > s.n ? "#0f172a" : "#e2e8f0", margin: "0 16px" }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1 : Equipment ── */}
      {step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
          <div>
            <input type="text" placeholder="Rechercher un équipement..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 16px", borderRadius: 10, fontSize: 13,
                border: "1px solid #e2e8f0", background: "#fff", outline: "none", marginBottom: 12 }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 460, overflowY: "auto" }}>
              {filtered.map(e => {
                const isSelected = selected?.id === e.id;
                return (
                  <div key={e.id} onClick={() => setSelected(e)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                      background: isSelected ? "#0f172a" : "#fff",
                      border: `1px solid ${isSelected ? "#0f172a" : "#f1f5f9"}`,
                      boxShadow: isSelected ? "0 4px 12px rgba(15,23,42,0.15)" : "0 1px 2px rgba(0,0,0,0.03)",
                      transition: "all 0.15s",
                    }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isSelected ? "rgba(255,255,255,0.1)" : "#f8fafc",
                      border: `1px solid ${isSelected ? "rgba(255,255,255,0.1)" : "#f1f5f9"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>
                      {e.category === "VR_AR" ? "🥽" : e.category === "IOT" ? "🔌" :
                       e.category === "COMPUTER" ? "💻" : e.category === "PRINTING_3D" ? "🖨️" :
                       e.category === "ROBOTICS" ? "🤖" : e.category === "AUDIO" ? "🎧" : "📦"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600,
                        color: isSelected ? "#fff" : "#0f172a",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {e.name}
                      </p>
                      <p style={{ fontSize: 11, color: isSelected ? "#64748b" : "#94a3b8", marginTop: 2 }}>
                        {CAT[e.category]} · {e.location ?? "—"}
                      </p>
                    </div>
                    {isSelected && (
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#4BAFD6",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div>
            {selected ? (
              <div style={{ borderRadius: 14, background: "#0f172a", overflow: "hidden",
                boxShadow: "0 8px 24px rgba(15,23,42,0.2)", position: "sticky", top: 80 }}>
                <div style={{ display: "flex", height: 3 }}>
                  {["#E8C030","#2D3A8C","#4BAFD6","#C03050"].map(c => (
                    <div key={c} style={{ flex: 1, background: c }} />
                  ))}
                </div>
                <div style={{ padding: 20 }}>
                  <p style={{ fontSize: 10, color: "#4BAFD6", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                    {selected.internalId}
                  </p>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginTop: 6, lineHeight: 1.3 }}>
                    {selected.name}
                  </h3>
                  <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                    {[selected.brand, selected.model].filter(Boolean).join(" · ")}
                  </p>
                  <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: 11, color: "#475569" }}>Localisation</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginTop: 3 }}>{selected.location ?? "—"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ borderRadius: 14, border: "1.5px dashed #e2e8f0", height: 200,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: 13, color: "#cbd5e1" }}>Sélectionnez un équipement</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2 : Form ── */}
      {step === 2 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #f1f5f9" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: 16 }}>Informations étudiant</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Niveau</label>
                    <select value={form.level} onChange={e => set("level", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
                        border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>École</label>
                    <select value={form.school} onChange={e => set("school", e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
                        border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }}>
                      {SCHOOLS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Classe / Spécialisation</label>
                  <input value={form.classe} onChange={e => set("classe", e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
                      border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Lieu du prêt</label>
                  <select value={form.location} onChange={e => set("location", e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
                      border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }}>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #f1f5f9" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: 16 }}>Période d'emprunt</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Date de début</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input type="date" min={today} value={form.startDate} onChange={e => set("startDate", e.target.value)}
                      style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13,
                        border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }} />
                    <input type="time" value={form.startTime} onChange={e => set("startTime", e.target.value)}
                      style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13,
                        border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Date de retour prévue</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input type="date" min={form.startDate || today} value={form.endDate} onChange={e => set("endDate", e.target.value)}
                      style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13,
                        border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }} />
                    <input type="time" value={form.endTime} onChange={e => set("endTime", e.target.value)}
                      style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13,
                        border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Motif / Note (optionnel)</label>
                  <textarea value={form.note} onChange={e => set("note", e.target.value)}
                    rows={3} placeholder="Projet IoT, cours, workshop..."
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
                      border: "1px solid #e2e8f0", background: "#f8fafc", outline: "none",
                      resize: "none", fontFamily: "inherit" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right recap */}
          <div style={{ position: "sticky", top: 80, alignSelf: "flex-start" }}>
            <div style={{ borderRadius: 14, background: "#0f172a", overflow: "hidden",
              boxShadow: "0 8px 24px rgba(15,23,42,0.2)" }}>
              <div style={{ display: "flex", height: 3 }}>
                {["#E8C030","#2D3A8C","#4BAFD6","#C03050"].map(c => (
                  <div key={c} style={{ flex: 1, background: c }} />
                ))}
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 16 }}>Récapitulatif</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Matériel",  value: selected?.name ?? "—" },
                    { label: "Niveau",    value: `${form.level} · ${form.school}` },
                    { label: "Classe",    value: form.classe || "—" },
                    { label: "Lieu",      value: form.location },
                    { label: "Du",        value: form.startDate && form.startTime ? `${form.startDate} à ${form.startTime}` : "—" },
                    { label: "Au",        value: form.endDate && form.endTime ? `${form.endDate} à ${form.endTime}` : "—" },
                  ].map(f => (
                    <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "#475569", flexShrink: 0 }}>{f.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", textAlign: "right" }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 : Confirmation ── */}
      {step === 3 && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ borderRadius: 16, background: "#fff", border: "1px solid #f1f5f9",
            overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {/* Header */}
            <div style={{ background: "#0f172a", padding: "24px 28px" }}>
              <div style={{ display: "flex", height: 2, marginBottom: 20 }}>
                {["#E8C030","#2D3A8C","#4BAFD6","#C03050"].map(c => (
                  <div key={c} style={{ flex: 1, background: c }} />
                ))}
              </div>
              <p style={{ fontSize: 10, color: "#4BAFD6", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                FICHE DE PRÊT NUMÉRIQUE · myDiL
              </p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 8 }}>
                {selected?.name}
              </h3>
            </div>

            {/* Body */}
            <div style={{ padding: 28 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Je soussigné(e)", value: session?.user?.name ?? "—" },
                  { label: "Niveau", value: `${form.level} · ${form.school}` },
                  { label: "Classe", value: form.classe },
                  { label: "Lieu du prêt", value: form.location },
                  { label: "Date de début", value: `${form.startDate} à ${form.startTime}` },
                  { label: "Retour prévu", value: `${form.endDate} à ${form.endTime}` },
                ].map(f => (
                  <div key={f.label}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                      {f.label}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{f.value || "—"}</p>
                  </div>
                ))}
              </div>

              {form.note && (
                <div style={{ padding: 14, borderRadius: 10, background: "#f8fafc", marginBottom: 24 }}>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Note</p>
                  <p style={{ fontSize: 13, color: "#0f172a" }}>{form.note}</p>
                </div>
              )}

              {/* Agreement */}
              <div style={{ padding: 16, borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc" }}>
                <label style={{ display: "flex", gap: 12, cursor: "pointer", alignItems: "flex-start" }}>
                  <div onClick={() => setAgreed(!agreed)}
                    style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      border: `2px solid ${agreed ? "#0f172a" : "#e2e8f0"}`,
                      background: agreed ? "#0f172a" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                    {agreed && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, userSelect: "none" }}>
                    Je certifie avoir pris connaissance du règlement d'emprunt myDiL. Je m'engage à restituer le matériel en bon état à la date prévue.
                    En cas de perte ou de dégradation, ma responsabilité sera engagée.
                  </p>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit error */}
      {submitError && (
        <div style={{ marginTop: 16, padding: "10px 16px", borderRadius: 10, background: "#fff0f3",
          border: "1px solid #f5c0cc", color: "#C03050", fontSize: 13 }}>
          {submitError}
        </div>
      )}

      {/* Nav buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20,
        borderTop: "1px solid #f1f5f9" }}>
        <button onClick={() => step > 1 ? setStep((step - 1) as 1|2|3) : router.back()}
          style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "#f1f5f9", color: "#64748b", border: "none", cursor: "pointer" }}>
          ← Retour
        </button>
        {step < 3 ? (
          <button
            disabled={step === 1 && !selected}
            onClick={() => setStep((step + 1) as 2|3)}
            style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: step === 1 && !selected ? "#e2e8f0" : "#0f172a",
              color: step === 1 && !selected ? "#94a3b8" : "#fff",
              border: "none", cursor: step === 1 && !selected ? "not-allowed" : "pointer" }}>
            Continuer →
          </button>
        ) : (
          <button
            disabled={!agreed || submitting}
            onClick={async () => {
              setSubmitError("");

              if (!session?.user?.id) {
                setSubmitError("Session expirée — déconnectez-vous et reconnectez-vous.");
                return;
              }
              if (!form.startDate || !form.endDate) {
                setSubmitError("Veuillez renseigner les dates d'emprunt (étape 2).");
                return;
              }

              setSubmitting(true);
              try {
                const startDate = new Date(`${form.startDate}T${form.startTime || "08:00"}`);
                const endDate   = new Date(`${form.endDate}T${form.endTime || "18:00"}`);
                const res = await fetch("/api/loans", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: session.user.id,
                    equipmentId: selected?.id,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    note: form.note || null,
                  }),
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  throw new Error(err.error || `Erreur ${res.status}`);
                }
                setSubmitted(true);
              } catch {
                setSubmitError("Une erreur est survenue. Réessayez.");
              } finally {
                setSubmitting(false);
              }
            }}
            style={{ padding: "10px 28px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: agreed && !submitting ? "#0f172a" : "#e2e8f0",
              color: agreed && !submitting ? "#fff" : "#94a3b8",
              border: "none", cursor: agreed && !submitting ? "pointer" : "not-allowed" }}>
            {submitting ? "Envoi..." : "Envoyer la demande"}
          </button>
        )}
      </div>
    </div>
  );
}
