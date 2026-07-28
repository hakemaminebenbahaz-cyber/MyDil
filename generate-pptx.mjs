import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";

const C = {
  dark:   "#0f172a",
  navy:   "#2D3A8C",
  blue:   "#4BAFD6",
  yellow: "#E8C030",
  red:    "#C03050",
  white:  "#FFFFFF",
  gray:   "#94a3b8",
  light:  "#f8fafc",
  muted:  "#475569",
};

function addBar(slide) {
  const colors = [C.yellow, C.navy, C.blue, C.red];
  colors.forEach((color, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: i * (33.33 / 10), y: 0, w: 33.33 / 10, h: 0.08,
      fill: { color: color.replace("#","") },
      line: { color: color.replace("#",""), width: 0 },
    });
  });
}

function darkBg(slide) {
  slide.background = { color: C.dark.replace("#","") };
}

// ─── SLIDE 1 · TITRE ───────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  darkBg(s);
  addBar(s);

  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.08, w: "100%", h: "100%",
    fill: { color: C.dark.replace("#","") },
    line: { color: C.dark.replace("#",""), width: 0 },
  });

  s.addText("myDiL", {
    x: 1.2, y: 1.6, w: 8, h: 1.6,
    fontSize: 72, bold: true, color: C.white.replace("#",""),
    fontFace: "Segoe UI",
  });

  s.addText("Système de gestion du FabLab", {
    x: 1.2, y: 3.1, w: 8, h: 0.6,
    fontSize: 22, color: C.blue.replace("#",""),
    fontFace: "Segoe UI",
  });

  s.addText("Présentation de stage · 2026", {
    x: 1.2, y: 3.85, w: 8, h: 0.4,
    fontSize: 14, color: C.gray.replace("#",""),
    fontFace: "Segoe UI",
  });

  // Decorative dots
  [C.yellow, C.blue, C.red, C.navy].forEach((c, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: 10.5, y: 1.5 + i * 0.8, w: 0.18, h: 0.18,
      fill: { color: c.replace("#","") },
      line: { color: c.replace("#",""), width: 0 },
    });
  });
}

// ─── SLIDE 2 · PROBLÉMATIQUE ───────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.light.replace("#","") };
  addBar(s);

  s.addText("Le problème", {
    x: 0.6, y: 0.4, w: 10, h: 0.5,
    fontSize: 11, bold: true, color: C.gray.replace("#",""),
    fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Avant myDiL, le DiL n'avait pas d'outil dédié", {
    x: 0.6, y: 0.85, w: 11, h: 0.8,
    fontSize: 28, bold: true, color: C.dark.replace("#",""),
    fontFace: "Segoe UI",
  });

  const problems = [
    { icon: "📋", title: "Inventaire manuel", desc: "Tableaux Excel non synchronisés, pertes de matériel" },
    { icon: "📬", title: "Emprunts par mail", desc: "Aucun suivi, retards fréquents, conflits" },
    { icon: "🗂️", title: "Projets éparpillés", desc: "Pas de centralisation des projets étudiants" },
    { icon: "🔍", title: "Recherche impossible", desc: "Impossible de savoir ce qui est disponible en temps réel" },
  ];

  problems.forEach((p, i) => {
    const x = 0.6 + (i % 2) * 5.8;
    const y = 2.0 + Math.floor(i / 2) * 1.6;
    s.addShape(pptx.ShapeType.rect, {
      x, y, w: 5.3, h: 1.35, r: 10,
      fill: { color: "FFFFFF" },
      line: { color: "e2e8f0", width: 1 },
      shadow: { type: "outer", blur: 8, offset: 2, angle: 90, color: "00000010" },
    });
    s.addText(p.icon, { x: x + 0.2, y: y + 0.25, w: 0.6, h: 0.6, fontSize: 22 });
    s.addText(p.title, {
      x: x + 0.85, y: y + 0.2, w: 4.2, h: 0.4,
      fontSize: 14, bold: true, color: C.dark.replace("#",""), fontFace: "Segoe UI",
    });
    s.addText(p.desc, {
      x: x + 0.85, y: y + 0.6, w: 4.2, h: 0.55,
      fontSize: 11, color: C.muted.replace("#",""), fontFace: "Segoe UI",
    });
  });
}

