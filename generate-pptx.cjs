const PptxGenJS = require("./node_modules/pptxgenjs/dist/pptxgen.cjs.js");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";

const C = {
  dark:   "0f172a",
  navy:   "2D3A8C",
  blue:   "4BAFD6",
  yellow: "E8C030",
  red:    "C03050",
  white:  "FFFFFF",
  gray:   "94a3b8",
  light:  "f8fafc",
  muted:  "475569",
};

function addBar(slide) {
  ["E8C030","2D3A8C","4BAFD6","C03050"].forEach((color, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: i * (33.33 / 40), y: 0, w: 33.33 / 40, h: 0.08,
      fill: { color }, line: { color, width: 0 },
    });
  });
}

// ─── SLIDE 1 · TITRE ───────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.dark };
  addBar(s);

  s.addText("myDiL", {
    x: 1.2, y: 1.5, w: 9, h: 1.6,
    fontSize: 72, bold: true, color: C.white, fontFace: "Segoe UI",
  });
  s.addText("Système de gestion du FabLab DiL", {
    x: 1.2, y: 3.1, w: 9, h: 0.6,
    fontSize: 22, color: C.blue, fontFace: "Segoe UI",
  });
  s.addText("Présentation de stage · 2026", {
    x: 1.2, y: 3.85, w: 9, h: 0.4,
    fontSize: 14, color: C.gray, fontFace: "Segoe UI",
  });
  [C.yellow, C.blue, C.red, C.navy].forEach((c, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: 10.8, y: 1.5 + i * 0.85, w: 0.22, h: 0.22,
      fill: { color: c }, line: { color: c, width: 0 },
    });
  });
}

// ─── SLIDE 2 · PROBLÉMATIQUE ───────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.light };
  addBar(s);

  s.addText("LE PROBLÈME", {
    x: 0.6, y: 0.4, w: 10, h: 0.45,
    fontSize: 10, bold: true, color: C.gray, fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Avant myDiL, le DiL n'avait pas d'outil dédié", {
    x: 0.6, y: 0.85, w: 11, h: 0.75,
    fontSize: 26, bold: true, color: C.dark, fontFace: "Segoe UI",
  });

  const problems = [
    { icon: "📋", title: "Inventaire manuel", desc: "Tableaux Excel non synchronisés,\npertes de matériel fréquentes" },
    { icon: "📬", title: "Emprunts par mail", desc: "Aucun suivi, retards,\nconflits entre étudiants" },
    { icon: "🗂️", title: "Projets éparpillés", desc: "Pas de centralisation\ndes projets étudiants" },
    { icon: "🔍", title: "Aucune visibilité", desc: "Impossible de savoir ce qui\nest disponible en temps réel" },
  ];

  problems.forEach((p, i) => {
    const x = 0.5 + (i % 2) * 5.95;
    const y = 2.0 + Math.floor(i / 2) * 1.7;
    s.addShape(pptx.ShapeType.rect, {
      x, y, w: 5.6, h: 1.45, r: 10,
      fill: { color: "FFFFFF" }, line: { color: "e2e8f0", width: 1 },
    });
    s.addText(p.icon, { x: x + 0.2, y: y + 0.3, w: 0.65, h: 0.65, fontSize: 24 });
    s.addText(p.title, {
      x: x + 0.95, y: y + 0.2, w: 4.4, h: 0.4,
      fontSize: 14, bold: true, color: C.dark, fontFace: "Segoe UI",
    });
    s.addText(p.desc, {
      x: x + 0.95, y: y + 0.62, w: 4.4, h: 0.65,
      fontSize: 11, color: C.muted, fontFace: "Segoe UI",
    });
  });
}

