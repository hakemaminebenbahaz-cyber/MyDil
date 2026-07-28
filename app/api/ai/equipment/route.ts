import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FLASK_URL = process.env.FLASK_AI_URL ?? "http://localhost:5001";

type FlaskRec = {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category: string;
  description?: string;
  score: number;
  reason: string;
};

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description?.trim()) {
      return NextResponse.json({ error: "Description requise" }, { status: 400 });
    }

    // Appel au modèle IA local (Flask)
    const flaskRes = await fetch(`${FLASK_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, top_k: 5 }),
      signal: AbortSignal.timeout(8000),
    });

    if (!flaskRes.ok) {
      throw new Error(`Serveur IA inaccessible (${flaskRes.status}) — lance python ai_model/api.py`);
    }

    const flaskData = await flaskRes.json();

    // Enrichit avec les données live de la DB (si dispo)
    const dbEquipment = await prisma.equipment.findMany({
      where: { status: "AVAILABLE", loanable: true },
      select: {
        id: true, name: true, brand: true, model: true,
        category: true, description: true, quantity: true, imageUrl: true,
      },
    }).catch(() => []);

    const dbMap = new Map(dbEquipment.map(e => [e.name.toLowerCase(), e]));

    const enriched = (flaskData.recommendations ?? [] as FlaskRec[]).map((rec: FlaskRec) => {
      const dbMatch = dbMap.get(rec.name.toLowerCase());
      if (dbMatch) {
        return { ...dbMatch, reason: rec.reason, score: rec.score };
      }
      return {
        id: rec.id,
        name: rec.name,
        brand: rec.brand ?? null,
        model: rec.model ?? null,
        category: rec.category,
        description: rec.description ?? null,
        quantity: 1,
        imageUrl: null,
        reason: rec.reason,
        score: rec.score,
      };
    });

    const count = enriched.length;
    const summary = count > 0
      ? `${count} équipement${count > 1 ? "s" : ""} correspond${count === 1 ? "" : "ent"} à votre projet.`
      : "Aucun équipement correspondant n'a été trouvé.";

    return NextResponse.json({
      recommendations: enriched,
      summary,
      model: flaskData.model,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AI Equipment Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
