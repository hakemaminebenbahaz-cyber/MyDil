import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const equipmentCount = await prisma.equipment.count();
    return NextResponse.json({ ok: true, users: userCount, equipment: equipmentCount });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