// ─── SLIDE 3 · QU'EST-CE QUE myDiL ────────────────────────────────────────
{
  const s = pptx.addSlide();
  darkBg(s);
  addBar(s);

  s.addText("La solution", {
    x: 0.6, y: 0.4, w: 10, h: 0.5,
    fontSize: 11, bold: true, color: C.blue.replace("#",""),
    fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("myDiL — une plateforme web complète", {
    x: 0.6, y: 0.85, w: 11, h: 0.8,
    fontSize: 26, bold: true, color: C.white.replace("#",""),
    fontFace: "Segoe UI",
  });

  s.addText(
    "myDiL centralise toute la gestion du laboratoire DiL : inventaire du matériel, " +
    "système d'emprunts, suivi des projets et recommandations par intelligence artificielle.",
    {
      x: 0.6, y: 1.7, w: 11, h: 0.8,
      fontSize: 14, color: C.gray.replace("#",""), fontFace: "Segoe UI",
    }
  );

  const modules = [
    { label: "Inventaire", color: C.blue },
    { label: "Emprunts",   color: C.yellow },
    { label: "Projets",    color: C.red },
    { label: "Ask Hanen IA", color: C.navy },
  ];

  modules.forEach((m, i) => {
    const x = 0.6 + i * 2.9;
    s.addShape(pptx.ShapeType.rect, {
      x, y: 2.85, w: 2.55, h: 1.5, r: 12,
      fill: { color: "FFFFFF10" },
      line: { color: m.color.replace("#",""), width: 1.5 },
    });
    s.addText(m.label, {
      x, y: 3.25, w: 2.55, h: 0.7,
      fontSize: 15, bold: true, color: m.color.replace("#",""),
      fontFace: "Segoe UI", align: "center",
    });
  });

  s.addText("2 rôles : Admin (enseignants) · Étudiant", {
    x: 0.6, y: 4.65, w: 11, h: 0.45,
    fontSize: 13, color: C.gray.replace("#",""), fontFace: "Segoe UI", italic: true,
  });
}

// ─── SLIDE 4 · INVENTAIRE ─────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.light.replace("#","") };
  addBar(s);

  s.addText("Module 1 · Inventaire", {
    x: 0.6, y: 0.4, w: 10, h: 0.5,
    fontSize: 11, bold: true, color: C.blue.replace("#",""),
    fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Gestion complète du matériel", {
    x: 0.6, y: 0.85, w: 10, h: 0.7,
    fontSize: 26, bold: true, color: C.dark.replace("#",""), fontFace: "Segoe UI",
  });

  const features = [
    "12 catégories de matériel (IoT, Robotique, VR/AR, Impression 3D...)",
    "Statuts en temps réel : Disponible · En prêt · Maintenance",
    "Recherche et filtres instantanés",
    "Photo automatique via recherche web au moment de l'ajout",
    "Vue admin (CRUD complet) + Vue étudiant (consultation)",
  ];

  features.forEach((f, i) => {
    s.addShape(pptx.ShapeType.rect, {
      x: 0.55, y: 1.85 + i * 0.72, w: 0.22, h: 0.22, r: 99,
      fill: { color: C.blue.replace("#","") },
      line: { color: C.blue.replace("#",""), width: 0 },
    });
    s.addText(f, {
      x: 1.0, y: 1.8 + i * 0.72, w: 10.5, h: 0.5,
      fontSize: 13, color: C.dark.replace("#",""), fontFace: "Segoe UI",
    });
  });

  // Highlight box
  s.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 5.1, w: 11.5, h: 0.65, r: 8,
    fill: { color: "dbeafe" },
    line: { color: C.blue.replace("#",""), width: 1 },
  });
  s.addText("Nouveauté : La photo du matériel est trouvée automatiquement via DuckDuckGo lors de l'ajout — aucune intervention manuelle requise.", {
    x: 0.75, y: 5.15, w: 11, h: 0.55,
    fontSize: 11, color: C.navy.replace("#",""), fontFace: "Segoe UI", bold: true,
  });
}

