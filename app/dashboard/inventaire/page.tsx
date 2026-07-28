"use client";

import { useEffect, useState, useMemo, useRef } from "react";

type Equipment = {
  id: string; internalId: string | null; name: string; model: string | null;
  brand: string | null; category: string; status: string; condition: string;
  location: string | null; quantity: number; description: string | null;
  loanable: boolean; loanCount: number; reference: string | null;
  imageUrl: string | null;
};

const CAT: Record<string, string> = {
  IOT: "IoT", VR_AR: "VR / AR", ROBOTICS: "Robotique", NETWORK: "Réseau",
  PRINTING_3D: "Impression 3D", COMPUTER: "Informatique", PERIPHERALS: "Périphériques",
  AUDIO: "Audio", COMPONENTS: "Composants", TOOLS: "Outillage",
  CONSUMABLE: "Consommable", MISC: "Divers",
};

const CAT_DOT: Record<string, string> = {
  IOT: "#2D3A8C", VR_AR: "#7c3aed", ROBOTICS: "#0369a1", NETWORK: "#0f766e",
  PRINTING_3D: "#c97a10", COMPUTER: "#1a9e5c", PERIPHERALS: "#64748b",
  AUDIO: "#C03050", COMPONENTS: "#b45309", TOOLS: "#78350f",
  CONSUMABLE: "#6d28d9", MISC: "#94a3b8",
};

const COND: Record<string, { label: string; color: string; bg: string }> = {
  NEW:      { label: "Neuf",    color: "#1d4ed8", bg: "#dbeafe" },
  GOOD:     { label: "Bon",     color: "#166534", bg: "#dcfce7" },
  USED:     { label: "Usagé",   color: "#92400e", bg: "#fef3c7" },
  OBSOLETE: { label: "Vétuste", color: "#9f1239", bg: "#ffe4e6" },
};

const STAT: Record<string, { label: string; dot: string; color: string; bg: string }> = {
  AVAILABLE:   { label: "Disponible",  dot: "#22c55e", color: "#166534", bg: "#dcfce7" },
  LOANED:      { label: "En prêt",     dot: "#f59e0b", color: "#92400e", bg: "#fef3c7" },
  MAINTENANCE: { label: "Maintenance", dot: "#f43f5e", color: "#9f1239", bg: "#ffe4e6" },
};