// ─── SLIDE 3 · QU'EST-CE QUE myDiL ────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.dark };
  addBar(s);

  s.addText("LA SOLUTION", {
    x: 0.6, y: 0.4, w: 10, h: 0.45,
    fontSize: 10, bold: true, color: C.blue, fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("myDiL — une plateforme web complète", {
    x: 0.6, y: 0.85, w: 11, h: 0.75,
    fontSize: 26, bold: true, color: C.white, fontFace: "Segoe UI",
  });
  s.addText("Centralise la gestion du laboratoire : inventaire, emprunts, projets et IA en un seul endroit.", {
    x: 0.6, y: 1.7, w: 11, h: 0.6,
    fontSize: 14, color: C.gray, fontFace: "Segoe UI",
  });

  const modules = [
    { label: "📦  Inventaire", color: C.blue },
    { label: "🔄  Emprunts",   color: C.yellow },
    { label: "📁  Projets",    color: C.red },
    { label: "✦  Ask Hanen IA", color: C.navy },
  ];
  modules.forEach((m, i) => {
    const x = 0.5 + i * 3.1;
    s.addShape(pptx.ShapeType.rect, {
      x, y: 2.65, w: 2.85, h: 1.5, r: 12,
      fill: { color: "1e293b" }, line: { color: m.color, width: 1.5 },
    });
    s.addText(m.label, {
      x, y: 3.15, w: 2.85, h: 0.5,
      fontSize: 14, bold: true, color: m.color,
      fontFace: "Segoe UI", align: "center",
    });
  });

  s.addText("2 rôles : Admin (enseignants / responsables)   ·   Étudiant", {
    x: 0.6, y: 4.45, w: 11, h: 0.4,
    fontSize: 13, color: C.gray, fontFace: "Segoe UI", italic: true,
  });
}

// ─── SLIDE 4 · INVENTAIRE ─────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.light };
  addBar(s);

  s.addText("MODULE 1", {
    x: 0.6, y: 0.4, w: 10, h: 0.45,
    fontSize: 10, bold: true, color: C.blue, fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Inventaire intelligent du matériel", {
    x: 0.6, y: 0.85, w: 11, h: 0.7,
    fontSize: 26, bold: true, color: C.dark, fontFace: "Segoe UI",
  });

  const features = [
    "12 catégories de matériel : IoT, Robotique, VR/AR, Impression 3D, Réseau...",
    "Statuts en temps réel : Disponible · En prêt · Maintenance",
    "Recherche instantanée par nom, marque ou ID",
    "Photo trouvée automatiquement via DuckDuckGo lors de l'ajout",
    "Vue Admin (CRUD complet)  +  Vue Étudiant (consultation et emprunt)",
  ];
  features.forEach((f, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: 0.55, y: 1.95 + i * 0.68, w: 0.2, h: 0.2,
      fill: { color: C.blue }, line: { color: C.blue, width: 0 },
    });
    s.addText(f, {
      x: 0.95, y: 1.88 + i * 0.68, w: 10.8, h: 0.5,
      fontSize: 13, color: C.dark, fontFace: "Segoe UI",
    });
  });

  s.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 5.15, w: 11.5, h: 0.6, r: 8,
    fill: { color: "dbeafe" }, line: { color: C.blue, width: 1 },
  });
  s.addText("Nouveauté : photo automatique à l'ajout — aucune intervention manuelle, la recherche se fait en arrière-plan.", {
    x: 0.75, y: 5.2, w: 11, h: 0.5,
    fontSize: 11, color: "1e40af", fontFace: "Segoe UI", bold: true,
  });
}

// ─── SLIDE 5 · EMPRUNTS ───────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.dark };
  addBar(s);

  s.addText("MODULE 2", {
    x: 0.6, y: 0.4, w: 10, h: 0.45,
    fontSize: 10, bold: true, color: C.yellow, fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Système d'emprunts avec workflow d'approbation", {
    x: 0.6, y: 0.85, w: 11, h: 0.7,
    fontSize: 24, bold: true, color: C.white, fontFace: "Segoe UI",
  });

  const steps = [
    { n: "1", label: "Étudiant choisit\nle matériel", color: C.blue },
    { n: "2", label: "Soumet une\ndemande", color: C.yellow },
    { n: "3", label: "Admin approuve\nou refuse", color: C.red },
    { n: "4", label: "Retour enregistré\n+ statut mis à jour", color: "22c55e" },
  ];
  steps.forEach((st, i) => {
    const x = 0.8 + i * 3.05;
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.85, y: 2.0, w: 0.75, h: 0.75,
      fill: { color: st.color }, line: { color: st.color, width: 0 },
    });
    s.addText(st.n, {
      x: x + 0.85, y: 2.0, w: 0.75, h: 0.75,
      fontSize: 18, bold: true, color: C.white, align: "center", valign: "middle",
      fontFace: "Segoe UI",
    });
    s.addText(st.label, {
      x, y: 2.9, w: 2.7, h: 0.7,
      fontSize: 11, color: C.gray, align: "center", fontFace: "Segoe UI",
    });
  });

  const statuses = [
    { label: "EN ATTENTE", color: C.yellow, bg: "fef3c7" },
    { label: "APPROUVÉ",   color: "22c55e",  bg: "dcfce7" },
    { label: "REFUSÉ",     color: C.red,     bg: "ffe4e6" },
    { label: "RENDU",      color: C.blue,    bg: "e0f2fe" },
    { label: "EN RETARD",  color: "f97316",  bg: "ffedd5" },
  ];
  s.addText("5 statuts gérés :", {
    x: 0.6, y: 3.9, w: 4, h: 0.4,
    fontSize: 12, color: C.gray, fontFace: "Segoe UI",
  });
  statuses.forEach((st, i) => {
    s.addShape(pptx.ShapeType.rect, {
      x: 0.6 + i * 2.35, y: 4.4, w: 2.1, h: 0.45, r: 99,
      fill: { color: st.bg }, line: { color: st.color, width: 1 },
    });
    s.addText(st.label, {
      x: 0.6 + i * 2.35, y: 4.4, w: 2.1, h: 0.45,
      fontSize: 10, bold: true, color: st.color,
      align: "center", valign: "middle", fontFace: "Segoe UI",
    });
  });
}