// ─── SLIDE 5 · EMPRUNTS ───────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  darkBg(s);
  addBar(s);

  s.addText("Module 2 · Emprunts", {
    x: 0.6, y: 0.4, w: 10, h: 0.5,
    fontSize: 11, bold: true, color: C.yellow.replace("#",""),
    fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Workflow d'emprunt complet", {
    x: 0.6, y: 0.85, w: 10, h: 0.7,
    fontSize: 26, bold: true, color: C.white.replace("#",""), fontFace: "Segoe UI",
  });

  const steps = [
    { n: "1", label: "L'étudiant choisit le matériel", color: C.blue },
    { n: "2", label: "Il soumet une demande d'emprunt", color: C.yellow },
    { n: "3", label: "L'admin approuve ou refuse", color: C.red },
    { n: "4", label: "Retour enregistré + statut mis à jour", color: C.navy.replace("#","2D3A8C") },
  ];

  steps.forEach((st, i) => {
    const x = 0.6 + i * 2.95;
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.85, y: 2.0, w: 0.7, h: 0.7,
      fill: { color: st.color.replace("#","") },
      line: { color: st.color.replace("#",""), width: 0 },
    });
    s.addText(st.n, {
      x: x + 0.85, y: 2.0, w: 0.7, h: 0.7,
      fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle",
      fontFace: "Segoe UI",
    });
    s.addText(st.label, {
      x, y: 2.85, w: 2.6, h: 0.7,
      fontSize: 11, color: C.gray.replace("#",""), align: "center", fontFace: "Segoe UI",
    });
  });

  const statuses = [
    { label: "EN ATTENTE", color: C.yellow },
    { label: "APPROUVÉ", color: "#22c55e" },
    { label: "REFUSÉ", color: C.red },
    { label: "RENDU", color: C.blue },
    { label: "EN RETARD", color: "#f97316" },
  ];

  s.addText("Statuts gérés :", {
    x: 0.6, y: 4.0, w: 3, h: 0.4,
    fontSize: 12, color: C.gray.replace("#",""), fontFace: "Segoe UI",
  });

  statuses.forEach((st, i) => {
    s.addShape(pptx.ShapeType.rect, {
      x: 0.6 + i * 2.3, y: 4.45, w: 2.1, h: 0.42, r: 99,
      fill: { color: st.color.replace("#","") + "30" },
      line: { color: st.color.replace("#",""), width: 1 },
    });
    s.addText(st.label, {
      x: 0.6 + i * 2.3, y: 4.45, w: 2.1, h: 0.42,
      fontSize: 10, bold: true, color: st.color.replace("#",""),
      align: "center", valign: "middle", fontFace: "Segoe UI",
    });
  });
}

// ─── SLIDE 6 · ASK HANEN ──────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.light.replace("#","") };
  addBar(s);

  s.addText("Module 3 · Intelligence Artificielle", {
    x: 0.6, y: 0.4, w: 11, h: 0.5,
    fontSize: 11, bold: true, color: C.navy.replace("#",""),
    fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Ask Hanen — Recommandation par IA", {
    x: 0.6, y: 0.85, w: 11, h: 0.7,
    fontSize: 26, bold: true, color: C.dark.replace("#",""), fontFace: "Segoe UI",
  });

  s.addText(
    "L'étudiant décrit son projet en langage naturel. L'IA analyse sa description " +
    "et recommande les équipements disponibles dans l'inventaire les plus adaptés.",
    {
      x: 0.6, y: 1.65, w: 11, h: 0.7,
      fontSize: 13, color: C.muted.replace("#",""), fontFace: "Segoe UI",
    }
  );

  // Example
  s.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 2.55, w: 11.5, h: 1.0, r: 10,
    fill: { color: C.dark.replace("#","") },
    line: { color: C.dark.replace("#",""), width: 0 },
  });
  s.addText("Exemple : « Je veux créer un robot qui suit une ligne et détecte des obstacles »", {
    x: 0.8, y: 2.7, w: 11, h: 0.6,
    fontSize: 13, color: C.white.replace("#",""), italic: true, fontFace: "Segoe UI",
  });

  s.addText("→  L'IA recommande :", {
    x: 0.6, y: 3.75, w: 4, h: 0.4,
    fontSize: 13, bold: true, color: C.dark.replace("#",""), fontFace: "Segoe UI",
  });

  const recs = ["Niryo Ned2 (Robotique)", "Capteur ultrason HC-SR04 (IoT)", "Arduino UNO (Composants)"];
  recs.forEach((r, i) => {
    s.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 4.25 + i * 0.52, w: 5.5, h: 0.42, r: 8,
      fill: { color: "dcfce7" },
      line: { color: "22c55e", width: 1 },
    });
    s.addText("✓  " + r, {
      x: 0.7, y: 4.25 + i * 0.52, w: 5.2, h: 0.42,
      fontSize: 12, color: "166534", fontFace: "Segoe UI",
    });
  });

  s.addShape(pptx.ShapeType.rect, {
    x: 6.5, y: 3.65, w: 5.3, h: 2.1, r: 10,
    fill: { color: "f0f9ff" },
    line: { color: C.blue.replace("#",""), width: 1 },
  });
  s.addText("Propulsé par :", {
    x: 6.7, y: 3.8, w: 4.8, h: 0.4,
    fontSize: 11, color: C.muted.replace("#",""), fontFace: "Segoe UI",
  });
  ["Groq LLaMA (recommandations rapides)", "Claude AI — Anthropic", "Google Generative AI"].forEach((t, i) => {
    s.addText("• " + t, {
      x: 6.7, y: 4.25 + i * 0.45, w: 4.8, h: 0.4,
      fontSize: 12, color: C.navy.replace("#",""), fontFace: "Segoe UI",
    });
  });
}