export default function InventairePage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [cat, setCat]             = useState("Toutes");
  const [stat, setStat]           = useState("Tous");
  const [selected, setSelected]   = useState<Equipment | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const [showModal, setShowModal]   = useState(false);
  const [editModal, setEditModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emptyForm = { name: "", brand: "", model: "", internalId: "", category: "MISC",
    condition: "GOOD", location: "", quantity: "1", description: "", loanable: true };
  const [form, setForm]   = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const openEdit = () => {
    if (!selected) return;
    setEditForm({
      name:       selected.name,
      brand:      selected.brand ?? "",
      model:      selected.model ?? "",
      internalId: selected.internalId ?? "",
      category:   selected.category,
      condition:  selected.condition,
      location:   selected.location ?? "",
      quantity:   String(selected.quantity),
      description: selected.description ?? "",
      loanable:   selected.loanable,
    });
    setEditModal(true);
  };

  const handleEdit = async () => {
    if (!selected || !editForm.name.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/equipment/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        quantity: parseInt(editForm.quantity) || 1,
        internalId:  editForm.internalId.trim()  || null,
        brand:       editForm.brand.trim()        || null,
        model:       editForm.model.trim()        || null,
        location:    editForm.location.trim()     || null,
        description: editForm.description.trim()  || null,
      }),
    });
    const updated = await res.json();
    setEquipment(prev => prev.map(eq => eq.id === updated.id ? updated : eq));
    setSelected(updated);
    setEditModal(false);
    setSubmitting(false);
  };

  const handleMaintenance = async () => {
    if (!selected) return;
    const newStatus = selected.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
    const res = await fetch(`/api/equipment/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const updated = await res.json();
    setEquipment(prev => prev.map(eq => eq.id === updated.id ? updated : eq));
    setSelected(updated);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: parseInt(form.quantity) || 1,
        internalId: form.internalId.trim() || null,
        brand: form.brand.trim() || null,
        model: form.model.trim() || null,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
      }),
    });
    const created = await res.json();
    setEquipment(prev => [created, ...prev]);
    setSelected(created);
    setShowModal(false);
    setForm(emptyForm);
    setSubmitting(false);
    // L'image arrive en arrière-plan — on la récupère après 6 secondes
    setTimeout(async () => {
      const updated = await fetch(`/api/equipment`).then(r => r.json());
      const found = updated.find((e: Equipment) => e.id === created.id);
      if (found?.imageUrl) {
        setEquipment(updated);
        setSelected(s => s?.id === created.id ? found : s);
      }
    }, 6000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "equipment");
    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await uploadRes.json();
    await fetch(`/api/equipment/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });
    const updated = { ...selected, imageUrl: url };
    setSelected(updated);
    setEquipment(prev => prev.map(eq => eq.id === selected.id ? updated : eq));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    fetch("/api/equipment").then(r => r.json()).then(d => {
      setEquipment(d); setLoading(false); setSelected(d[0] ?? null);
    });
  }, []);

  const filtered = useMemo(() =>
    equipment.filter(e => {
      const q = search.toLowerCase();
      return (
        (e.name.toLowerCase().includes(q) || (e.brand ?? "").toLowerCase().includes(q) ||
          (e.internalId ?? "").toLowerCase().includes(q)) &&
        (cat === "Toutes" || e.category === cat) &&
        (stat === "Tous"  || e.status === stat)
      );
    }), [equipment, search, cat, stat]);

  const counts = useMemo(() => ({
    total: equipment.length,
    available:   equipment.filter(e => e.status === "AVAILABLE").length,
    loaned:      equipment.filter(e => e.status === "LOANED").length,
    maintenance: equipment.filter(e => e.status === "MAINTENANCE").length,
  }), [equipment]);

  const sel = selected;
  const selCond   = sel ? (COND[sel.condition] ?? COND.GOOD)    : null;
  const selStat   = sel ? (STAT[sel.status]    ?? STAT.AVAILABLE) : null;
  const selDot    = sel ? (CAT_DOT[sel.category] ?? "#94a3b8")   : null;

  return (
    <>
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)" }}>

      {/* ══ LEFT ══ */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 16 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Inventaire · {counts.total} équipements
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", marginTop: 4 }}>
              Matériel myDiL
            </h2>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "#0f172a", color: "#fff", border: "none", cursor: "pointer",
          }}>
            + Ajouter
          </button>
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {[
            { label: "Tout", val: "Tous" },
            { label: `Disponible (${counts.available})`,  val: "AVAILABLE" },
            { label: `En prêt (${counts.loaned})`,        val: "LOANED" },
            { label: `Maintenance (${counts.maintenance})`, val: "MAINTENANCE" },
          ].map(t => (
            <button key={t.val} onClick={() => setStat(t.val)} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: stat === t.val ? "#0f172a" : "#fff",
              color:      stat === t.val ? "#fff"    : "#64748b",
              border:     `1px solid ${stat === t.val ? "#0f172a" : "#e2e8f0"}`,
              cursor: "pointer", transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Search + category */}
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Rechercher un équipement..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10, fontSize: 13,
                border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", outline: "none",
              }}
            />
          </div>
          <select value={cat} onChange={e => setCat(e.target.value)} style={{
            padding: "9px 14px", borderRadius: 10, fontSize: 13, border: "1px solid #e2e8f0",
            background: "#fff", color: cat !== "Toutes" ? "#0f172a" : "#64748b", outline: "none", cursor: "pointer",
          }}>
            <option value="Toutes">Toutes catégories</option>
            {Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#cbd5e1", fontSize: 13 }}>
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#cbd5e1", fontSize: 13 }}>
              Aucun résultat
            </div>
          ) : filtered.map(e => {
            const isActive = sel?.id === e.id;
            const s = STAT[e.status] ?? STAT.AVAILABLE;
            const dot = CAT_DOT[e.category] ?? "#94a3b8";
            return (
              <div key={e.id} onClick={() => setSelected(e)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 16px", borderRadius: 12, cursor: "pointer",
                  background: isActive ? "#0f172a" : "#fff",
                  border: `1px solid ${isActive ? "#0f172a" : "#f1f5f9"}`,
                  boxShadow: isActive ? "0 4px 12px rgba(15,23,42,0.15)" : "0 1px 2px rgba(0,0,0,0.03)",
                  transition: "all 0.15s",
                }}>

                {/* Colored dot */}
                <div style={{
                  width: 3, height: 32, borderRadius: 99, flexShrink: 0,
                  background: isActive ? "#4BAFD6" : dot,
                }} />

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 600, color: isActive ? "#fff" : "#0f172a",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{e.name}</p>
                  <p style={{
                    fontSize: 11, color: isActive ? "#475569" : "#94a3b8", marginTop: 2,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{[e.brand, e.model].filter(Boolean).join(" · ") || "—"}</p>
                </div>

                {/* Right */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: isActive ? "#94a3b8" : dot,
                  }}>{CAT[e.category]}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
                    <span style={{ fontSize: 11, color: isActive ? "#475569" : "#cbd5e1" }}>
                      ×{e.quantity}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: "#cbd5e1", flexShrink: 0 }}>
          {filtered.length} / {counts.total} résultats
        </p>
      </div>

      {/* ══ RIGHT ══ */}
      <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {sel && selCond && selStat && selDot ? (
          <>
            {/* Hero card */}
            <div style={{ borderRadius: 16, overflow: "hidden", background: "#0f172a", flexShrink: 0,
              boxShadow: "0 8px 32px rgba(15,23,42,0.18)" }}>
              {/* Top bar */}
              <div style={{ display: "flex", height: 3 }}>
                {["#E8C030","#2D3A8C","#4BAFD6","#C03050"].map(c => (
                  <div key={c} style={{ flex: 1, background: c }} />
                ))}
              </div>

              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Photo */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%", height: 140, borderRadius: 12, overflow: "hidden",
                    background: "rgba(255,255,255,0.05)", border: "1.5px dashed rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", position: "relative", transition: "border-color 0.15s",
                  }}>
                  {sel.imageUrl ? (
                    <img src={sel.imageUrl} alt={sel.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 22, marginBottom: 6 }}>📷</p>
                      <p style={{ fontSize: 11, color: "#475569" }}>
                        {uploading ? "Envoi en cours..." : "Ajouter une photo"}
                      </p>
                    </div>
                  )}
                  {sel.imageUrl && (
                    <div style={{
                      position: "absolute", bottom: 8, right: 8,
                      background: "rgba(15,23,42,0.7)", borderRadius: 6,
                      padding: "4px 10px", fontSize: 11, color: "#94a3b8",
                    }}>
                      {uploading ? "Envoi..." : "Changer"}
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handleImageUpload} style={{ display: "none" }} />

                {/* ID + Name */}
                <div>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#4BAFD6", letterSpacing: "0.1em" }}>
                    {sel.internalId}
                  </span>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginTop: 6, lineHeight: 1.3, letterSpacing: "-0.3px" }}>
                    {sel.name}
                  </h3>
                  <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                    {[sel.brand, sel.model].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: selStat.dot }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0" }}>{selStat.label}</span>
                  </div>
                  <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0" }}>{selCond.label}</span>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Quantité", value: sel.quantity },
                    { label: "Emprunts", value: sel.loanCount },
                  ].map(f => (
                    <div key={f.label} style={{ padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.05)" }}>
                      <p style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{f.value}</p>
                      <p style={{ fontSize: 11, color: "#475569", marginTop: 5 }}>{f.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={{ borderRadius: 14, background: "#fff", padding: 18, flexShrink: 0,
              border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 14 }}>Informations</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[
                  { k: "Catégorie",    v: CAT[sel.category] },
                  { k: "Localisation", v: sel.location ?? "—" },
                  { k: "Référence",    v: sel.reference ?? "—" },
                  { k: "Empruntable",  v: sel.loanable ? "Oui" : "Non" },
                ].map(f => (
                  <div key={f.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{f.k}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{f.v}</span>
                  </div>
                ))}
              </div>
              {sel.description && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f8fafc" }}>
                  <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{sel.description}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flexShrink: 0 }}>
              <button onClick={openEdit} style={{
                padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "#0f172a", color: "#fff", border: "none", cursor: "pointer",
              }}>Modifier</button>
              <button onClick={handleMaintenance} style={{
                padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: sel?.status === "MAINTENANCE" ? "#dcfce7" : "#fff1f2",
                color: sel?.status === "MAINTENANCE" ? "#166534" : "#C03050",
                border: `1px solid ${sel?.status === "MAINTENANCE" ? "#bbf7d0" : "#fecdd3"}`,
                cursor: "pointer",
              }}>
                {sel?.status === "MAINTENANCE" ? "Remettre dispo" : "Maintenance"}
              </button>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 16, border: "1.5px dashed #e2e8f0",
          }}>
            <p style={{ fontSize: 13, color: "#cbd5e1" }}>Sélectionnez un équipement</p>
          </div>
        )}
      </div>
    </div>

    {/* ══ MODAL MODIFIER ══ */}
    {editModal && selected && (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
        zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }} onClick={e => { if (e.target === e.currentTarget) setEditModal(false); }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 520,
          boxShadow: "0 24px 64px rgba(15,23,42,0.25)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>
                Modifier le matériel
              </h2>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{selected.name}</p>
            </div>
            <button onClick={() => setEditModal(false)} style={{
              background: "#f1f5f9", border: "none", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b",
            }}>✕</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Nom *</label>
              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                  border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Marque</label>
                <input value={editForm.brand} onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Modèle</label>
                <input value={editForm.model} onChange={e => setEditForm(f => ({ ...f, model: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Catégorie</label>
                <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", background: "#fff",
                    cursor: "pointer", boxSizing: "border-box" }}>
                  {Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>État</label>
                <select value={editForm.condition} onChange={e => setEditForm(f => ({ ...f, condition: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", background: "#fff",
                    cursor: "pointer", boxSizing: "border-box" }}>
                  {Object.entries(COND).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Quantité</label>
                <input type="number" min="1" value={editForm.quantity}
                  onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Localisation</label>
                <input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setEditModal(false)} style={{
                flex: 1, padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", cursor: "pointer",
              }}>Annuler</button>
              <button onClick={handleEdit} disabled={!editForm.name.trim() || submitting} style={{
                flex: 2, padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: !editForm.name.trim() || submitting ? "#e2e8f0" : "#0f172a",
                color: !editForm.name.trim() || submitting ? "#94a3b8" : "#fff",
                border: "none", cursor: !editForm.name.trim() || submitting ? "default" : "pointer",
              }}>
                {submitting ? "Sauvegarde..." : "Enregistrer les modifications"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ══ MODAL AJOUT ══ */}

    {showModal && (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
        zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 520,
          boxShadow: "0 24px 64px rgba(15,23,42,0.25)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>
                Nouveau matériel
              </h2>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                La photo sera trouvée automatiquement
              </p>
            </div>
            <button onClick={() => setShowModal(false)} style={{
              background: "#f1f5f9", border: "none", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b",
            }}>✕</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Nom */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Nom *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex : Niryo Ned2, Arduino UNO..." autoFocus
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                  border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* Marque */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Marque</label>
                <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="Ex : Niryo, Arduino..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
              </div>
              {/* Modèle */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Modèle</label>
                <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  placeholder="Ex : Ned2, UNO R3..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* Catégorie */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Catégorie</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", background: "#fff",
                    cursor: "pointer", boxSizing: "border-box" }}>
                  {Object.entries(CAT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {/* Quantité */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Quantité</label>
                <input type="number" min="1" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* ID interne */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>ID interne</label>
                <input value={form.internalId} onChange={e => setForm(f => ({ ...f, internalId: e.target.value }))}
                  placeholder="Ex : MAT-042"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
              </div>
              {/* Localisation */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Localisation</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Ex : Salle B204"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                    border: "1px solid #e2e8f0", outline: "none", color: "#0f172a", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", cursor: "pointer",
              }}>Annuler</button>
              <button onClick={handleAdd} disabled={!form.name.trim() || submitting} style={{
                flex: 2, padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: !form.name.trim() || submitting ? "#e2e8f0" : "#0f172a",
                color: !form.name.trim() || submitting ? "#94a3b8" : "#fff",
                border: "none", cursor: !form.name.trim() || submitting ? "default" : "pointer",
              }}>
                {submitting ? "Ajout en cours..." : "Ajouter + recherche photo auto"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
