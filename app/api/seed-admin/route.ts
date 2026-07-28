import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const password = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@mydil.fr" },
    update: {},
    create: {
      email: "admin@mydil.fr",
      password,
      firstName: "Admin",
      lastName: "myDiL",
      role: "ADMIN",
    },
  });

  return NextResponse.json({ ok: true, id: user.id, email: user.email });
}
