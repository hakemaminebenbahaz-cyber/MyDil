import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Route publique (pas d'auth requise — la Vitrine est accessible sans compte).
// Le "j'aime"/"je n'aime plus" côté utilisateur est mémorisé en localStorage
// dans le navigateur (voir app/projets/page.tsx) ; ici on ne fait que
// incrémenter/décrémenter le compteur en base de façon atomique.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await req.json().catch(() => ({ action: "like" }));

    const project = await prisma.project.update({
      where: { id },
      data: { likes: { increment: action === "unlike" ? -1 : 1 } },
      select: { id: true, likes: true },
    });

    return NextResponse.json({ id: project.id, likes: Math.max(0, project.likes) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
