import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();

    if (!name?.trim() && !description?.trim()) {
      return NextResponse.json({ error: "Nom ou description requis" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "Tu es assistant du Digital Innovation Lab d'EPSI/WIS. Tu réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour.",
        },
        {
          role: "user",
          content: `Nom du projet : "${name || ""}"
Description : "${description || ""}"

Propose des suggestions adaptées. Réponds avec ce JSON exact :
{"technologies":["tech1","tech2",...],"keywords":["mot1","mot2",...],"type":"WORKSHOP"|"OPEN_INNOV"|"ACADEMIC"}

Règles :
- technologies : 5 à 8 outils/langages réellement utilisés pour ce type de projet
- keywords : 4 à 7 mots-clés du domaine
- type : WORKSHOP (atelier), OPEN_INNOV (innovation/prototype), ACADEMIC (cours/mémoire)`,
        },
      ],
    });

    const text = (completion.choices[0].message.content ?? "").trim();

    let parsed: { technologies: string[]; keywords: string[]; type: string };
    try {
      const clean = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      parsed = JSON.parse(clean);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { technologies: [], keywords: [], type: "ACADEMIC" };
    }

    const validTypes = ["WORKSHOP", "OPEN_INNOV", "ACADEMIC"];
    if (!validTypes.includes(parsed.type)) parsed.type = "ACADEMIC";

    return NextResponse.json({
      technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      type: parsed.type,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AI Project Suggest Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
