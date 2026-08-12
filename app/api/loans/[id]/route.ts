import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

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
        equipment: { select: { id: true, name: true, status: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });

    // Synchronise le statut de l'équipement avec l'emprunt (jamais fait
    // ailleurs dans l'app — le matériel restait "Disponible" indéfiniment).
    let waitlistNotified = 0;
    if (status === "APPROVED") {
      await prisma.equipment.update({
        where: { id: loan.equipment.id },
        data: { status: "LOANED" },
      });
    } else if (status === "RETURNED" || status === "REFUSED") {
      await prisma.equipment.updateMany({
        where: { id: loan.equipment.id, status: { not: "MAINTENANCE" } },
        data: { status: "AVAILABLE" },
      });

      if (status === "RETURNED") {
        const result = await prisma.waitlist.updateMany({
          where: { equipmentId: loan.equipment.id, notified: false },
          data: { notified: true },
        });
        waitlistNotified = result.count;
      }
    }

    return NextResponse.json({ ...loan, waitlistNotified });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
