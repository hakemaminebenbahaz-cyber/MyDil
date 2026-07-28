import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, equipmentId, startDate, endDate, note } = body;

    if (!userId || !equipmentId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const loan = await prisma.loan.create({
      data: {
        userId,
        equipmentId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        note: note || null,
        status: "PENDING",
      },
      include: {
        equipment: { select: { name: true, internalId: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const loans = await prisma.loan.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        equipment: { select: { name: true, internalId: true, category: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return NextResponse.json(loans);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