// ─── SLIDE 6 · ASK HANEN ──────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.light };
  addBar(s);

  s.addText("MODULE 3", {
    x: 0.6, y: 0.4, w: 11, h: 0.45,
    fontSize: 10, bold: true, color: C.navy, fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Ask Hanen — Assistant IA pour les étudiants", {
    x: 0.6, y: 0.85, w: 11, h: 0.7,
    fontSize: 24, bold: true, color: C.dark, fontFace: "Segoe UI",
  });
  s.addText("L'étudiant décrit son projet en langage naturel. L'IA recommande les équipements disponibles les plus adaptés.", {
    x: 0.6, y: 1.65, w: 11, h: 0.6,
    fontSize: 13, color: C.muted, fontFace: "Segoe UI",
  });

  s.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 2.45, w: 11.5, h: 0.85, r: 10,
    fill: { color: C.dark }, line: { color: C.dark, width: 0 },
  });
  s.addText("« Je veux créer un robot qui suit une ligne et détecte des obstacles »", {
    x: 0.8, y: 2.6, w: 11, h: 0.55,
    fontSize: 13, color: C.white, italic: true, fontFace: "Segoe UI",
  });

  s.addText("L'IA recommande :", {
    x: 0.6, y: 3.5, w: 5, h: 0.4,
    fontSize: 13, bold: true, color: C.dark, fontFace: "Segoe UI",
  });
  ["Niryo Ned2 — Robotique", "Capteur ultrason HC-SR04 — IoT", "Arduino UNO — Composants"].forEach((r, i) => {
    s.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 4.0 + i * 0.52, w: 5.8, h: 0.42, r: 8,
      fill: { color: "dcfce7" }, line: { color: "22c55e", width: 1 },
    });
    s.addText("✓  " + r, {
      x: 0.75, y: 4.0 + i * 0.52, w: 5.4, h: 0.42,
      fontSize: 12, color: "166534", fontFace: "Segoe UI",
    });
  });

  s.addShape(pptx.ShapeType.rect, {
    x: 7.0, y: 3.45, w: 5.0, h: 2.3, r: 12,
    fill: { color: "f0f9ff" }, line: { color: C.blue, width: 1 },
  });
  s.addText("Moteurs IA utilisés", {
    x: 7.2, y: 3.6, w: 4.5, h: 0.4,
    fontSize: 11, bold: true, color: C.muted, fontFace: "Segoe UI",
  });
  ["Groq LLaMA (recommandations rapides)", "Claude AI — Anthropic", "Google Generative AI"].forEach((t, i) => {
    s.addText("• " + t, {
      x: 7.2, y: 4.1 + i * 0.5, w: 4.5, h: 0.4,
      fontSize: 12, color: C.navy, fontFace: "Segoe UI",
    });
  });
}