// ─── SLIDE 7 · PROJETS ────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  darkBg(s);
  addBar(s);

  s.addText("Module 4 · Projets", {
    x: 0.6, y: 0.4, w: 10, h: 0.5,
    fontSize: 11, bold: true, color: C.red.replace("#",""),
    fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Vitrine des projets DiL", {
    x: 0.6, y: 0.85, w: 10, h: 0.7,
    fontSize: 26, bold: true, color: C.white.replace("#",""), fontFace: "Segoe UI",
  });

  const items = [
    { icon: "📁", t: "3 types de projets", d: "Workshop · Open Innovation · Académique" },
    { icon: "🎥", t: "Médias riches", d: "Vidéos de démo, archives ZIP, lien GitHub" },
    { icon: "✦", t: "Suggestions IA", d: "L'IA propose des technologies et mots-clés adaptés" },
    { icon: "📊", t: "Statuts éditoriaux", d: "Brouillon · En attente · Publié" },
  ];

  items.forEach((item, i) => {
    const x = 0.6 + (i % 2) * 5.9;
    const y = 2.0 + Math.floor(i / 2) * 1.55;
    s.addShape(pptx.ShapeType.rect, {
      x, y, w: 5.4, h: 1.35, r: 10,
      fill: { color: "FFFFFF08" },
      line: { color: "FFFFFF15", width: 1 },
    });
    s.addText(item.icon, { x: x + 0.2, y: y + 0.25, w: 0.6, h: 0.6, fontSize: 22 });
    s.addText(item.t, {
      x: x + 0.9, y: y + 0.2, w: 4.3, h: 0.4,
      fontSize: 14, bold: true, color: C.white.replace("#",""), fontFace: "Segoe UI",
    });
    s.addText(item.d, {
      x: x + 0.9, y: y + 0.62, w: 4.3, h: 0.5,
      fontSize: 11, color: C.gray.replace("#",""), fontFace: "Segoe UI",
    });
  });
}

// ─── SLIDE 8 · STACK TECHNIQUE ────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.light.replace("#","") };
  addBar(s);

  s.addText("Architecture technique", {
    x: 0.6, y: 0.4, w: 10, h: 0.5,
    fontSize: 11, bold: true, color: C.gray.replace("#",""),
    fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Stack moderne & robuste", {
    x: 0.6, y: 0.85, w: 10, h: 0.7,
    fontSize: 26, bold: true, color: C.dark.replace("#",""), fontFace: "Segoe UI",
  });

  const tech = [
    { cat: "Frontend", items: ["Next.js 16 (App Router)", "React 19", "TypeScript 5", "Tailwind CSS 4"] },
    { cat: "Backend", items: ["Next.js API Routes", "Prisma ORM 6", "PostgreSQL (Supabase)", "NextAuth.js 5"] },
    { cat: "IA & Cloud", items: ["Groq LLaMA", "Claude API (Anthropic)", "Google Generative AI", "DuckDuckGo Search"] },
  ];

  tech.forEach((col, i) => {
    const x = 0.5 + i * 3.95;
    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.85, w: 3.7, h: 3.5, r: 12,
      fill: { color: "FFFFFF" },
      line: { color: "e2e8f0", width: 1 },
      shadow: { type: "outer", blur: 8, offset: 2, angle: 90, color: "00000008" },
    });
    s.addText(col.cat, {
      x: x + 0.25, y: 2.0, w: 3.2, h: 0.45,
      fontSize: 13, bold: true, color: C.dark.replace("#",""), fontFace: "Segoe UI",
    });
    col.items.forEach((item, j) => {
      s.addText("· " + item, {
        x: x + 0.25, y: 2.6 + j * 0.55, w: 3.2, h: 0.45,
        fontSize: 12, color: C.muted.replace("#",""), fontFace: "Segoe UI",
      });
    });
  });
}

// ─── SLIDE 9 · MERCI ──────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  darkBg(s);
  addBar(s);

  s.addText("Merci", {
    x: 1.2, y: 1.5, w: 10, h: 1.6,
    fontSize: 72, bold: true, color: C.white.replace("#",""), fontFace: "Segoe UI",
  });
  s.addText("Des questions ?", {
    x: 1.2, y: 3.1, w: 10, h: 0.6,
    fontSize: 24, color: C.blue.replace("#",""), fontFace: "Segoe UI",
  });

  [C.yellow, C.blue, C.red, C.navy].forEach((c, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: 10.5, y: 1.5 + i * 0.8, w: 0.18, h: 0.18,
      fill: { color: c.replace("#","") },
      line: { color: c.replace("#",""), width: 0 },
    });
  });
}

// ─── EXPORT ───────────────────────────────────────────────────────────────
await pptx.writeFile({ fileName: "myDiL_Presentation_Stage.pptx" });
console.log("✓ myDiL_Presentation_Stage.pptx généré !");
