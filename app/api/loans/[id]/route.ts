import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, returnedAt } = body;

    const loan = await prisma.loan.update({
      where: { id },
      data: {
        status,
        ...(returnedAt ? { returnedAt: new Date(returnedAt) } : {}),
      },
      include: {
        equipment: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(loan);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
