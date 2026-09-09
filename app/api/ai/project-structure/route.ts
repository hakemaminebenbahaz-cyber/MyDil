import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface MaterialCheck {
  name: string;
  available: boolean;
  matchedEquipment: string | null;
}

interface ParsedResponse {
  steps: string[];
  materials: MaterialCheck[];
  verdict: "faisable" | "partiel" | "non_faisable";
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();
    if (!idea?.trim()) {
      return NextResponse.json({ error: "Décris ton idée de projet" }, { status: 400 });
    }

    // Inventaire réel du lab — donné en contexte au modèle pour qu'il juge la
    // faisabilité sur le vrai matériel disponible, plutôt que par similarité de
    // mots (qui produit trop de faux positifs sur du matériel absent : voir
    // historique du projet, une première version basée sur le score TF-IDF
    // d'Ask Hanen confondait par exemple "découpe laser" avec un simple
    // "Wireless Presenter" à cause d'un chevauchement de mots fortuit).
    const equipment = await prisma.equipment.findMany({
      where: { loanable: true },
      select: { name: true, category: true, brand: true, model: true },
    });
    const inventoryList = equipment
      .map(e => `- ${e.name}${e.brand ? ` (${e.brand}${e.model ? " " + e.model : ""})` : ""} [${e.category}]`)
      .join("\n");

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "Tu es l'assistant du Digital Innovation Lab (myDiL) d'EPSI/WIS, un FabLab. Tu réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour. Tu ne dois JAMAIS inventer qu'un équipement est disponible s'il n'apparaît pas explicitement dans la liste d'inventaire fournie.",
        },
        {
          role: "user",
          content: `Voici l'inventaire réel du FabLab myDiL (seul matériel réellement disponible) :
${inventoryList}

Idée de projet d'un étudiant : "${idea}"

1. Propose une structure de projet (4 à 7 grandes étapes de réalisation, dans l'ordre).
2. Liste le matériel générique nécessaire (4 à 8 éléments, noms courts).
3. Pour CHAQUE élément de matériel, indique s'il correspond à un équipement RÉELLEMENT présent dans la liste d'inventaire ci-dessus (compare par correspondance de sens, pas seulement de mots — par exemple un "microcontrôleur Wi-Fi" correspond à un "ESP32"). Si aucun équipement de la liste ne correspond, marque-le comme non disponible : n'invente rien.
4. Donne un verdict global de faisabilité.

Réponds avec ce JSON exact :
{"steps":["étape1",...],"materials":[{"name":"nom générique","available":true|false,"matchedEquipment":"nom exact de l'inventaire ou null"}],"verdict":"faisable"|"partiel"|"non_faisable","message":"une phrase résumant la faisabilité, mentionnant le matériel manquant s'il y en a"}

Règles pour le verdict : "faisable" si tout ou presque tout le matériel est disponible, "partiel" si une partie manque mais le projet reste réalisable en substituant/adaptant, "non_faisable" si le matériel essentiel manque.`,
        },
      ],
    });

    const text = (completion.choices[0].message.content ?? "").trim();
    let parsed: ParsedResponse;
    try {
      const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      parsed = JSON.parse(clean);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match
        ? JSON.parse(match[0])
        : { steps: [], materials: [], verdict: "non_faisable", message: "Impossible d'analyser la réponse de l'IA." };
    }

    const validVerdicts = ["faisable", "partiel", "non_faisable"];
    if (!validVerdicts.includes(parsed.verdict)) parsed.verdict = "non_faisable";

    return NextResponse.json({
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      materials: Array.isArray(parsed.materials) ? parsed.materials : [],
      feasibility: { verdict: parsed.verdict, message: parsed.message ?? "" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AI Project Structure Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