// ─── SLIDE 7 · PROJETS ────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.dark };
  addBar(s);

  s.addText("MODULE 4", {
    x: 0.6, y: 0.4, w: 10, h: 0.45,
    fontSize: 10, bold: true, color: C.red, fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Vitrine des projets DiL", {
    x: 0.6, y: 0.85, w: 10, h: 0.7,
    fontSize: 26, bold: true, color: C.white, fontFace: "Segoe UI",
  });

  const items = [
    { icon: "📁", t: "3 types de projets", d: "Workshop · Open Innovation · Académique" },
    { icon: "🎥", t: "Médias riches", d: "Vidéos, archives ZIP, lien GitHub" },
    { icon: "✦", t: "Suggestions IA", d: "L'IA propose technologies et mots-clés" },
    { icon: "📊", t: "Workflow éditorial", d: "Brouillon → En attente → Publié" },
  ];
  items.forEach((item, i) => {
    const x = 0.5 + (i % 2) * 6.1;
    const y = 2.0 + Math.floor(i / 2) * 1.65;
    s.addShape(pptx.ShapeType.rect, {
      x, y, w: 5.7, h: 1.4, r: 10,
      fill: { color: "1a2744" }, line: { color: "243058", width: 1 },
    });
    s.addText(item.icon, { x: x + 0.2, y: y + 0.28, w: 0.65, h: 0.65, fontSize: 24 });
    s.addText(item.t, {
      x: x + 0.95, y: y + 0.2, w: 4.5, h: 0.4,
      fontSize: 14, bold: true, color: C.white, fontFace: "Segoe UI",
    });
    s.addText(item.d, {
      x: x + 0.95, y: y + 0.63, w: 4.5, h: 0.5,
      fontSize: 11, color: C.gray, fontFace: "Segoe UI",
    });
  });
}

// ─── SLIDE 8 · STACK TECHNIQUE ────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.light };
  addBar(s);

  s.addText("ARCHITECTURE", {
    x: 0.6, y: 0.4, w: 10, h: 0.45,
    fontSize: 10, bold: true, color: C.gray, fontFace: "Segoe UI", charSpacing: 3,
  });
  s.addText("Stack technique moderne", {
    x: 0.6, y: 0.85, w: 10, h: 0.7,
    fontSize: 26, bold: true, color: C.dark, fontFace: "Segoe UI",
  });

  const cols = [
    { cat: "Frontend",   color: C.blue,   items: ["Next.js 16 (App Router)", "React 19", "TypeScript 5", "Tailwind CSS 4"] },
    { cat: "Backend",    color: C.navy,   items: ["Next.js API Routes", "Prisma ORM 6", "PostgreSQL · Supabase", "NextAuth.js 5"] },
    { cat: "IA & Cloud", color: C.yellow, items: ["Groq LLaMA", "Claude API · Anthropic", "Google Generative AI", "DuckDuckGo Search"] },
  ];
  cols.forEach((col, i) => {
    const x = 0.5 + i * 4.0;
    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.8, w: 3.7, h: 3.6, r: 12,
      fill: { color: "FFFFFF" }, line: { color: "e2e8f0", width: 1 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.8, w: 3.7, h: 0.55, r: 12,
      fill: { color: col.color }, line: { color: col.color, width: 0 },
    });
    s.addText(col.cat, {
      x: x + 0.2, y: 1.88, w: 3.3, h: 0.38,
      fontSize: 13, bold: true, color: C.white, fontFace: "Segoe UI",
    });
    col.items.forEach((item, j) => {
      s.addText("· " + item, {
        x: x + 0.25, y: 2.55 + j * 0.62, w: 3.25, h: 0.5,
        fontSize: 12, color: C.muted, fontFace: "Segoe UI",
      });
    });
  });
}

// ─── SLIDE 9 · MERCI ──────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.background = { color: C.dark };
  addBar(s);

  s.addText("Merci", {
    x: 1.2, y: 1.4, w: 10, h: 1.7,
    fontSize: 72, bold: true, color: C.white, fontFace: "Segoe UI",
  });
  s.addText("Des questions ?", {
    x: 1.2, y: 3.1, w: 10, h: 0.65,
    fontSize: 26, color: C.blue, fontFace: "Segoe UI",
  });
  s.addText("myDiL · FabLab DiL · 2026", {
    x: 1.2, y: 3.9, w: 10, h: 0.4,
    fontSize: 13, color: C.gray, fontFace: "Segoe UI",
  });
  [C.yellow, C.blue, C.red, C.navy].forEach((c, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: 10.8, y: 1.5 + i * 0.85, w: 0.22, h: 0.22,
      fill: { color: c }, line: { color: c, width: 0 },
    });
  });
}

// ─── EXPORT ───────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: "myDiL_Presentation_Stage.pptx" })
  .then(() => console.log("✓  myDiL_Presentation_Stage.pptx généré dans c:\\Users\\Hakem\\myDil\\"))
  .catch(e => console.error("Erreur :", e));
