import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const equipment = await prisma.equipment.findMany({
    orderBy: { internalId: "asc" },
  });
  return NextResponse.json(equipment);
}

async function searchProductImage(query: string): Promise<string | null> {
  try {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;

    const htmlRes = await fetch(searchUrl, {
      headers: { "User-Agent": ua },
      signal: AbortSignal.timeout(8000),
    });
    const html = await htmlRes.text();

    const vqdMatch = html.match(/vqd=["']([^"']+)["']/);
    if (!vqdMatch) return null;
    const vqd = vqdMatch[1];

    const imgUrl = `https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(query)}&vqd=${encodeURIComponent(vqd)}&f=,,,&p=1`;
    const imgRes = await fetch(imgUrl, {
      headers: { "User-Agent": ua, "Referer": "https://duckduckgo.com/" },
      signal: AbortSignal.timeout(8000),
    });
    const data = await imgRes.json();

    return data.results?.[0]?.image ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();

  const equipment = await prisma.equipment.create({
    data: {
      internalId:  body.internalId  ?? null,
      name:        body.name,
      model:       body.model       ?? null,
      brand:       body.brand       ?? null,
      reference:   body.reference   ?? null,
      category:    body.category,
      status:      body.status      ?? "AVAILABLE",
      condition:   body.condition   ?? "GOOD",
      location:    body.location    ?? null,
      quantity:    body.quantity    ?? 1,
      description: body.description ?? null,
      loanable:    body.loanable    ?? true,
    },
  });

  // Recherche automatique d'image en arrière-plan
  const query = [body.name, body.brand, body.model].filter(Boolean).join(" ");
  searchProductImage(query).then(async (imageUrl) => {
    if (imageUrl) {
      await prisma.equipment.update({
        where: { id: equipment.id },
        data: { imageUrl },
      });
    }
  }).catch(() => {});

  return NextResponse.json(equipment, { status: 201 });
}
