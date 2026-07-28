import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const password = await bcrypt.hash("student123", 10);

  const user = await prisma.user.upsert({
    where: { email: "etudiant@mydil.fr" },
    update: {},
    create: {
      email: "etudiant@mydil.fr",
      password,
      firstName: "Thomas",
      lastName: "Besse",
      role: "STUDENT",
    },
  });

  return NextResponse.json({ ok: true, id: user.id, email: user.email });
}
