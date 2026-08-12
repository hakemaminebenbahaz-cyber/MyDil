import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const equipmentId = searchParams.get("equipmentId");

    const entries = await prisma.waitlist.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(equipmentId ? { equipmentId } : {}),
      },
      orderBy: { createdAt: "asc" },
      include: {
        equipment: { select: { id: true, name: true, imageUrl: true, status: true, internalId: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json(entries);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, equipmentId } = await req.json();
    if (!userId || !equipmentId) {
      return NextResponse.json({ error: "userId et equipmentId requis" }, { status: 400 });
    }

    const entry = await prisma.waitlist.upsert({
      where: { userId_equipmentId: { userId, equipmentId } },
      update: {},
      create: { userId, equipmentId },
      include: {
        equipment: { select: { id: true, name: true, imageUrl: true, status: true, internalId: true } },
      },
    });

    const position = await prisma.waitlist.count({
      where: { equipmentId, createdAt: { lte: entry.createdAt } },
    });

    return NextResponse.json({ ...entry, position }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const equipmentId = searchParams.get("equipmentId");
    if (!userId || !equipmentId) {
      return NextResponse.json({ error: "userId et equipmentId requis" }, { status: 400 });
    }

    await prisma.waitlist.delete({
      where: { userId_equipmentId: { userId, equipmentId } },
    }).catch(() => null); // déjà absent : pas grave

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
